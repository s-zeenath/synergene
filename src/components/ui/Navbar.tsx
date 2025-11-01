"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white shadow-md rounded-b-lg">
      <div className="flex items-center gap-2">
        {mounted && isSignedIn && user ? (
          <>
            <span className="text-2xl font-bold">{user.firstName}'s</span>
            <span className="text-2xl font-bold">dashboard</span>
          </>
        ) : (
          <div></div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {mounted && isSignedIn && (
          <>
            {["About", "Profile", "Dashboard", "Results"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {item}
              </Link>
            ))}
          </>
        )}

        {mounted && isSignedIn && (
          <button
            onClick={handleSignOut}
            className="font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Logout
          </button>
        )}

        {mounted && isSignedIn && <ThemeToggle />}

        <div className="bg-white p-2 rounded-lg shadow-md">
          <img src="/logo.png" className="h-10 w-auto" alt="Logo" />
        </div>
      </div>
    </header>
  );
}
