// src/app/profile/page.js
"use client";

import ProfilePictureUpload from "@/components/UserProfile/ProfilePictureUpload";
import NotificationsList from "@/components/UserProfile/NotificationsList";
import StatusIndicator from "@/components/UserProfile/StatusIndicator";
import ThemeSelector from "@/components/UserProfile/ThemeSelector";
import { useAuth } from "../../../AuthContext";
import withAuth from "../../utils/withAuth"; // Import withAuth

const ProfilePage = () => {
  const { user, userId } = useAuth();

  return (
    <div className="profile-page">
      <h1>{user.displayName || user.email}</h1>
      <StatusIndicator userId={userId} />
      <ProfilePictureUpload userId={userId} />
      <ThemeSelector userId={userId} />
      <NotificationsList userId={userId} />
    </div>
  );
};

export default withAuth(ProfilePage); // Wrap with withAuth
