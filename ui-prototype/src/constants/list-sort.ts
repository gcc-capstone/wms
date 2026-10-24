export type ListSort = "newest" | "oldest" | "a-z" | "z-a";

export function compareListItems(leftTitle: string, rightTitle: string, leftDate: number, rightDate: number, sort: ListSort): number {
  if (sort === "a-z" || sort === "z-a") {
    const comparison = leftTitle.localeCompare(rightTitle, undefined, { sensitivity: "base", numeric: true });
    return sort === "a-z" ? comparison : -comparison;
  }
  const leftValid = Number.isFinite(leftDate);
  const rightValid = Number.isFinite(rightDate);
  if (!leftValid || !rightValid) return leftValid === rightValid ? 0 : leftValid ? -1 : 1;
  const comparison = leftDate === rightDate ? 0 : leftDate < rightDate ? -1 : 1;
  return sort === "oldest" ? comparison : -comparison;
}
