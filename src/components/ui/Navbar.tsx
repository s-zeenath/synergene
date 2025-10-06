import Link from "next/link";
import { checkUser } from "@/lib/checkUser"; 

export default function Navbar() {
  const user = checkUser();

  return (

    <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white shadow-md">
      = <h1 className="text-2xl font-bold">Sarah’s Dashboard</h1>
      <nav className="flex items-center gap-8 text-base font-medium">
        <Link href="/" className="hover:text-blue-200 transition-colors">
          About
        </Link>
        <Link href="/profile" className="hover:text-blue-200 transition-colors">
          Profile
        </Link>
        <Link
          href="/dashboard"
          className="hover:text-blue-200 transition-colors"
        >
          Dashboard
        </Link>
        <Link href="/help" className="hover:text-blue-200 transition-colors">
          Help
        </Link>

        <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-md ml-4">
          <img src="/logo.png" alt="logo" className="h-10 w-auto" />
        </div>
      </nav>
    </header>
  );
}
