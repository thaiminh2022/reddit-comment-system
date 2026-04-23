"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authenticateUser } from "@/lib/actions/auth";
import { Loader2, Sparkles, User } from "lucide-react";
import { useActionState } from "react";

const RANDOM_NAMES = ["Alex", "Jordan", "Charlie", "Skyler", "Robin"];

type AuthState = { error?: string } | null;

export default function HomePage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    async (_prevState, formData) => {
      const result = await authenticateUser(formData);
      return result ?? null;
    },
    null
  );

  const handleRandomize = () => {
    const input = document.getElementById("username-input") as HTMLInputElement;
    if (input) {
      const randomName =
        RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      // Use native setter to trigger React's controlled value update
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, randomName);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      {/* Website Identity */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
          <span className="text-orange-600">Reddit</span> Comment System
        </h1>
        <p className="text-slate-500 mt-2">
          A reddit clone with only posts and the comment system
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Tell us who you are or let fate decide your alias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="username-input"
                  name="username"
                  placeholder="Enter your name..."
                  className="pl-10 focus-visible:ring-blue-600"
                  required
                  disabled={isPending}
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleRandomize}
                className="w-full border-slate-300 gap-2"
                disabled={isPending}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Randomize Name
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <footer className="mt-12 text-slate-400 text-sm">
        © 2026 Nhom 9 hay cl j do quen r
      </footer>
    </div>
  );
}
