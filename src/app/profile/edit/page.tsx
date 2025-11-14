import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import EditProfileClient from "./EditProfileClient";

export default async function EditProfilePage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <EditProfileClient user={user} />;
}
