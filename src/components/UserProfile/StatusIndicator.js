// src/components/UserProfile/StatusIndicator.js
import { useEffect, useState } from "react";

const StatusIndicator = ({ userId }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Logic to update online status goes here
  }, [userId]);

  return (
    <div>
      <p>Status: {isOnline ? "Online" : "Offline"}</p>
    </div>
  );
};

export default StatusIndicator;
