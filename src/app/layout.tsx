import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "DevPulse | The Independent Developer Community & Project Showcase",
  description:
    "DevPulse is the dedicated platform for developers to build their technical identity, showcase software projects, share video demonstrations, and connect with fellow programmers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AnnouncementBanner />
          <Navbar />
          <div className="app-content flex-1">{children}</div>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
