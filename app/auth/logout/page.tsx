"use client";

import { logoutUser } from "@/lib/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default async function Page() {
  const [isLogout, setIsLogout] = useState(false);

  return (
    <>
      <form
        hidden={isLogout}
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await logoutUser();
          if (res.is_success) {
            setIsLogout(true);
          }
        }}
      >
        <h1>Confirm logout</h1>
        <button type="submit">Logout</button>
      </form>

      <div hidden={!isLogout} className="p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-green-600">Logged Out</h1>
        <p className="mt-2 text-slate-700">
          You have been successfully logged out.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Return to Home
        </Link>
      </div>
    </>
  );
}
