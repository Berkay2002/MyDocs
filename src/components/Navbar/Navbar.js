// src/components/Navbar/Navbar.js
"use client";

import { usePathname } from 'next/navigation';
import ProfileIcon from "./ProfileIcon";
import Image from "next/image";
import Link from "next/link";
import { Button, IconButton, Icon } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from '@mui/icons-material/Menu'; // Importing Menu
import AppsIcon from '@mui/icons-material/Apps';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from "../../../AuthContext"; // Import useAuth

const Navbar = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const pathname = usePathname();

  // Do not render Navbar on Editor pages
  if (pathname.startsWith('/editor/')) {
    return null;
  }

  return (
    <header className="flex items-center sticky top-0 z-50 bg-white px-4 py-2 shadow-md">
      <Button
        color="gray"
        className="!hidden md:!inline-block h-12 w-12 border-0"
      >
        <MenuIcon fontSize="large" />
      </Button>
      <Link href="/" legacyBehavior>
        <a className="flex items-center">
          <Image src="/MainLogo.svg" alt="Main Logo" width={50} height={50} />
        </a>
      </Link>
      <h1 className="hidden md:!inline-block ml-1 text-gray-700 text-xl">
        MyDocs
      </h1>

      {user && (
        <>
          <div className="mx-5 md:!mx-20 flex flex-1 items-center px-5 py-2.5 bg-gray-100 rounded-full text-gray-600 focus-within:shadow-md focus-within:bg-white">
            <SearchIcon fontSize="large" color="inherit" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none pl-5 flex-1 text-base"
            />
          </div>

          <Button
            variant="outlined"
            color="inherit"
            className="!hidden md:!inline-block h-12 w-12 border-0 mx-5 "
            onClick={() => {
              // Add your apps toggle logic here
              console.log('Apps button clicked');
            }}
          >
            <AppsIcon fontSize="large" />
          </Button>
        </>
      )}

      <ProfileIcon />
    </header>
  );
};

export default Navbar;