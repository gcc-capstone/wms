import { Task } from "./tasks";

export const taskCategories = ["My Tasks", "Completed"] as const;
export type TaskCategory = (typeof taskCategories)[number];
export type TaskDisplayStatus = "Current" | "Available" | "Pending" | "Completed";
export const taskStatusFilters = ["Available", "Current", "Pending"] as const;
export type TaskStatusFilter = (typeof taskStatusFilters)[number];

export function isTaskBlocked(task: Task): boolean {
  return task.status === "Upcoming";
}

export function taskCategory(task: Task): TaskCategory {
  if (task.status === "Completed") return "Completed";
  return "My Tasks";
}

export function taskDisplayStatus(task: Task): TaskDisplayStatus {
  if (task.status === "Completed" || task.status === "Pending") return task.status;
  return isTaskBlocked(task) ? "Current" : "Available";
}

function dueDateOrder(value: string): number {
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);
  if (!match) return Infinity;
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    .indexOf(match[1].slice(0, 3).toLowerCase());
  if (month < 0) return Infinity;
  // Yearless April dates belong to the prototype's 2026 assignments.
  return Number(match[3] ?? 2026) * 10000 + (month + 1) * 100 + Number(match[2]);
}

export function filterTasks(
  tasks: Task[],
  category: TaskCategory,
  searchText: string,
  statuses: readonly TaskStatusFilter[] = [],
): Task[] {
  const search = searchText.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      taskCategory(task) === category &&
      (category === "Completed" || statuses.length === 0 || statuses.some((status) => status === taskDisplayStatus(task))) &&
      (search.length === 0 || task.title.toLowerCase().includes(search)),
  ).sort((left, right) => {
    const leftDate = dueDateOrder(left.dueDate);
    const rightDate = dueDateOrder(right.dueDate);
    return leftDate === rightDate ? 0 : leftDate < rightDate ? -1 : 1;
  });
}
