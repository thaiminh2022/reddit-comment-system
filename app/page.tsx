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
import { Sparkles, User } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [name, setName] = useState("");

  const handleRandomize = () => {
    const names = ["Alex", "Jordan", "Charlie", "Skyler", "Robin"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    // Set state or update form value
    setName(randomName);
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="pl-10 focus-visible:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <a href="/posts">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            </a>

            <Button
              variant="outline"
              onClick={handleRandomize}
              className="w-full border-slate-300 gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              Randomize Name
            </Button>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-12 text-slate-400 text-sm">
        © 2026 Nhom 9 hay cl j do quen r
      </footer>
    </div>
  );
}
