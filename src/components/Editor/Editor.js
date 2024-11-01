// src/components/Editor/Editor.js

"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import {
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../../../firebase";
import { firestore } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import useDocumentPresence from "../../hooks/useDocumentPresence";
import { saveCursorPosition, restoreCursorPosition } from "./cursorUtils";

// For the Profile Picture
import ProfileIcon from "../Navbar/ProfileIcon";

// For the file logic
import FileMenu from "./FileMenu";
import AccessControl from "./AccessControl";
import CommentSection from "./CommentSection";

import {
  Button,
  IconButton,
  TextField,
  Modal,
  Box,
  Typography,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Yjs imports
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Dynamic import for EditorComponent
const EditorComponent = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

const Editor = ({ documentId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [documentData, setDocumentData] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editPermission, setEditPermission] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleCommentsToggle = () => {
    setIsCommentsOpen((prev) => !prev);
  };

  // Presence hook (assuming you have a useDocumentPresence hook)
  useDocumentPresence(documentId);

  // Fetch user profile image
  useEffect(() => {
    if (user) {
      setProfileImage(user.photoURL || "/default-profile.jpg");
    }
  }, [user]);

  // Yjs setup
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () =>
      new WebsocketProvider(
        'wss://yjs-websocket-server-0j6z.onrender.com', // Your deployed WebSocket server URL
        documentId,
        ydoc
      ),
    [documentId, ydoc]
  );
  const yText = useMemo(() => ydoc.getText("content"), [ydoc]);

  // Load initial document data and content
  useEffect(() => {
    if (!documentId || !user) return;

    const fetchDocumentData = async () => {
      try {
        const docRef = doc(firestore, "documents", documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocumentData(data);
          setNewTitle(data.title);

          // Load initial content into yText
          if (data.content) {
            ydoc.transact(() => {
              yText.delete(0, yText.length);
              yText.insert(0, JSON.stringify(data.content));
            });
          }

          setLastUpdated(data.lastModified?.toDate());

          // Check user permissions based on roles
          const isOwner = data.ownerId === user.uid;
          const isEditor = data.editors && data.editors[user.uid] === true;
          setEditPermission(isOwner || isEditor);
        } else {
          console.log("No document found with the given ID.");
        }
      } catch (error) {
        console.error("Firestore error:", error.message);
      }
    };

    fetchDocumentData();

    // Listen for changes in document data (excluding content)
    const unsubscribe = onSnapshot(
      doc(firestore, "documents", documentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setLastUpdated(data.lastModified?.toDate());
        }
      },
      (error) => {
        console.error("Firestore error:", error.message);
      }
    );

    return () => {
      unsubscribe();
      provider.destroy(); // Clean up the WebSocket provider
      ydoc.destroy(); // Destroy the Yjs document
    };
  }, [documentId, user, yText, ydoc, provider]);

  // Observe changes in yText and update editorState
  useEffect(() => {
    const updateEditorState = () => {
      const contentString = yText.toString();
      if (contentString) {
        try {
          const content = JSON.parse(contentString);
          const contentState = convertFromRaw(content);
          setEditorState(EditorState.createWithContent(contentState));
        } catch (e) {
          console.error("Failed to parse content from yText:", e);
        }
      } else {
        setEditorState(EditorState.createEmpty());
      }
    };

    yText.observe(updateEditorState);

    // Initialize editorState
    updateEditorState();

    return () => yText.unobserve(updateEditorState);
  }, [yText]);

  // Update yText when editorState changes
  const handleEditorStateChange = (newState) => {
    if (!editPermission) return;
    setEditorState(newState);
    const content = convertToRaw(newState.getCurrentContent());

    ydoc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, JSON.stringify(content));
    });
  };

  // Periodically backup Yjs content to Firestore
  useEffect(() => {
    const backupToFirestore = async () => {
      const docRef = doc(firestore, "documents", documentId);
      try {
        await setDoc(
          docRef,
          {
            content: JSON.parse(yText.toString()),
            lastModified: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error backing up to Firestore:", error);
      }
    };

    const interval = setInterval(backupToFirestore, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [documentId, yText]);

  // Handle sharing modal
  const handleShareOpen = () => {
    setIsShareOpen(true);
  };

  const handleShareClose = () => {
    setIsShareOpen(false);
  };

  // Handle document title editing
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (newTitle.trim() === "") return;
    try {
      const docRef = doc(firestore, "documents", documentId);
      await updateDoc(docRef, { title: newTitle });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating title:", error.message);
    }
  };

  if (!documentData) {
    return <p>Loading document...</p>;
  }

  if (!editPermission) {
    return <p>You do not have permission to edit this document.</p>;
  }

  if (!user) {
    return <p>Loading...</p>; // Or redirect to login
  }

  return (
    <div className="editor-container">
      {/* Editor Header */}
      <header className="flex justify-between items-center p-3 pb-1 editor-header">
        <Link href="/" legacyBehavior>
          <a className="flex items-center mr-3">
            <Image src="/MainLogo.svg" alt="Main Logo" width={50} height={50} />
          </a>
        </Link>
        <div className="flex-grow px-2">
          <div className="flex space-x-5">
            {isEditingTitle ? (
              <TextField
                value={newTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                autoFocus
                variant="outlined"
                size="small"
              />
            ) : (
              <h2 className="text-lg font-bold" onClick={handleTitleEdit}>
                {documentData.title}
              </h2>
            )}
            <div className="text-gray-500 flex items-center">
              <Image
                src="/saved.svg"
                alt="Save Icon"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <p className="ml-2">All changes saved</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-gray-600 text-sm -ml-1 h-8">
            <FileMenu
              documentId={documentId}
              onShareOpen={handleShareOpen}
              documentData={documentData}
            />
            <p className="option">Edit</p>
            <p className="option">Insert</p>
            <p className="option">View</p>
            <p className="option">Format</p>
            <p className="option">Tools</p>
            {lastUpdated && (
              <p className="text-gray-500 underline ml-3">
                Last edit was {moment(lastUpdated).calendar()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <IconButton
            color="primary"
            className="hidden md:inline-flex h-10"
            onClick={handleCommentsToggle}
          >
            <CommentIcon fontSize="large" />
          </IconButton>
          <Button
            color="primary"
            variant="contained"
            className="hidden md:inline-flex h-10"
            size="medium"
            onClick={handleShareOpen}
          >
            Share
          </Button>
          <ProfileIcon />
        </div>
      </header>

      {/* Editor and Floating Panel Container */}
      <div className="editor-main bg-[#F8F9FA] flex flex-grow">
        <div className="rdw-editor-toolbar rounded-lg">
          {/* Toolbar content */}
        </div>
        <div className="flex-grow">
          <EditorComponent
            editorState={editorState}
            toolbarClassName="sticky top-0 z-50 !justify-center"
            editorClassName="bg-white mt-6 shadow-lg w-3/4 lg:w-3/5 mx-auto p-10 border mb-10 min-h-screen editor-component"
            onEditorStateChange={handleEditorStateChange}
          />
        </div>

        {/* Floating Panel */}
        {isCommentsOpen && (
          <div
            className="floating-panel"
            style={{
              width: "20%",
              height: "calc(100vh - 64px)",
              position: "fixed",
              top: "64px",
              right: "0",
              backgroundColor: "white",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          >
            <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
              <Typography
                variant="h6"
                gutterBottom
                style={{ position: "relative" }}
              >
                <IconButton
                  onClick={handleCommentsToggle}
                  style={{ position: "absolute", top: 0, right: 0 }}
                >
                  <CloseIcon />
                </IconButton>
              </Typography>
              <CommentSection
                documentId={documentId}
                onClose={handleCommentsToggle}
              />
            </Box>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Modal
        open={isShareOpen}
        onClose={handleShareClose}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="share-modal-title" variant="h6" component="h2">
            Share Document
          </Typography>
          <AccessControl documentId={documentId} />
          <Button onClick={handleShareClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Editor;
