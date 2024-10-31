// src/components/Editor/CommentSection.js

"use client";

import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  firestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "../../../firebase";

import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";


const CommentSection = ({ documentId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // State variables for menu and editing
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    if (!documentId) return;

    const commentsRef = collection(firestore, `documents/${documentId}/comments`);
    const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [documentId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      const commentsRef = collection(firestore, `documents/${documentId}/comments`);
      await addDoc(commentsRef, {
        userId: user.uid,
        username: user.displayName,
        content: newComment,
        timestamp: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (editCommentContent.trim() === "") return;
    const commentRef = doc(firestore, `documents/${documentId}/comments`, commentId);
    await updateDoc(commentRef, { content: editCommentContent });
    setEditCommentId(null); // Close edit mode
  };

  const handleDeleteComment = async (commentId) => {
    const commentRef = doc(firestore, `documents/${documentId}/comments`, commentId);
    await deleteDoc(commentRef);
  };

  const handleMenuClick = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const openEditMode = () => {
    setEditCommentId(selectedComment.id);
    setEditCommentContent(selectedComment.content);
    handleMenuClose();
  };

  if (!user) {
    return <p>You must be logged in to comment.</p>;
  }
  

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f9' }}>
      <h5>Comments</h5>
      <form onSubmit={handleAddComment} className="flex flex-col mb-4">
        <TextField
          variant="outlined"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2"
        />
        <Button type="submit" variant="contained" color="primary">
          Post
        </Button>
      </form>
      <List className="space-y-2">
        {comments.map((comment) => (
          <ListItem key={comment.id} className="border-b border-gray-200 pb-2">
            {editCommentId === comment.id ? (
              <div className="w-full flex items-center">
                <TextField
                  variant="outlined"
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                  fullWidth
                />
                <Button onClick={() => handleEditComment(comment.id)}>Save</Button>
              </div>
            ) : (
              <>
                <ListItemText
                  primary={`${comment.username}: ${comment.content}`}
                />
                <IconButton
                  onClick={(e) => handleMenuClick(e, comment)}
                >
                  <MoreVertIcon />
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>

      {/* Single Menu Component */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={openEditMode}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteComment(selectedComment.id);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default CommentSection;