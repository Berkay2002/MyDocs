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

  const username = user.displayName.split("#")[0];

  const handleLogout = async () => {
    await logout();
    router.replace("/"); // Clear the state and redirect to the homepage
  };

  return (
    <div className="relative">
      <Image
        src={profilePicture || "/default-profile.jpg"}
        alt="Profile"
        width={40}
        height={40}
        className="rounded-full cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      />
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10">
          <div className="p-3 text-center border-b">
            <p className="text-gray-700">{user.email}</p>
            <Image
              src={profilePicture || "/default-profile.jpg"}
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
