import { isChecklistItemAnswered, SafetyChecklist, Task } from "./tasks";
import { createPhoto } from "./representative-tasks";
import { isTaskBlocked } from "./task-list";

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
  if (task.status === "Completed") throw new Error("This task has already been submitted.");
  const received = task.scenario === "validation" || task.scenario === "safety";
  return {
    ...task,
    status: "Completed",
    completedBy: task.technician ?? "Alex Rivera",
    completedDate: task.scenario ? task.dueDate : new Date().toLocaleDateString("en-US"),
    syncStatus: received ? "Up to date" : "Unsynced",
    photos: task.photos?.map((photo) => ({
      ...photo,
      upload: received ? "Received by WMS" : "Saved on device",
    })),
  };
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
  if (task.status !== "Completed") throw new Error("Complete the task before synchronizing.");
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
    syncStatus: failRepair ? "Upload failed" : "Up to date",
    photos: task.photos?.map((photo) => ({
      ...photo,
      upload: failRepair && photo.id === "repair" ? "Upload failed" : "Received by WMS",
    })),
  };
}
