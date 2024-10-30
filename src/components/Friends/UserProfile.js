// src/components/Friends/UserProfile.js
import { useState } from "react";
import { findUserByIdentifier, sendFriendRequest } from "../../../firebase";

const UserProfile = ({ currentUserId }) => {
  const [friendIdentifier, setFriendIdentifier] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSendRequest = async () => {
    const friendData = await findUserByIdentifier(friendIdentifier);
    if (!friendData) {
      setStatusMessage("User not found.");
      return;
    }

    try {
      await sendFriendRequest(currentUserId, friendData.uid);
      setStatusMessage("Friend request sent!");
    } catch (error) {
      setStatusMessage("Error sending friend request.");
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={friendIdentifier}
        onChange={(e) => setFriendIdentifier(e.target.value)}
        placeholder="Email or username#ID"
        className="p-2 rounded-sm border border-gray-300"
      />
      <button onClick={handleSendRequest} className="ml-2 p-2 rounded-sm bg-blue-500 text-white">
        Send Friend Request
      </button>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default UserProfile;
