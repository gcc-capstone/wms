import { Task } from "./tasks";

export const taskCategories = ["Current", "Available", "Completed"] as const;
export type TaskCategory = (typeof taskCategories)[number];

export function isTaskBlocked(task: Task): boolean {
  return task.status === "Upcoming";
}

export function taskCategory(task: Task): TaskCategory {
  if (task.status === "Completed") return "Completed";
  return isTaskBlocked(task) ? "Current" : "Available";
}

export function filterTasks(
  tasks: Task[],
  category: TaskCategory,
  searchText: string,
): Task[] {
  const search = searchText.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      taskCategory(task) === category &&
      (search.length === 0 || task.title.toLowerCase().includes(search)),
  );
}
