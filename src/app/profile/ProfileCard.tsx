"use client";

import React, { useEffect } from "react";
import type { User } from "@prisma/client";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../contexts/NavbarContext";

type Props = {
  user: User;
};

export default function ProfileCard({ user }: Props) {
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  useEffect(() => {
    setPageTitle("Profile");
  }, [setPageTitle]);

  const isLight = theme === "light";

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "A";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });

  const lastUpdated = new Date(user.updatedAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={isLight ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12 lg:px-24 py-12 relative z-10">
        <section
          className={`
            max-w-3xl w-full mx-auto rounded-2xl shadow-xl p-10
            flex flex-col items-center gap-8
            transition-colors duration-300
            ${isLight ? "bg-white text-gray-900" : "text-white"}
          `}
          style={!isLight ? { backgroundColor: "#202e5e" } : {}}
        >

          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full border shadow-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-pink-200 flex items-center justify-center text-4xl font-bold text-slate-800 shadow-lg">
              {initials}
            </div>
          )}

          <div className="w-full flex flex-col gap-6 mt-4">

            <div>
              <label className="block mb-1 text-sm font-medium">Full Name</label>
              <input
                value={user.name ?? ""}
                readOnly
                disabled
                className={`w-full rounded-xl px-4 py-3 border cursor-default transition-colors ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                value={user.email ?? ""}
                readOnly
                disabled
                className={`w-full rounded-xl px-4 py-3 border cursor-default transition-colors ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>
            <p className="text-sm opacity-80 -mt-2">
                Member since {memberSince}
            </p>
          </div>

          <Link href="/profile/edit">
            <button className="mt-4 bg-[#2B9FFF] hover:bg-[#1E8EEA] text-white font-semibold px-6 py-2 rounded-xl transition">
              Edit Profile
            </button>
          </Link>
        </section>
      </div>
    </main>
  );
}
