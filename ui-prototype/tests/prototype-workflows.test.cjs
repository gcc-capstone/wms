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
  missingTaskRequirements,
  completeTask,
  newSafetyChecklist,
  missingSafetyRequirements,
  startSync,
  finishSync,
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

test("Task submission requires real text and required photos", () => {
  const task = answer(scenario("offline"), {
    inspected: "Yes",
    pressure: "  ",
    condition: "Good",
  });
  assert.deepEqual(missingTaskRequirements(task), [
    "Current pressure reading",
    "Pressure-sensor photograph",
  ]);
  assert.throws(() => completeTask(task), /Required information missing/);
  assert.equal(isChecklistItemAnswered({ ...task.checklist[0], response: "N/A" }), false);
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

test("Aisha completes offline and later synchronizes successfully", () => {
  const task = attachAll(answer(scenario("offline"), {
    inspected: "Yes",
    pressure: "62 PSI",
    condition: "Good",
  }));
  const completed = completeTask(task);
  assert.equal(completed.syncStatus, "Unsynced");
  assert.equal(completed.connection, "Offline");
  assert.equal(completed.photos[0].upload, "Saved on device");
  const syncing = startSync(completed);
  assert.equal(syncing.syncStatus, "Synchronizing");
  assert.equal(syncing.photos[0].upload, "Uploading");
  const synced = finishSync(syncing);
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
  const completed = completeTask(task);
  const failed = finishSync(startSync(completed));
  assert.equal(failed.syncStatus, "Upload failed");
  assert.equal(failed.photos[0].upload, "Received by WMS");
  assert.equal(failed.photos[1].upload, "Upload failed");
  assert.equal(failed.photos[1].attached, true);
  const retry = startSync(failed, true);
  assert.equal(retry.photos[0].upload, "Received by WMS");
  assert.equal(retry.photos[1].upload, "Uploading");
  const synced = finishSync(retry);
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
  assert.throws(() => startSync(completed, true), /current state/);
  assert.throws(() => startSync(startSync(completed)), /current state/);
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
