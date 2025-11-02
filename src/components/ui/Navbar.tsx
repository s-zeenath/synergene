"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "@/app/contexts/NavbarContext";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { theme } = useTheme();
  const { pageTitle } = useNavbar();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const textColor = theme === "light" ? "white" : "black";

  return (
    <header className="flex items-center justify-between px-8 py-3">
      <div className="flex items-center gap-2">
        {mounted && isSignedIn && user ? (
          <>
            <span className="text-2xl font-bold" style={{ color: textColor }}>
              {user.firstName}'s
            </span>
            <span className="text-2xl font-bold" style={{ color: textColor }}>
              {pageTitle}
            </span>
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
                className="font-bold px-4 py-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/10 transition"
                style={{ color: textColor }}
              >
                {item}
              </Link>
            ))}
          </>
        )}

        {mounted && isSignedIn && (
          <button
            onClick={handleSignOut}
            className="font-bold px-4 py-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/10 transition"
            style={{ color: textColor }}
          >
            Logout
          </button>
        )}

        {mounted && isSignedIn && <ThemeToggle />}

        <div className="p-2 rounded-lg">
          <img
            src="/logo.png"
            className="h-10 w-auto rounded-full"
            alt="Logo"
          />
        </div>
      </div>
    </header>
  );
}
