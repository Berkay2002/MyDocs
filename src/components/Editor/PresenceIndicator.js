// src/components/Editor/PresenceIndicator.js

"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "../../../firebase";
import { firestore } from "../../../firebase";

const PresenceIndicator = ({ documentId }) => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!documentId) return;

    const presenceRef = collection(firestore, `documents/${documentId}/presence`);

    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const users = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return data.username || "Unknown User";
      });
      setActiveUsers(users);
    });

    return () => unsubscribe();
  }, [documentId]);

  return (
    <div className="presence-indicator">
      {activeUsers.length > 0 ? (
        <p>Active users: {activeUsers.join(", ")}</p>
      ) : (
        <p>No other active users</p>
      )}
    </div>
  );
};

export default PresenceIndicator;
