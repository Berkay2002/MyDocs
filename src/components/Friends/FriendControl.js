// src/components/FriendControl.js
import { useState } from "react";
import { findUserByIdentifier, sendFriendRequest } from "../../../firebase";
import { useAuth } from "../../../AuthContext";

const FriendControl = () => {
    const [searchInput, setSearchInput] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();
  
    const handleAddFriend = async () => {
      setMessage(null);
      setError(null);
  
      try {
        const userData = await findUserByIdentifier(searchInput);
  
        if (!userData) {
          setError("User not found.");
          return;
        }
  
        await sendFriendRequest(user.uid, userData.uid);
        setMessage(`Friend request sent to ${userData.username}#${userData.userId}`);
        setSearchInput("");
      } catch (error) {
        console.error("Error sending friend request:", error);
        setError("An error occurred. Please try again.");
      }
    };
  
    return (
      <div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Email or username#ID"
          className="p-2 rounded-sm border border-gray-300"
        />
        <button onClick={handleAddFriend} className="ml-2 p-2 rounded-sm bg-blue-500 text-white">
          Send Friend Request
        </button>
        {message && <p className="text-green-500 mt-2">{message}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  };
  
  export default FriendControl;