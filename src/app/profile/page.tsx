import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import ProfileCard from "./ProfileCard";

export default async function ProfilePage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <ProfileCard user={user} />;
}
