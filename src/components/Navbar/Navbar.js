// src/components/Navbar/Navbar.js
import ProfileIcon from "./ProfileIcon";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-md">
      <Link href="/">
        <div className="flex items-center">
          <Image src="/logo-2-docs.png" alt="Logo" width={40} height={40} />
          <span className="ml-2 font-semibold">MyDocs</span>
        </div>
      </Link>
      <ProfileIcon />
    </nav>
  );
};

export default Navbar;
