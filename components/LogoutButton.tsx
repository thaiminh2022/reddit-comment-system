"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant={"destructive"}
      className="cursor-pointer"
    >
      <IoLogOut />
      Log out
    </Button>
  );
}
