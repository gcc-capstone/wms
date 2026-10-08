import { createContext, useContext, useState, ReactNode } from "react";

import {
  ChecklistItem,
  PhotoKind,
  SafetyChecklist,
  Task,
  tasks as initialTasks,
} from "../constants/tasks";
import {
  completeTask,
  finishSync,
  missingSafetyRequirements,
  missingTaskRequirements,
  newSafetyChecklist,
  startSync,
} from "../constants/prototype-workflows";
import { isTaskBlocked } from "../constants/task-list";

type SubmitResult = { success: true } | { success: false; error: string };
type TaskStore = {
  tasks: Task[];
  updateChecklist: (id: number, checklist: ChecklistItem[]) => void;
  keepPhoto: (id: number, photoId: PhotoKind, safety?: boolean) => void;
  submitTask: (id: number) => SubmitResult;
  createSafety: (id: number) => void;
  updateSafety: (id: number, changes: Partial<SafetyChecklist>) => void;
  saveSafety: (id: number) => void;
  submitSafety: (id: number) => SubmitResult;
  beginSync: (id: number, retry?: boolean) => void;
  endSync: (id: number) => void;
};

const TaskContext = createContext<TaskStore | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState(initialTasks);

  const changeTask = (id: number, update: (task: Task) => Task) => {
    setTasks((previous) => {
      if (!previous.some((task) => task.id === id)) throw new Error("Task not found.");
      return previous.map((task) => task.id === id ? update(task) : task);
    });
  };

  const updateChecklist = (id: number, checklist: ChecklistItem[]) => {
    changeTask(id, (task) => {
      if (isTaskBlocked(task)) throw new Error("A prerequisite task must be completed first.");
      return task.status === "Completed" ? task : { ...task, checklist };
    });
  };

  const keepPhoto = (id: number, photoId: PhotoKind, safety = false) => {
    changeTask(id, (task) => {
      if (isTaskBlocked(task)) throw new Error("A prerequisite task must be completed first.");
      if (safety) {
        if (!task.safety) throw new Error("Create a Safety Checklist first.");
        if (task.safety.status === "Submitted") return task;
        return { ...task, safety: { ...task.safety, saved: false, photo: { ...task.safety.photo, attached: true } } };
      }
      if (task.status === "Completed") return task;
      return { ...task, photos: task.photos?.map((photo) => photo.id === photoId ? { ...photo, attached: true } : photo) };
    });
  };

  const submitTask = (id: number): SubmitResult => {
    const task = tasks.find((entry) => entry.id === id);
    if (!task) {
      return {
        success: false,
        error: "Task not found. Return to the task list and try again.",
      };
    }
    if (task.status === "Completed") {
      return { success: false, error: "This task has already been submitted." };
    }
    const missing = missingTaskRequirements(task);
    if (missing.length) {
      return {
        success: false,
        error: `Required information missing: ${missing.join("; ")}`,
      };
    }
    changeTask(id, completeTask);
    return { success: true };
  };

  const createSafety = (id: number) => {
    changeTask(id, (task) => ({ ...task, safety: task.safety ?? newSafetyChecklist(task) }));
  };

  const updateSafety = (id: number, changes: Partial<SafetyChecklist>) => {
    changeTask(id, (task) => {
      if (!task.safety) throw new Error("Safety Checklist not found.");
      if (task.safety.status === "Submitted") return task;
      return { ...task, safety: { ...task.safety, ...changes, saved: false } };
    });
  };

  const saveSafety = (id: number) => {
    changeTask(id, (task) => {
      if (!task.safety) throw new Error("Safety Checklist not found.");
      return { ...task, safety: { ...task.safety, saved: true } };
    });
  };

  const submitSafety = (id: number): SubmitResult => {
    const task = tasks.find((entry) => entry.id === id);
    if (!task?.safety) return { success: false, error: "Safety Checklist not found." };
    if (task.safety.status === "Submitted") return { success: false, error: "Safety Checklist already submitted." };
    const missing = missingSafetyRequirements(task.safety);
    if (missing.length) return { success: false, error: `Required information missing: ${missing.join("; ")}` };
    changeTask(id, (entry) => {
      if (!entry.safety) throw new Error("Safety Checklist not found.");
      return { ...entry, safety: {
        ...entry.safety,
        status: "Submitted",
        saved: true,
        photo: { ...entry.safety.photo, upload: "Received by WMS" },
      } };
    });
    return { success: true };
  };

  const beginSync = (id: number, retry = false) => changeTask(id, (task) => startSync(task, retry));
  const endSync = (id: number) => changeTask(id, finishSync);

  return (
    <TaskContext.Provider value={{
      tasks, updateChecklist, keepPhoto, submitTask, createSafety,
      updateSafety, saveSafety, submitSafety, beginSync, endSync,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks(): TaskStore {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within TaskProvider");
  return context;
}
