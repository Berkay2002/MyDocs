// src/hooks/useDocumentPresence.js

"use client";

import { useEffect } from "react";
import { doc, setDoc, deleteDoc, serverTimestamp } from "../../firebase";
import { firestore } from "../../firebase";
import { useAuth } from "../../AuthContext";

const useDocumentPresence = (documentId) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!documentId || !user) return;

    const presenceRef = doc(
      firestore,
      `documents/${documentId}/presence`,
      user.uid
    );

    const setPresence = async () => {
      try {
        await setDoc(
          presenceRef,
          {
            userId: user.uid,
            username: user.displayName || "Anonymous",
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error setting presence:", error);
      }
    };

    setPresence();

    const interval = setInterval(() => {
      setPresence();
    }, 60000); // Update every 60 seconds

    return () => {
      deleteDoc(presenceRef);
      clearInterval(interval);
    };
  }, [documentId, user]);
};

export default useDocumentPresence;
