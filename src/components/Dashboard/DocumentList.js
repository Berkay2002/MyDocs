// src/components/DocumentList.js

"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, firestore, doc, updateDoc, deleteDoc, serverTimestamp } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { defaultThumbnailUrl } from "../../../firebase"; // Import the default thumbnail URL

const DocumentList = ({ initialDocs, user }) => {
  const [ownerDocuments, setOwnerDocuments] = useState([]);
  const [editorDocuments, setEditorDocuments] = useState([]);
  const [documents, setDocuments] = useState(initialDocs || []);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (!user) return;

    const docsRef = collection(firestore, "documents");

    const ownerQuery = query(docsRef, where("ownerId", "==", user.uid));
    const editorQuery = query(docsRef, where(`editors.${user.uid}`, "==", true));

    const unsubscribeOwner = onSnapshot(ownerQuery, (ownerSnapshot) => {
      const ownerDocs = ownerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOwnerDocuments(ownerDocs);
    });

    const unsubscribeEditor = onSnapshot(editorQuery, (editorSnapshot) => {
      const editorDocs = editorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEditorDocuments(editorDocs);
    });

    return () => {
      unsubscribeOwner();
      unsubscribeEditor();
    };
  }, [user]);

  useEffect(() => {
    const mergedDocs = [...ownerDocuments, ...editorDocuments];
    const uniqueDocsMap = new Map();
    mergedDocs.forEach((doc) => {
      uniqueDocsMap.set(doc.id, doc);
    });
    setDocuments(Array.from(uniqueDocsMap.values()));
  }, [ownerDocuments, editorDocuments]);

  const handleOpenDoc = (docId) => {
    router.push(`/editor/${docId}`);
  };

  const handleMenuOpen = (event, doc) => {
    event.stopPropagation();
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
    const confirmDelete = confirm(`Are you sure you want to delete "${selectedDoc.title}"?`);
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
    <section className="bg-white px-7 sm:px-10 py-5">
      <div className="max-w-3xl mx-auto grid grid-cols-12 items-center gap-x-4 text-sm text-gray-700">
        <h2 className="col-span-7 md:col-span-8 font-semibold">
          Recent Documents
        </h2>
        <p className="col-span-3">Last Modified</p>
        <div className="col-span-2 md:col-span-1">
          {/* Optional: Add an icon or leave empty */}
        </div>
        <hr className="col-span-12 my-2 w-full bg-gray-400" />
        {documents.length === 0 ? (
          <p className="col-span-12">No recent documents.</p>
        ) : (
          documents.map((docData) => (
            <div key={docData.id} className="col-span-12">
              <Card className="flex items-center p-4 hover:bg-gray-100 cursor-pointer" onClick={() => handleOpenDoc(docData.id)}>
                {/* Snapshot Image */}
                <img
                  src={docData.thumbnailUrl || defaultThumbnailUrl}
                  alt={`${docData.title} Snapshot`}
                  className="w-16 h-16 mr-4 object-cover rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultThumbnailUrl; }} // Fallback to default if image fails to load
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <Typography variant="subtitle1" noWrap>
                      {docData.title}
                    </Typography>
                    <IconButton onClick={(e) => handleMenuOpen(e, docData)}>
                      <MoreVertIcon />
                    </IconButton>
                  </div>
                  <Typography variant="caption" color="textSecondary">
                    Last modified: {docData.lastModified ? new Date(docData.lastModified.seconds * 1000).toLocaleString() : "N/A"}
                  </Typography>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </section>
  );
};

export default DocumentList;
