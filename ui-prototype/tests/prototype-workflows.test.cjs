const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { representativeTasks } = require("../src/constants/representative-tasks.ts");
const { isChecklistItemAnswered, tasks } = require("../src/constants/tasks.ts");
const {
  filterTasks,
  isTaskBlocked,
  taskCategories,
  taskCategory,
  taskDisplayStatus,
} = require("../src/constants/task-list.ts");
const {
  nextGalleryPhoto,
  changeTaskPhoto,
  attachGalleryPhoto,
  galleryPhotoPreview,
  missingTaskRequirements,
  completeTask,
  newSafetyChecklist,
  missingSafetyRequirements,
  startSync,
  finishSync,
  uploadPendingTask,
  unlockTaskDependencies,
} = require("../src/constants/prototype-workflows.ts");

function scenario(name) {
  return structuredClone(representativeTasks.find((task) => task.scenario === name));
}

function answer(task, values) {
  task.checklist = task.checklist.map((item) => {
    if (!(item.id in values)) return item;
    return item.kind === "text"
      ? { ...item, customText: values[item.id] }
      : { ...item, response: values[item.id] };
  });
  return task;
}

function attachAll(task) {
  task.photos = task.photos.map((photo) => ({ ...photo, attached: true }));
  return task;
}

test("Sarah flow names the missing required item and keeps entered values", () => {
  const task = attachAll(answer(scenario("validation"), {
    installed: "Yes",
    condition: "Good",
    contact: "Jeffrey Fisher",
  }));
  const before = structuredClone(task);
  assert.deepEqual(missingTaskRequirements(task), ["Work area clear of tools and debris"]);
  assert.throws(() => completeTask(task), /Work area clear of tools and debris/);
  assert.deepEqual(task, before);
  const completed = completeTask(answer(task, { clear: "Yes" }));
  assert.equal(completed.status, "Completed");
  assert.equal(completed.completedBy, "Sarah Miller");
  assert.equal(completed.completedDate, "April 20");
  assert.equal(completed.photos[0].time, "2:14 PM");
  assert.equal(completed.photos[0].location, "North Ridge Substation");
  assert.equal(completed.photos[0].upload, "Received by WMS");
  assert.equal(
    completed.checklist.find((item) => item.id === "contact").customText,
    "Jeffrey Fisher",
  );
});

test("Task submission requires real text but photos are optional", () => {
  const task = answer(scenario("offline"), {
    inspected: "Yes",
    pressure: "  ",
    condition: "Good",
  });
  assert.deepEqual(missingTaskRequirements(task), [
    "Current pressure reading",
  ]);
  assert.throws(() => completeTask(task), /Required information missing/);
  assert.equal(isChecklistItemAnswered({ ...task.checklist[0], response: "N/A" }), true);
});

test("Marcus draft is task-linked and auto-populates known fields", () => {
  const task = scenario("safety");
  const draft = newSafetyChecklist(task);
  assert.equal(draft.status, "Draft");
  assert.equal(draft.saved, false);
  assert.equal(draft.photo.date, "April 21");
  assert.equal(draft.photo.location, "East Valley Pump Station");
  assert.throws(() => newSafetyChecklist(scenario("offline")), /unavailable/);
});

test("Marcus draft can be saved then completed without losing details", () => {
  const draft = {
    ...newSafetyChecklist(scenario("safety")),
    condition: "Standing water near electrical equipment",
    ppe: ["Safety glasses", "Insulated gloves"],
    hazard:
      "Standing water is approximately three feet from the Pump 2 electrical control panel.",
    controlPlan:
      "Barricade the wet area and have site maintenance remove the water before the electrical panel is opened.",
    crewMember: "Elena Rodriguez",
    saved: true,
  };
  draft.photo.attached = true;
  assert.deepEqual(missingSafetyRequirements(draft), [
    "Hazard addressed",
    "Safety requirements reviewed with crew",
  ]);
  const resumed = structuredClone(draft);
  resumed.resolution = "Water removed and work area dry before electrical inspection began.";
  resumed.reviewedWithCrew = true;
  assert.deepEqual(missingSafetyRequirements(resumed), []);
  assert.equal(resumed.hazard, draft.hazard);
  assert.deepEqual(resumed.ppe, draft.ppe);
  assert.equal(resumed.photo.attached, true);
});

test("Aisha stays pending offline until connection returns", () => {
  const task = attachAll(answer(scenario("offline"), {
    inspected: "Yes",
    pressure: "62 PSI",
    condition: "Good",
  }));
  const completed = completeTask(task);
  assert.equal(completed.syncStatus, "Unsynced");
  assert.equal(completed.connection, "Offline");
  assert.equal(completed.photos[0].upload, "Saved on device");
  assert.equal(completed.status, "Pending");
  assert.equal(completed.completedDate, null);
  assert.equal(completed.completedBy, null);
  assert.equal(taskCategory(completed), "My Tasks");
  const synced = uploadPendingTask(completed);
  assert.equal(synced.status, "Completed");
  assert.equal(synced.completedDate, "April 22");
  assert.equal(synced.completedBy, "Aisha Patel");
  assert.equal(synced.connection, "Online");
  assert.equal(taskCategory(synced), "Completed");
  assert.throws(() => uploadPendingTask(synced), /No submission/);
  assert.equal(synced.syncStatus, "Up to date");
  assert.equal(synced.photos[0].upload, "Received by WMS");
  assert.deepEqual(synced.checklist, completed.checklist);
});

test("Daniel partial photo failure retries only the failed upload", () => {
  const task = attachAll(answer(scenario("uploadFailure"), {
    inspected: "Yes",
    condition: "Good",
    note: "Repair complete. No visible damage or loose connections observed.",
  }));
  const pending = completeTask(task);
  assert.equal(pending.status, "Pending");
  assert.equal(pending.completedDate, null);
  assert.equal(taskCategory(pending), "My Tasks");
  assert.ok(pending.photos.every((photo) => photo.upload === "Saved on device"));
  assert.throws(() => completeTask(pending), /already been submitted/);
  const failed = uploadPendingTask(pending);
  assert.equal(failed.status, "Error");
  assert.equal(taskCategory(failed), "My Tasks");
  assert.equal(failed.completedDate, null);
  assert.equal(failed.completedBy, null);
  assert.equal(taskDisplayStatus(failed), "Error");
  assert.throws(() => completeTask(failed), /already been submitted/);
  assert.deepEqual(failed.checklist, pending.checklist);
  assert.throws(() => uploadPendingTask(failed), /No submission/);
  assert.equal(failed.syncStatus, "Upload failed");
  assert.equal(failed.photos[0].upload, "Received by WMS");
  assert.equal(failed.photos[1].upload, "Upload failed");
  assert.equal(failed.photos[1].attached, true);
  const retry = startSync(failed, true);
  assert.equal(retry.photos[0].upload, "Received by WMS");
  assert.equal(retry.photos[1].upload, "Uploading");
  const synced = finishSync(retry);
  assert.equal(synced.status, "Completed");
  assert.equal(synced.completedDate, "April 23");
  assert.equal(synced.completedBy, "Daniel Brooks");
  assert.equal(taskCategory(synced), "Completed");
  assert.equal(synced.syncStatus, "Up to date");
  assert.ok(synced.photos.every((photo) => photo.upload === "Received by WMS"));
});

test("invalid transitions and duplicate completion are rejected", () => {
  const task = scenario("offline");
  assert.throws(() => startSync(task), /Complete the task/);
  assert.throws(() => finishSync(task), /not in progress/);
  const completed = completeTask(
    attachAll(answer(task, { inspected: "Yes", pressure: "62 PSI", condition: "Good" })),
  );
  assert.throws(() => completeTask(completed), /already been submitted/);
  assert.throws(() => startSync(completed), /Complete the task/);
  assert.throws(() => uploadPendingTask(task), /No submission/);
  const uploaded = uploadPendingTask(completed);
  assert.throws(() => startSync(uploaded, true), /current state/);
  assert.throws(() => startSync(uploaded), /current state/);
});

test("legacy October sample tasks remain usable", () => {
  const task = structuredClone(tasks.find((entry) => entry.id === 1));
  assert.equal(task.status, "Current");
  assert.equal(task.checklist.filter(isChecklistItemAnswered).length, 5);
  const yesNo = task.checklist.find((item) => item.kind === "yesNo");
  assert.equal(isChecklistItemAnswered({ ...yesNo, response: "N/A" }), true);
  const dropdown = task.checklist.find((item) => item.kind === "dropdown");
  assert.equal(isChecklistItemAnswered({ ...dropdown, response: "A" }), false);
  assert.ok(tasks.some((entry) => entry.id === 5 && entry.status === "Completed"));
});

test("My Tasks combines Current, Available, and Pending with distinct display statuses", () => {
  assert.deepEqual(taskCategories, ["My Tasks", "Completed"]);
  const expected = {
    Current: "Available",
    "In Progress": "Available",
    "Not Started": "Available",
    Upcoming: "Current",
    Pending: "Pending",
    Error: "Error",
    Completed: "Completed",
  };
  for (const [status, displayStatus] of Object.entries(expected)) {
    const task = { ...tasks[0], status };
    assert.equal(taskDisplayStatus(task), displayStatus);
    assert.equal(taskCategory(task), status === "Completed" ? "Completed" : "My Tasks");
  }
  const groups = taskCategories.flatMap((category) => filterTasks(tasks, category, ""));
  assert.equal(groups.length, tasks.length);
  assert.equal(new Set(groups.map((task) => task.id)).size, tasks.length);
  const active = filterTasks(tasks, "My Tasks", "");
  assert.ok(active.some(isTaskBlocked));
  assert.ok(active.some((task) => taskDisplayStatus(task) === "Available"));
  assert.ok(representativeTasks.every((task) => taskCategory(task) === "My Tasks"));
});

test("search matches task titles within the selected category only", () => {
  assert.deepEqual(
    filterTasks(tasks, "My Tasks", "  PRESSURE SENSOR  ").map((task) => task.scenario),
    ["offline"],
  );
  assert.deepEqual(filterTasks(tasks, "Completed", "pressure sensor"), []);
  assert.deepEqual(filterTasks(tasks, "My Tasks", "Sarah Miller"), []);
  assert.deepEqual(filterTasks(tasks, "My Tasks", "North Ridge Substation"), []);
  assert.deepEqual(filterTasks(tasks, "My Tasks", "no such task"), []);
});

test("Current tasks cannot be submitted even with a fully answered checklist", () => {
  const task = structuredClone(tasks.find(isTaskBlocked));
  task.checklist = task.checklist.map((item) => ({
    ...item,
    response: item.kind === "dropdown" ? item.options[0] : "Yes",
    customText: "Inspection notes",
  }));
  assert.deepEqual(missingTaskRequirements(task), ["A prerequisite task must be completed first."]);
  assert.throws(() => completeTask(task), /prerequisite task must be completed/);
  assert.equal(taskCategory(task), "My Tasks");
});

test("offline submissions remain in My Tasks until uploaded without losing answers", () => {
  const task = attachAll(answer(scenario("offline"), {
    inspected: "Yes", pressure: "62 PSI", condition: "Good",
  }));
  const pending = completeTask(task);
  assert.deepEqual(filterTasks([pending], "My Tasks", ""), [pending]);
  assert.deepEqual(filterTasks([pending], "Completed", ""), []);
  const completed = uploadPendingTask(pending);
  assert.equal(filterTasks([completed], "My Tasks", "").length, 0);
  assert.deepEqual(filterTasks([completed], "Completed", ""), [completed]);
  assert.deepEqual(completed.checklist, task.checklist);
});


test("new checklist choices start unanswered and accept Yes, No, and N/A", () => {
  for (const task of representativeTasks) {
    for (const item of task.checklist.filter((entry) => entry.kind === "yesNo")) {
      assert.equal(item.response, null);
      for (const response of ["Yes", "No", "N/A"]) {
        assert.equal(isChecklistItemAnswered({ ...item, response }), true);
      }
      assert.equal(isChecklistItemAnswered({ ...item, response: null }), false);
    }
  }
  const legacyTask = tasks.find((task) => task.id === 1);
  assert.equal(legacyTask.checklist.find((item) => item.id === "c4").response, null);
  assert.equal(legacyTask.checklist.find((item) => item.id === "c3").response, "N/A");
});


test("offline walkthrough submits as Pending even if a previous session restored connectivity", () => {
  const task = attachAll(answer(scenario("offline"), {
    inspected: "Yes", pressure: "62 PSI", condition: "Good",
  }));
  task.connection = "Online";
  const pending = completeTask(task);
  assert.equal(pending.status, "Pending");
  assert.equal(pending.connection, "Offline");
  assert.equal(pending.completedDate, null);
  assert.equal(taskCategory(pending), "My Tasks");
  assert.equal(uploadPendingTask(pending).status, "Completed");
});


test("status filters combine with search in My Tasks and do not hide Completed tasks", () => {
  const pending = completeTask(attachAll(answer(scenario("offline"), {
    inspected: "Yes", pressure: "62 PSI", condition: "Good",
  })));
  const entries = tasks.map((task) => task.id === pending.id ? pending : task);
  for (const status of ["Available", "Current", "Pending"]) {
    const filtered = filterTasks(entries, "My Tasks", "", [status]);
    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((task) => taskDisplayStatus(task) === status));
  }
  const combined = filterTasks(entries, "My Tasks", "", ["Current", "Pending"]);
  assert.ok(combined.every((task) => ["Current", "Pending"].includes(taskDisplayStatus(task))));
  assert.deepEqual(filterTasks(entries, "My Tasks", "pressure sensor", ["Pending"]), [pending]);
  assert.deepEqual(filterTasks(entries, "My Tasks", "pressure sensor", ["Available"]), []);
  assert.deepEqual(filterTasks(entries, "My Tasks", "", []), filterTasks(entries, "My Tasks", ""));
  assert.deepEqual(filterTasks(entries, "Completed", "", ["Current"]), filterTasks(entries, "Completed", ""));
});


test("task lists sort by due date across month and year formats without changing source order", () => {
  const base = scenario("validation");
  const entries = [
    { ...base, id: 1, dueDate: "Oct 3, 2026" },
    { ...base, id: 2, dueDate: "April 22" },
    { ...base, id: 3, dueDate: "Dec 31, 2025" },
    { ...base, id: 4, dueDate: "April 20" },
    { ...base, id: 5, dueDate: "April 20" },
    { ...base, id: 6, dueDate: "Date unavailable" },
  ];
  const original = structuredClone(entries);
  assert.deepEqual(filterTasks(entries, "My Tasks", "").map((task) => task.id), [3, 4, 5, 2, 1, 6]);
  assert.deepEqual(entries, original);
  const completed = entries.map((task) => ({ ...task, status: "Completed" }));
  assert.deepEqual(filterTasks(completed, "Completed", "").map((task) => task.id), [3, 4, 5, 2, 1, 6]);
  assert.deepEqual(filterTasks(entries, "My Tasks", "replace fuse", ["Available"]).map((task) => task.id), [3, 4, 5, 2, 1, 6]);
});


test("linked Current tasks unlock when their own prerequisite becomes Pending", () => {
  let entries = structuredClone(tasks);
  const pairs = [
    [104, 3, { inspected: "Yes", condition: "Good", note: "Repair inspected" }],
    [103, 4, { inspected: "Yes", condition: "Good", pressure: "62 PSI" }],
  ];
  for (const [prerequisiteId, dependentId, responses] of pairs) {
    const dependentBefore = entries.find((task) => task.id === dependentId);
    assert.equal(isTaskBlocked(dependentBefore), true);
    assert.equal(dependentBefore.prerequisiteTaskId, prerequisiteId);
    const pending = completeTask(attachAll(answer(entries.find((task) => task.id === prerequisiteId), responses)));
    entries = unlockTaskDependencies(entries.map((task) => task.id === prerequisiteId ? pending : task));
    const dependent = entries.find((task) => task.id === dependentId);
    assert.equal(pending.status, "Pending");
    assert.equal(taskDisplayStatus(dependent), "Available");
    assert.equal(isTaskBlocked(dependent), false);
    assert.deepEqual(dependent.checklist, dependentBefore.checklist);
    assert.ok(!missingTaskRequirements(dependent).some((label) => label.includes("prerequisite")));
    const ready = {
      ...dependent,
      checklist: dependent.checklist.map((item) => ({
        ...item, response: item.kind === "dropdown" ? item.options[0] : "Yes", customText: "Inspection complete",
      })),
    };
    assert.equal(completeTask(ready).status, "Completed");
    entries = unlockTaskDependencies(entries.map((task) => task.id === prerequisiteId ? uploadPendingTask(pending) : task));
    assert.equal(taskDisplayStatus(entries.find((task) => task.id === dependentId)), "Available");
    if (dependentId === 3) assert.equal(isTaskBlocked(entries.find((task) => task.id === 4)), true);
  }
});

test("unsubmitted or missing prerequisites leave Current tasks locked", () => {
  const initial = structuredClone(tasks);
  assert.equal(isTaskBlocked(unlockTaskDependencies(initial).find((task) => task.id === 3)), true);
  assert.equal(isTaskBlocked(unlockTaskDependencies(initial.filter((task) => task.id !== 104)).find((task) => task.id === 3)), true);
  const completedPrerequisite = initial.map((task) => task.id === 104 ? { ...task, status: "Completed" } : task);
  assert.equal(taskDisplayStatus(unlockTaskDependencies(completedPrerequisite).find((task) => task.id === 3)), "Available");
});


test("Error tasks sort first in My Tasks, with date order within each group", () => {
  const entries = [
    { ...tasks[0], id: 701, status: "Not Started", dueDate: "April 1" },
    { ...tasks[0], id: 702, status: "Error", dueDate: "April 23" },
    { ...tasks[0], id: 703, status: "Pending", dueDate: "April 2" },
    { ...tasks[0], id: 704, status: "Error", dueDate: "April 20" },
  ];
  assert.deepEqual(filterTasks(entries, "My Tasks", "").map((task) => task.id), [704, 702, 701, 703]);
  assert.deepEqual(filterTasks(entries, "Completed", ""), []);
});


test("Bay 4 inspection checkbox must be checked to submit", () => {
  const task = attachAll(answer(scenario("uploadFailure"), { condition: "Good", note: "Repair inspected" }));
  const checkbox = task.checklist.find((item) => item.id === "inspected");
  assert.equal(checkbox.kind, "checkbox");
  for (const response of [null, "No", "N/A"]) {
    const unchecked = answer(structuredClone(task), { inspected: response });
    assert.equal(isChecklistItemAnswered(unchecked.checklist.find((item) => item.id === "inspected")), false);
    assert.deepEqual(missingTaskRequirements(unchecked), ["Repair visually inspected"]);
  }
  const checked = answer(task, { inspected: "Yes" });
  assert.deepEqual(missingTaskRequirements(checked), []);
  assert.equal(completeTask(checked).status, "Pending");
  assert.equal(scenario("offline").checklist.find((item) => item.id === "inspected").kind, "yesNo");
});


test("additional gallery photos append without changing required photos or task status", () => {
  const original = scenario("uploadFailure");
  const before = structuredClone(original);
  const preview = galleryPhotoPreview(original);
  assert.equal(preview.attached, false);
  assert.deepEqual(original, before);
  const once = attachGalleryPhoto(original);
  const twice = attachGalleryPhoto(once);
  assert.equal(once.additionalPhotos.length, 1);
  assert.equal(twice.additionalPhotos.length, 2);
  assert.ok(twice.additionalPhotos.every((photo) => photo.attached));
  assert.deepEqual(twice.photos, original.photos);
  assert.deepEqual(missingTaskRequirements(twice), missingTaskRequirements(original));
  assert.equal(twice.status, original.status);
  for (const status of ["Completed", "Upcoming", "Pending", "Error"]) {
    assert.throws(() => attachGalleryPhoto({ ...original, status }), /only be added to Available/);
  }
});


test("gallery capture fills required task and safety photos before adding extras", () => {
  const task = scenario("uploadFailure");
  const original = structuredClone(task);
  let capture = nextGalleryPhoto(task);
  assert.equal(capture.photo.id, "plate");
  assert.equal(capture.additional, false);
  assert.equal(capture.safety, false);
  assert.deepEqual(task, original);
  task.photos[0].attached = true;
  capture = nextGalleryPhoto(task);
  assert.equal(capture.photo.id, "repair");
  assert.equal(capture.additional, false);
  task.photos[1].attached = true;
  assert.equal(nextGalleryPhoto(task).additional, true);
  const safetyTask = scenario("safety");
  safetyTask.safety = newSafetyChecklist(safetyTask);
  safetyTask.photos?.forEach((photo) => { photo.attached = true; });
  assert.equal(nextGalleryPhoto(safetyTask).safety, true);
  assert.equal(nextGalleryPhoto(safetyTask).photo.id, "hazard");
  safetyTask.safety.photo.attached = true;
  assert.equal(nextGalleryPhoto(safetyTask).additional, true);
});


test("tasks submit without photos and do not upload or fail nonexistent photos", () => {
  for (const [name, values] of [
    ["validation", { installed: "Yes", condition: "Good", contact: "Jeffrey Fisher", clear: "Yes" }],
    ["offline", { inspected: "Yes", pressure: "62 PSI", condition: "Good" }],
    ["uploadFailure", { inspected: "Yes", condition: "Good", note: "Repair inspected" }],
  ]) {
    const task = answer(scenario(name), values);
    assert.ok(task.photos.every((photo) => !photo.attached));
    assert.deepEqual(missingTaskRequirements(task), []);
    const submitted = completeTask(task);
    const completed = submitted.status === "Pending" ? uploadPendingTask(submitted) : submitted;
    assert.equal(completed.status, "Completed");
    assert.ok(completed.photos.every((photo) => !photo.attached && photo.upload === "Saved on device"));
  }
});


test("photo descriptions and deletion affect only the selected photo", () => {
  const original = attachGalleryPhoto(attachGalleryPhoto(scenario("uploadFailure"), "First"), "Second");
  const before = structuredClone(original);
  const edited = changeTaskPhoto(original, { source: "additional", index: 1 }, "Updated");
  assert.equal(edited.additionalPhotos[0].description, "First");
  assert.equal(edited.additionalPhotos[1].description, "Updated");
  assert.deepEqual(original, before);
  const deleted = changeTaskPhoto(edited, { source: "additional", index: 0 }, null);
  assert.equal(deleted.additionalPhotos.length, 1);
  assert.equal(deleted.additionalPhotos[0].description, "Updated");
  const task = attachAll(scenario("uploadFailure"));
  const taskEdited = changeTaskPhoto(task, { source: "task", index: 0 }, "Plate");
  assert.equal(taskEdited.photos[0].description, "Plate");
  assert.equal(changeTaskPhoto(taskEdited, { source: "task", index: 0 }, null).photos[0].attached, false);
  assert.equal(taskEdited.photos[1].attached, true);
  const safetyTask = scenario("safety");
  safetyTask.safety = newSafetyChecklist(safetyTask);
  safetyTask.safety.photo.attached = true;
  const safetyEdited = changeTaskPhoto(safetyTask, { source: "safety", index: 0 }, "Standing water");
  assert.equal(safetyEdited.safety.photo.description, "Standing water");
  assert.equal(changeTaskPhoto(safetyEdited, { source: "safety", index: 0 }, null).safety.photo.attached, false);
});
