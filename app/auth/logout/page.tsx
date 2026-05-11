import { logoutUser } from "@/lib/actions/auth";
import Link from "next/link";

export default async function Page() {
  const result = await logoutUser();

  if (!result.is_success) {
    return (
      <>
        <h1 className="text-2xl font-bold text-red-600">Logout Failed</h1>
        <p className="mt-2 text-slate-700">{result.message}</p>
      </>
    );
  }

  return (
    <>
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
    </>
  );
}
