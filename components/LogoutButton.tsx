"use client";

import { createClient } from "@/lib/supabase/client";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
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
      <IconLogout />
      Log out
    </Button>
  );
}
