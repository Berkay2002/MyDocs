// src/components/Profile.js
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import { firestore, getDocs, query, collection, where } from "../../firebase";

const Profile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch user profile asynchronously inside useEffect
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
          setUserId(userDoc.data().userId);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const generateFourDigitID = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleUpdateProfile = () => {
    const newUserId = generateFourDigitID();
    isUniqueUsernameID(username, newUserId).then((isUnique) => {
      if (!isUnique) {
        setUpdateError("Username#ID already taken. Try another.");
        return;
      }

      const userRef = doc(firestore, "users", user.uid);
      updateDoc(userRef, { username, userId: newUserId })
        .then(() => {
          setUpdateError("");
          setSuccessMessage("Username and ID updated successfully!");
          setUserId(newUserId);
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          setUpdateError("An error occurred. Please try again.");
        });
    });
  };

  const isUniqueUsernameID = async (newUsername, newUserId) => {
    const usernamesQuery = query(
      collection(firestore, "users"),
      where("username", "==", newUsername),
      where("userId", "==", newUserId)
    );
    const snapshot = await getDocs(usernamesQuery);
    return snapshot.empty;
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl">Your Profile</h2>
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
            onClick={handleUpdateProfile}
            className="p-2 mt-2 rounded-sm bg-blue-500 text-white"
          >
            Update Username and Generate New ID
          </button>
          {updateError && <p className="text-red-500">{updateError}</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </>
      )}
    </div>
  );
};

export default Profile;
