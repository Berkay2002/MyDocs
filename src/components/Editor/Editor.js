// src/components/Editor/Editor.js

"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, onSnapshot, getDoc } from "../../../firebase";
import { firestore } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import CommentSection from "./CommentSection";
import PresenceIndicator from "./PresenceIndicator";
import AccessControl from "./AccessControl";
import Grid from "@mui/material/Grid2"; 
import useDocumentPresence from "../../hooks/useDocumentPresence";


const Editor = ({ documentId }) => {
  const { user } = useAuth();
  const [documentData, setDocumentData] = useState(null);
  const [content, setContent] = useState("");
  const [editPermission, setEditPermission] = useState(false);
  

  // Use the presence hook
  useDocumentPresence(documentId);
  
  useEffect(() => {
    console.log("Fetching document with ID:", documentId);
    if (!documentId || !user) return;

    const fetchDocumentData = async () => {
      try {
        const docRef = doc(firestore, "documents", documentId);

        // Retrieve document data using getDoc for error handling
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocumentData(data);
          setContent(data.content || "");

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
          setContent(data.content || "");

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

  const handleContentChange = async (e) => {
    setContent(e.target.value);
    if (editPermission) {
      try {
        const docRef = doc(firestore, "documents", documentId);
        await updateDoc(docRef, { content: e.target.value });
      } catch (error) {
        console.error("Error updating document:", error.message);
      }
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
    <div className="editor-container p-4">
      <h2 className="text-2xl font-bold mb-4">{documentData.title}</h2>
      <PresenceIndicator documentId={documentId} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="editor-textarea w-full h-96 p-2 border rounded"
            placeholder="Start typing..."
          />
          {documentData.ownerId === user.uid && (
            <AccessControl
              documentId={documentId}
              ownerId={documentData.ownerId}
              userId={user.uid}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <CommentSection documentId={documentId} />
        </Grid>
      </Grid>
    </div>
  );
};

export default Editor;
