export const postSortOptions = [
  { value: "newest", label: "Newest", group: "main" },
  { value: "hot", label: "Hot", group: "main" },
  { value: "top-all-time", label: "All time", group: "top" },
  { value: "top-past-year", label: "Past year", group: "top" },
  { value: "top-past-month", label: "Past month", group: "top" },
] as const;

export type PostSort = (typeof postSortOptions)[number]["value"];

export function parsePostSort(value: string | string[] | undefined): PostSort {
  const sortValue = Array.isArray(value) ? value[0] : value;

  if (sortValue === "new") return "newest";
  if (sortValue === "top") return "top-all-time";

  if (postSortOptions.some((option) => option.value === sortValue)) {
    return sortValue as PostSort;
  }

  return "newest";
}

export function getPostSortLabel(sort: PostSort) {
  const option = postSortOptions.find((option) => option.value === sort);

  if (!option) return "Newest";

  return option.group === "top" ? `Top: ${option.label}` : option.label;
}
