"use client";

// React/Next imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";

// MUI imports
import { Button, IconButton, TextField, Typography, Box, Modal } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import CheckCircleIcon

// Quill
import QuillEditor from '../Quill/Quill';

// Project imports
import { useAuth } from "../../../AuthContext";
import { createDocument, getDocument, saveContent, updateDocument } from "../../services/firestoreService"; // Updated import
import ProfileIcon from "../Navbar/ProfileIcon";
import FileMenu from './FileMenu';
import AccessControl from "./AccessControl";
import CommentSection from "./CommentSection";

const Editor = ({ documentId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("Untitled Document");
  const [isSaved, setIsSaved] = useState("Saved");
  const [documentData, setDocumentData] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const data = await getDocument(documentId);
        if (data) {
          setDocumentData(data);
          setNewTitle(data.title);
          setLastUpdated(data.lastModified?.toDate());
          setContent(data.content); // Already decrypted in getDocument
        } else {
          console.log("No document found with the given ID.");
        }
      } catch (error) {
        console.error("Firestore error:", error.message);
      }
    };

    fetchDocumentData();
  }, [documentId]);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (newTitle.trim() === "") return;
    try {
      await updateDocument(documentId, { title: newTitle });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating title:", error.message);
    }
  };

  const handleShareOpen = () => {
    setIsShareOpen(true);
  };

  const handleShareClose = () => {
    setIsShareOpen(false);
  };

  const handleCommentsToggle = () => {
    setIsCommentsOpen((prev) => !prev);
  };

  const handleContentChange = async (newContent) => {
    setContent(newContent);
    setIsSaved("Saving...");

    try {
      await saveContent(documentId, newContent); // saveContent handles encryption
      setIsSaved("Saved");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error updating content:", error.message);
      setIsSaved("Error Saving");
    }
  };

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
                {newTitle}
              </h2>
            )}
            <div className="text-gray-500 flex items-center">
              {isSaved !== "Saving..." ? (
                <IconButton size="small">
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              )}
              <p className="ml-2">{isSaved}</p>
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

      {/* Quill Editor */}
      <QuillEditor documentId={documentId} value={content} onChange={handleContentChange} />

      {/* Floating Panel */}
      {isCommentsOpen && (
        <div
          style={{
            width: "400px",
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