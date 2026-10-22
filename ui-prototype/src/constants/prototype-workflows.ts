import { isChecklistItemAnswered, SafetyChecklist, Task } from "./tasks";
import { createPhoto } from "./representative-tasks";
import { isTaskBlocked } from "./task-list";

export function unlockTaskDependencies(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    if (!isTaskBlocked(task) || task.prerequisiteTaskId === undefined) return task;
    const prerequisite = tasks.find((entry) => entry.id === task.prerequisiteTaskId);
    return prerequisite?.status === "Pending" || prerequisite?.status === "Completed" || prerequisite?.status === "Error"
      ? { ...task, status: "Not Started" }
      : task;
  });
}

export function missingTaskRequirements(task: Task): string[] {
  return [
    ...(isTaskBlocked(task) ? ["A prerequisite task must be completed first."] : []),
    ...task.checklist.filter((item) => !isChecklistItemAnswered(item)).map((item) => item.label),
    ...(task.photos ?? []).filter((photo) => !photo.attached).map((photo) => photo.label),
    ...(task.checklist.length === 0 ? ["No checklist items are available for this task."] : []),
  ];
}

export function completeTask(task: Task): Task {
  const missing = missingTaskRequirements(task);
  if (missing.length) throw new Error(`Required information missing: ${missing.join("; ")}`);
  if (task.status === "Completed" || task.status === "Pending" || task.status === "Error") throw new Error("This task has already been submitted.");
  const pending = task.scenario === "offline" || task.scenario === "uploadFailure";
  const received = task.scenario === "validation" || task.scenario === "safety";
  return {
    ...task,
    status: pending ? "Pending" : "Completed",
    completedBy: pending ? null : task.technician ?? "Alex Rivera",
    completedDate: pending ? null : task.scenario ? task.dueDate : new Date().toLocaleDateString("en-US"),
    syncStatus: received ? "Up to date" : "Unsynced",
    connection: pending ? "Offline" : task.connection,
    photos: task.photos?.map((photo) => ({
      ...photo,
      upload: received ? "Received by WMS" : "Saved on device",
    })),
  };
}

export function uploadPendingTask(task: Task): Task {
  if ((task.scenario !== "offline" && task.scenario !== "uploadFailure") || task.status !== "Pending") {
    throw new Error("No submission is pending for this task.");
  }
  const completed: Task = {
    ...task,
    status: "Completed",
    completedBy: task.technician ?? "Alex Rivera",
    completedDate: task.dueDate,
  };
  // The header control runs the initial simulated upload in one step.
  return finishSync(startSync(completed));
}

export function newSafetyChecklist(task: Task): SafetyChecklist {
  if (task.scenario !== "safety" || !task.location) throw new Error("Safety Checklist is unavailable for this task.");
  return {
    status: "Draft",
    saved: false,
    condition: null,
    ppe: [],
    hazard: "",
    controlPlan: "",
    crewMember: "",
    resolution: "",
    reviewedWithCrew: false,
    photo: createPhoto("hazard", "Standing-water hazard photograph", task.dueDate, "10:18 AM", task.location),
  };
}

export function missingSafetyRequirements(safety: SafetyChecklist): string[] {
  return [
    ...(!safety.condition ? ["Job-site condition"] : []),
    ...(safety.ppe.length === 0 ? ["Required PPE"] : []),
    ...(!safety.hazard.trim() ? ["Hazard description"] : []),
    ...(!safety.controlPlan.trim() ? ["Control plan"] : []),
    ...(!safety.crewMember.trim() ? ["Crew member"] : []),
    ...(!safety.photo.attached ? [safety.photo.label] : []),
    ...(!safety.resolution.trim() ? ["Hazard addressed"] : []),
    ...(!safety.reviewedWithCrew ? ["Safety requirements reviewed with crew"] : []),
  ];
}

export function startSync(task: Task, retry = false): Task {
  if (task.status !== "Completed" && !(retry && task.status === "Error")) throw new Error("Complete the task before synchronizing.");
  if (retry ? task.syncStatus !== "Upload failed" : task.syncStatus !== "Unsynced") {
    throw new Error("Synchronization cannot begin from the current state.");
  }
  return {
    ...task,
    connection: "Online",
    syncStatus: "Synchronizing",
    syncAttempt: retry ? "retry" : "initial",
    photos: task.photos?.map((photo) => ({
      ...photo,
      upload: photo.upload === "Received by WMS" ? photo.upload : "Uploading",
    })),
  };
}

export function finishSync(task: Task): Task {
  if (task.syncStatus !== "Synchronizing") throw new Error("Synchronization is not in progress.");
  const failRepair = task.scenario === "uploadFailure" && task.syncAttempt === "initial";
  return {
    ...task,
    status: failRepair ? "Error" : "Completed",
    completedBy: failRepair ? null : task.technician ?? "Alex Rivera",
    completedDate: failRepair ? null : task.completedDate ?? task.dueDate,
    syncStatus: failRepair ? "Upload failed" : "Up to date",
    photos: task.photos?.map((photo) => ({
      ...photo,
      upload: failRepair && photo.id === "repair" ? "Upload failed" : "Received by WMS",
    })),
  };
}
