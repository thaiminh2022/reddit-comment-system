"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/** Default password used for all username-based accounts. */
const DEFAULT_PASSWORD = "reddit-comment-system-default-pwd-2026";

/**
 * Derives a consistent email from a username.
 * Used as the identifier for Supabase Auth since it requires an email.
 */
function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}@reddit-comment.local`;
}

/**
 * Authenticates a user by username.
 *
 * Flow:
 * 1. Check if a profile with the given name exists.
 * 2. If it exists → sign in with the derived email.
 * 3. If not → sign up, then insert a profile record.
 * 4. Redirect to /posts on success.
 *
 * Uses the service role client for profile lookup to bypass RLS,
 * and the regular server client for auth operations.
 */
export async function authenticateUser(formData: FormData) {
  const username = formData.get("username") as string | null;

  if (!username || username.trim().length === 0) {
    return { error: "Vui lòng nhập tên đăng nhập." };
  }

  const trimmedName = username.trim();
  const email = toEmail(trimmedName);

  const supabase = await createClient();

  // Use the service role to query profiles (bypasses RLS).
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: Check if the username exists in profiles
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("name", trimmedName)
    .single();

  if (existingProfile) {
    // Step 2a: Username exists → sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: DEFAULT_PASSWORD,
    });

    if (error) {
      console.error("Sign in error:", error);
      return { error: "Đăng nhập thất bại. Vui lòng thử lại." };
    }
  } else {
    // Step 2b: Username does not exist in Profiles -> check Auth
    let userId = "";

    const { data: adminUserData, error: adminUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });

    if (adminUserError) {
      // If user already exists in Auth but not in Profiles
      if (adminUserError.message.includes("already registered") || adminUserError.status === 422) {
        // Try to get the user ID from Auth
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const existingUser = listData.users.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        } else {
           return { error: "Lỗi xác thực người dùng. Vui lòng thử lại." };
        }
      } else {
        console.error("Admin user creation error:", adminUserError);
        return { error: adminUserError.message || "Không thể tạo tài khoản." };
      }
    } else {
      userId = adminUserData.user.id;
    }

    // Step 3: Ensure profile record exists
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: userId,
        name: trimmedName,
      });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      return { error: "Lỗi tạo hồ sơ người dùng." };
    }

    // Step 4: Now sign in to establish a session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: DEFAULT_PASSWORD,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return { error: "Đăng nhập thất bại sau khi tạo tài khoản." };
    }
  }

  // Step 4: Redirect to posts — must be called OUTSIDE try/catch
  redirect("/posts");
}
