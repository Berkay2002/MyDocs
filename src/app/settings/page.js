// src/app/settings/page.js
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../AuthContext";
import { firestore, doc, getDoc, updateDoc, getDocs, query, collection, where } from "../../../firebase";
import { useRouter } from "next/navigation";


const UserSettings = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserProfile = async () => {
      const userRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
        setUserId(userDoc.data().userId);
      }
    };
    fetchUserProfile();
  }, [user, router]);

  const generateFourDigitID = () => Math.floor(1000 + Math.random() * 9000).toString();

  const isUniqueUsernameID = async (newUsername, newUserId) => {
    const usernamesQuery = query(
      collection(firestore, "users"),
      where("username", "==", newUsername),
      where("userId", "==", newUserId)
    );
    const snapshot = await getDocs(usernamesQuery);
    return snapshot.empty;
  };

  const handleUpdateUsername = async () => {
    try {
      const isUnique = await isUniqueUsernameID(username, userId);
      if (!isUnique) {
        setUpdateError("Username#ID already taken. Try another.");
        return;
      }

      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, { username });
      setSuccessMessage("Username updated successfully!");
      setUpdateError("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("An error occurred. Please try again.");
    }
  };

  const handleRegenerateID = async () => {
    const newUserId = generateFourDigitID();
    try {
      const isUnique = await isUniqueUsernameID(username, newUserId);
      if (!isUnique) {
        setUpdateError("Generated ID is already taken. Try again.");
        return;
      }

      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, { userId: newUserId });
      setUserId(newUserId);
      setSuccessMessage("ID updated successfully!");
      setUpdateError("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl">User Settings</h2>
      {user && (
        <>
          <p className="text-lg">Current Username: {username}#{userId}</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
            className="p-2 mt-4 rounded-sm"
          />
          <button
            onClick={handleUpdateUsername}
            className="p-2 mt-2 rounded-sm bg-blue-500 text-white"
          >
            Update Username
          </button>
          <button
            onClick={handleRegenerateID}
            className="p-2 mt-2 rounded-sm bg-green-500 text-white"
          >
            Generate New ID
          </button>
          {updateError && <p className="text-red-500">{updateError}</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </>
      )}
    </div>
  );
};

export default UserSettings;
