export function timeAgo(inputDate: string | Date): string {
  const date = new Date(inputDate);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "in the future";
  }

  if (diffDays === 0) {
    return "today";
  }

  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  const diffMonths =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());

  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);

  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}