
"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, firestore } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { defaultThumbnailUrl } from "../../../firebase"; // Import the default thumbnail URL

const SharedDocuments = ({ user }) => {
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const docsRef = collection(firestore, "documents");

    const sharedQuery = query(
      docsRef,
      where(`viewers.${user.uid}`, "==", true)
    );

    const unsubscribe = onSnapshot(sharedQuery, (snapshot) => {
      const sharedDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSharedDocuments(sharedDocs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenDoc = (docId) => {
    router.push(`/editor/${docId}`);
  };

  return (
    <section className="bg-white px-7 sm:px-10 py-5">
      <div className="max-w-3xl mx-auto grid grid-cols-12 items-center gap-x-4 gap-y-4 text-sm text-gray-700">
        <h2 className="col-span-7 md:col-span-8 font-semibold">
          Shared with Me
        </h2>
        <p className="col-span-3">Last Modified</p>
        <div className="col-span-2 md:col-span-1">
          {/* Optional: Add an icon or leave empty */}
        </div>
        <hr className="col-span-12 my-2 w-full bg-gray-400" />
        {sharedDocuments.length === 0 ? (
          <p className="col-span-12">No shared documents.</p>
        ) : (
          sharedDocuments.map((docData) => (
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
                    <IconButton>
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
    </section>
  );
};

export default SharedDocuments;
