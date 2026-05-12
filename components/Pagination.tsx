import { Button } from "@/components/ui/button";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

interface PaginationProps {
  nextCursor: string | null;
  baseUrl: string;
}

export default function Pagination({
  nextCursor,
  baseUrl,
}: PaginationProps) {
  if (!nextCursor) return null;

  const getNextUrl = () => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("cursor", nextCursor);
    return `${baseUrl}?${url.searchParams.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-x-2 mt-8">
      <Link href={getNextUrl()}>
        <Button variant="outline" className="flex items-center gap-x-1">
          Next Page
          <IconChevronRight size={16} />
        </Button>
      </Link>
    </div>
  );
}
