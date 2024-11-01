// src/components/Editor/Editor.js

"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import debounce from "lodash/debounce";
import {
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "../../../firebase";
import { firestore } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import PresenceIndicator from "./PresenceIndicator";
import AccessControl from "./AccessControl";
import CommentSection from "./CommentSection";
import Grid from "@mui/material/Grid2";
import useDocumentPresence from "../../hooks/useDocumentPresence";

// For the Profile Picture
import SignOut from "../../components/Signout";
import ProfileIcon from "../Navbar/ProfileIcon";

// For the file logic
import FileMenu from './FileMenu';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button, IconButton, Icon } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import Modal from "@mui/material/Modal"; // Add this import
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CommentIcon from "@mui/icons-material/Comment"; // Import Comment Icon
import CloseIcon from '@mui/icons-material/Close'; // Add this import
import TextField from "@mui/material/TextField";

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
  const [isSaved, setIsSaved] = useState("Saved");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [isShareOpen, setIsShareOpen] = useState(false); // Add state for modal
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // Add state for comments
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

          if (data.content) {
            const contentState = convertFromRaw(data.content);
            setEditorState(EditorState.createWithContent(contentState));
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

    const unsubscribe = onSnapshot(
      doc(firestore, "documents", documentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDocumentData(data);
          setNewTitle(data.title);

          if (data.content) {
            const contentState = convertFromRaw(data.content);
            setEditorState(EditorState.createWithContent(contentState));
          }

          setLastUpdated(data.lastModified?.toDate());

          const isOwner = data.ownerId === user.uid;
          const isEditor = data.editors && data.editors[user.uid] === true;
          setEditPermission(isOwner || isEditor);
        } else {
          console.log("Document does not exist.");
        }
      }
    );

    return () => unsubscribe();
  }, [documentId, user]);

  const handleEditorStateChange = (state) => {
    setIsSaved("Saving...");
    setEditorState(state);
    saveContent(state);
  };

  const saveContent = useMemo(
    () =>
      debounce(async (state) => {
        if (!editPermission) return;
        try {
          const contentState = convertToRaw(state.getCurrentContent());
          const docRef = doc(firestore, "documents", documentId);
          await updateDoc(docRef, {
            content: contentState,
            lastModified: serverTimestamp(),
          });
          setIsSaved("Saved");
          setLastUpdated(new Date());
        } catch (error) {
          console.error("Error updating document:", error.message);
          setIsSaved("Error Saving");
        }
      }, 2000),
    [documentId, editPermission]
  );

  const handleShareOpen = () => {
    setIsShareOpen(true);
  };

  const handleShareClose = () => {
    setIsShareOpen(false);
  };

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
              {isSaved !== "Saving..." ? (
                <Image src="/saved.svg" alt="Save Icon" width={20} height={20} className="h-5 w-5" />
              ) : (
                <Icon name="cached" size="regular" />
              )}
              <p className="ml-2">{isSaved}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-gray-600 text-sm -ml-1 h-8">
            <FileMenu documentId={documentId} onShareOpen={handleShareOpen} documentData={documentData} /> {/* Pass props */}
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
        <div className="flex items-center space-x-4"> {/* Added space-x-4 and removed individual margins */}
          <IconButton
            color="primary"
            className="hidden md:inline-flex h-10" // Removed mr-4
            onClick={handleCommentsToggle} // Update to toggle comments
          >
            <CommentIcon fontSize="large" /> {/* Increase the size of the Comment Icon */}
          </IconButton>
          <Button
            color="primary"
            variant="contained"
            className="hidden md:inline-flex h-10"
            size="medium"
            onClick={handleShareOpen} // Add onClick handler
          >
            Share
          </Button>
          <ProfileIcon /> {/* Removed ml-6 */}
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
        {isCommentsOpen && ( // Render only when toggled
          <div className="floating-panel" style={{ width: '20%', height: 'calc(100vh - 64px)', position: 'fixed', top: '64px', right: '0', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}>
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom style={{ position: 'relative' }}>
                <IconButton
                  onClick={handleCommentsToggle} // Toggle on close
                  style={{ position: 'absolute', top: 0, right: 0 }}
                >
                  <CloseIcon />
                </IconButton>
              </Typography>
              <CommentSection documentId={documentId} onClose={handleCommentsToggle} /> {/* Use toggle handler */}
            </Box>
          </div>
        )}
      </div>

      {/* Presence Indicator */}
      {/*<PresenceIndicator documentId={documentId} />*/}

      {/* Share Modal */}
      <Modal
        open={isShareOpen}
        onClose={handleShareClose}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="share-modal-title" variant="h6" component="h2">
            Share Document
          </Typography>
          <AccessControl documentId={documentId} /> {/* Integrate AccessControl */}
          <Button onClick={handleShareClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Editor;