"use client";

import React from "react";
import type { User } from "@prisma/client";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../../contexts/NavbarContext";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type Props = {
  user: User;
};

export default function EditProfileClient({ user }: Props) {
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();
  const router = useRouter();
  const { isLoaded: clerkLoaded, user: clerkUser } = useUser();

  const [name, setName] = React.useState(user.name ?? "");
  const [imagePreview, setImagePreview] = React.useState<string>(
    user.imageUrl ?? ""
  );
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPageTitle("Edit Profile");
  }, [setPageTitle]);

  const isLight = theme === "light";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!clerkLoaded || !clerkUser) throw new Error("Clerk not ready");

      const trimmed = name.trim();
      const parts = trimmed.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      await clerkUser.update({ firstName, lastName });

      let imageUrlToSave = clerkUser.imageUrl || null;
      if (file) {
        await clerkUser.setProfileImage({ file });
        imageUrlToSave = clerkUser.imageUrl || imageUrlToSave;
      }

      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          imageUrl: imageUrlToSave,
        }),
      });

      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!clerkLoaded) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={!isLight ? { backgroundColor: "#5175b0" } : {}}
      >
        <div className="px-6 md:px-12 lg:px-24 py-6 relative z-10">
          <div className="flex justify-center items-center h-64 text-lg">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={isLight ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-6 md:px-12 lg:px-24 pt-16 pb-10 relative z-10 flex items-start justify-center">
        <section
          className={`
            max-w-3xl w-full mx-auto rounded-2xl shadow-xl p-10
            transition-colors duration-300
            ${isLight ? "bg-white text-gray-900" : "text-white"}
          `}
          style={!isLight ? { backgroundColor: "#202e5e" } : {}}
        >
          <h1 className="text-center text-3xl font-semibold mb-8">
            Edit Profile
          </h1>

          <div className="flex justify-center mb-6">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 rounded-full border shadow-md object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-pink-300" />
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 text-red-800 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="
                  w-full text-sm
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:bg-[#2B9FFF] file:text-white
                  hover:file:bg-[#1E8EEA]
                "
              />
              <p className="mt-1 text-xs opacity-70">
                Choose an image from your device.
              </p>
            </div>

            <div className="flex gap-4 justify-end mt-2">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                disabled={saving}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  isLight
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    : "bg-[#0f1a33] hover:bg-[#334568] text-white"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#2B9FFF] hover:bg-[#1E8EEA] text-white font-semibold transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
