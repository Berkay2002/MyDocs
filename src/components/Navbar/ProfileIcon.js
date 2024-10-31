// src/components/Navbar/ProfileIcon.js

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../AuthContext";

const ProfileIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, profilePicture, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const username = user.displayName ? user.displayName.split("#")[0] : "User";

  const handleLogout = async () => {
    await logout();
    router.replace("/"); // Redirect to the homepage
  };

  // Determine the profile image source
  const profileImageSrc = user.photoURL || profilePicture || "/default-profile.jpg";

  return (
    <div className="relative">
      <Image
        src={profileImageSrc}
        alt="Profile"
        width={50}
        height={50}
        className="rounded-full cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      />
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-50">
          <div className="p-3 text-center border-b">
            <p className="text-gray-700">{user.email}</p>
            <Image
              src={profileImageSrc}
              alt="Profile Picture"
              width={60}
              height={60}
              className="rounded-full mx-auto my-2"
            />
            <p className="text-gray-800">Hi, {username}</p>
          </div>
          <button
            onClick={() => {
              router.push("/profile");
              setShowDropdown(false);
            }}
            className="w-full text-center py-2 text-blue-500 border-b"
          >
            Manage your account
          </button>
          <button
            onClick={() => {
              handleLogout();
              setShowDropdown(false);
            }}
            className="w-full text-center py-2 text-red-500"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
