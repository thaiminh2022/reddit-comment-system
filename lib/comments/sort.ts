export const commentSortOptions = [
  { value: "newest", label: "Newest", group: "main" },
  { value: "hot", label: "Most active", group: "main" },
  { value: "top-all-time", label: "All time", group: "top" },
  { value: "top-past-year", label: "Past year", group: "top" },
  { value: "top-past-month", label: "Past month", group: "top" },
] as const;

export type CommentSort = (typeof commentSortOptions)[number]["value"];

export function parseCommentSort(value: string | string[] | undefined): CommentSort {
  const sortValue = Array.isArray(value) ? value[0] : value;

  if (sortValue === "new") return "newest";
  if (sortValue === "top") return "top-all-time";

  if (commentSortOptions.some((option) => option.value === sortValue)) {
    return sortValue as CommentSort;
  }

  return "newest";
}

export function getCommentSortLabel(sort: CommentSort) {
  const option = commentSortOptions.find((option) => option.value === sort);

  if (!option) return "Newest";

  return option.group === "top" ? `Top: ${option.label}` : option.label;
}
