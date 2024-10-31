// src/app/layout.js
import { Inter } from "next/font/google";
import { AuthProvider } from "../../AuthContext";
import Navbar from "../components/Navbar/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MyDocs",
  description: "A simple document editor",
  icons: {
    icon: "/MainLogo.svg",
    // You can add different sizes or types if needed
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}