// src/components/UserProfile/NotificationsList.js
import { useState, useEffect } from "react";
import { firestore } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const NotificationsList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(firestore, `users/${userId}/notifications`),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <p key={notification.id}>{notification.message}</p>
      ))}
    </div>
  );
};

export default NotificationsList;
