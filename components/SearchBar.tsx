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
          <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <IconSearch className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <Input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full rounded-full border-border bg-background py-2 pl-10 pr-3 leading-5 placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
