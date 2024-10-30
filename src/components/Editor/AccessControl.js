// src/components/Editor/AccessControl.js

"use client";

import { useState } from "react";
import { doc, updateDoc } from "../../../firebase";
import { firestore, findUserByIdentifier } from "../../../firebase";


const AccessControl = ({ documentId }) => {
  const [inviteInput, setInviteInput] = useState("");
  const [role, setRole] = useState("editor"); // default role
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleAddUser = async () => {
    setMessage(null);
    setError(null);
    
    try {
      const userData = await findUserByIdentifier(inviteInput);

      if (!userData) {
        setError("User not found.");
        return;
      }

      const roleField = role === "editor" ? `editors.${userData.uid}` : `viewers.${userData.uid}`;
      
      await updateDoc(doc(firestore, "documents", documentId), {
        [roleField]: true,
      });

      setMessage(`Successfully added ${inviteInput} as ${role}`);
      setInviteInput("");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inviteInput}
        onChange={(e) => setInviteInput(e.target.value)}
        placeholder="Email or username#ID"
        className="p-2 rounded-sm border border-gray-300"
      />
      
      <select onChange={(e) => setRole(e.target.value)} value={role} className="ml-2 p-2 rounded-sm border border-gray-300">
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      
      <button onClick={handleAddUser} className="ml-2 p-2 rounded-sm bg-blue-500 text-white">
        Add {role.charAt(0).toUpperCase() + role.slice(1)}
      </button>

      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AccessControl;
