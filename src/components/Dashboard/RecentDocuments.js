// src/components/dashboard/RecentDocuments.js
"use client";

import React, { useState, useEffect } from 'react'
import Grid from "@mui/material/Grid2";
import {
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';
import {
  firestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from '../../../firebase';
import { useAuth } from '../../../AuthContext';

const RecentDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const { user } = useAuth();
    const router = useRouter();
  
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
  
    useEffect(() => {
      if (!user) return;
  
      const docsRef = collection(firestore, "documents");
  
      // Query documents where the user is an editor or owner
      const q = query(
        docsRef,
        where(`editors.${user.uid}`, "==", true),
        orderBy("lastModified", "desc")
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(docs);
      });
  
      return () => unsubscribe();
    }, [user]);
  
    const handleOpenDoc = (docId) => {
      router.push(`/editor/${docId}`);
    };
  
    const handleMenuOpen = (event, doc) => {
      event.stopPropagation(); // Prevent triggering the card click event
      setAnchorEl(event.currentTarget);
      setSelectedDoc(doc);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
      setSelectedDoc(null);
    };
  
    const handleRename = async () => {
      const newTitle = prompt("Enter new document title:", selectedDoc.title);
      if (newTitle && newTitle !== selectedDoc.title) {
        try {
          const docRef = doc(firestore, "documents", selectedDoc.id);
          await updateDoc(docRef, {
            title: newTitle,
            lastModified: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error renaming document:", error);
        }
      }
      handleMenuClose();
    };
  
    const handleDelete = async () => {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${selectedDoc.title}"?`
      );
      if (confirmDelete) {
        try {
          const docRef = doc(firestore, "documents", selectedDoc.id);
          await deleteDoc(docRef);
        } catch (error) {
          console.error("Error deleting document:", error);
        }
      }
      handleMenuClose();
    };
  
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Recent Documents
        </Typography>
        {documents.length === 0 ? (
          <Typography>No recent documents.</Typography>
        ) : (
          <Grid container spacing={2}>
            {documents.map((docData) => (
              <Grid item xs={12} sm={6} md={3} key={docData.id}>
                <Card
                  sx={{
                    padding: 2,
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleOpenDoc(docData.id)}
                >
                  <div>
                    <Badge
                      color="secondary"
                      variant="dot"
                      invisible={!docData.isShared}
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {docData.title.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Tooltip title={docData.title}>
                      <Typography variant="subtitle1" noWrap>
                        {docData.title}
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="textSecondary">
                      Last modified:{" "}
                      {docData.lastModified
                        ? new Date(
                            docData.lastModified.seconds * 1000
                          ).toLocaleString()
                        : "N/A"}
                    </Typography>
                  </div>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, docData)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
  
        {/* Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRename}>Rename</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </div>
    );
  };
  
  export default RecentDocuments;