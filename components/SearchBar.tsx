"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search...", className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q")?.toString() || "");

  useEffect(() => {
    const currentSearch = searchParams.get("q") || "";
    if (searchTerm === currentSearch) return;

    // Use a 500ms debounce to be even more conservative as per leader's request
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, searchParams]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isPending ? (
          <IconLoader2 className="h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <IconSearch className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <Input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}
