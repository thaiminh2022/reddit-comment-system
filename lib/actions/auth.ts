"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/error_handler";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";

/** Default password used for all username-based accounts. */
const DEFAULT_PASSWORD = "reddit-comment-system-default-pwd-2026";

const AuthSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập.")
    .max(50, "Tên quá dài."),
});

/**
 * Authenticates a user by name.
 *
 * Flow:
 * 1. Search for a profile with the EXACT name.
 * 2. If found:
 *    a. Fetch the user's email from auth.users using the admin client.
 *    b. Sign in with that email and the default password.
 * 3. If not found:
 *    a. Create a new user in auth.users with a derived slugified email.
 *    b. Create a profile record with the original name.
 *    c. Sign in.
 */
export async function authenticateUser(formData: FormData) {
  const rawName = formData.get("username") as string | null;

  const result = AuthSchema.safeParse({ name: rawName });
  if (!result.success) {
    return { error: result.error.message };
  }

  const { name: trimmedName } = result.data;
  const supabase = await createClient();

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Step 1: Search profile by name
  const { data: profile, error: profileFetchError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("name", trimmedName)
    .maybeSingle();

  if (profileFetchError) {
    console.error("Error fetching profile:", profileFetchError);
    return { error: "Lỗi hệ thống khi tìm kiếm người dùng." };
  }

  let emailToUse = "";

  if (profile) {
    // Step 2: Found profile -> get email from Auth
    const { data: userData, error: userFetchError } =
      await adminClient.auth.admin.getUserById(profile.id);

    if (userFetchError || !userData.user?.email) {
      console.error("Error fetching user email:", userFetchError);
      return { error: "Không tìm thấy thông tin xác thực cho người dùng này." };
    }

    emailToUse = userData.user.email;
  } else {
    // Step 3: Not found -> Create new user
    // We create a slugified email for the new user to ensure it's valid for Supabase Auth
    emailToUse = `${slugify(trimmedName)}@reddit-comment.local`;

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email: emailToUse,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });

    if (createError) {
      // Handle the case where the email might already exist
      if (createError.message.includes("already registered")) {
        // If name wasn't found but email exists, it's a conflict or a name mismatch
        return {
          error:
            "Tên này có thể đã được sử dụng hoặc có xung đột hệ thống. Thử tên khác?",
        };
      }
      console.error("Error creating user:", createError);
      return { error: "Không thể tạo tài khoản mới." };
    }

    // Step 4: Create profile record
    const { error: insertProfileError } = await adminClient
      .from("profiles")
      .insert({
        id: newUser.user.id,
        name: trimmedName,
      });

    if (insertProfileError) {
      console.error("Error creating profile:", insertProfileError);
      return { error: "Không thể tạo hồ sơ người dùng." };
    }
  }

  // Final Step: Sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password: DEFAULT_PASSWORD,
  });

  if (signInError) {
    console.error("Sign in error:", signInError);
    return { error: "Đăng nhập thất bại. Vui lòng kiểm tra lại." };
  }

  redirect("/posts");
}

export async function logoutUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    return createErrorResponse("Đăng xuất thất bại. Vui lòng thử lại.", error);
  }
  return createSuccessResponse(null);
}
