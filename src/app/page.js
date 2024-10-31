// src/app/page.js

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import DocumentAdd from "../components/Dashboard/DocumentAdd";
import DocumentList from "../components/Dashboard/DocumentList";
import { collection, query, where, orderBy, getDocs, firestore } from "../../firebase";
import withAuth from "../utils/withAuth";
import RecentDocuments from "../components/Dashboard/RecentDocuments";
import SharedDocuments from "../components/Dashboard/SharedDocuments";

function Home() {
  const { user } = useAuth();
  const [initialDocs, setInitialDocs] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      try {
        const docsRef = collection(firestore, `userDocs/${user.email}/docs`);
        const q = query(docsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInitialDocs(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [user]);

  return (
    <>
      <DocumentAdd email={user?.email} />
      <DocumentList initialDocs={initialDocs} user={user} />
      <SharedDocuments user={user} />
    </>
  );
}

export default withAuth(Home); // Export the Home component wrapped with withAuth