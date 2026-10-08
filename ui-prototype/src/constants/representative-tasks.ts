import type { ChecklistItem, EvidencePhoto, PhotoKind, Task } from "./tasks";

function check(id: string, label: string): ChecklistItem {
  return { id, label, kind: "yesNo", response: null, customText: "", allowNA: false };
}

function text(id: string, label: string): ChecklistItem {
  return { id, label, kind: "text", response: null, customText: "" };
}

function condition(): ChecklistItem {
  return {
    id: "condition",
    label: "Equipment condition",
    kind: "dropdown",
    options: ["Good", "Fair", "Poor"],
    response: null,
    customText: "",
  };
}

export function createPhoto(
  id: PhotoKind,
  label: string,
  date: string,
  time: string,
  location: string,
): EvidencePhoto {
  return { id, label, date, time, location, attached: false, upload: "Saved on device" };
}

const base: Pick<Task,
  "availableOffline" | "syncStatus" | "projectNo" | "disciplineNo" |
  "disciplineName" | "workflowType" | "timeEstimateHours" | "completedBy" |
  "completedDate" | "attachments"
> = {
  availableOffline: true,
  syncStatus: "Up to date",
  projectNo: "ORB.FIELD.2026",
  disciplineNo: "ELEC.001",
  disciplineName: "Electrical",
  workflowType: "Field inspection",
  timeEstimateHours: 1,
  completedBy: null,
  completedDate: null,
  attachments: [],
};

export const representativeTasks: Task[] = [
  {
    ...base,
    id: 101,
    scenario: "validation",
    technician: "Sarah Miller",
    title: "Replace Fuse – Control Cabinet 3",
    location: "North Ridge Substation",
    dueDate: "April 20",
    status: "In Progress",
    priority: "High",
    taskCode: "FUSE.003",
    connection: "Online",
    description: "Replace the failed 15A fuse in Control Cabinet 3 and complete the post-replacement inspection.",
    instructions: "Record the installation, equipment condition, and foreman or site contact. Attach a readable photograph of the inspection sticker and confirm the work area is clear before submitting.",
    checklist: [
      check("installed", "New 15A fuse installed"),
      condition(),
      text("contact", "Foreman or site contact"),
      check("clear", "Work area clear of tools and debris"),
    ],
    photos: [createPhoto("sticker", "Inspection-sticker photograph", "April 20", "2:14 PM", "North Ridge Substation")],
  },
  {
    ...base,
    id: 102,
    scenario: "safety",
    technician: "Marcus Lee",
    title: "Inspect Control Panel – Pump 2",
    location: "East Valley Pump Station",
    dueDate: "April 21",
    status: "Not Started",
    priority: "High",
    taskCode: "PANEL.002",
    connection: "Online",
    description: "Inspect the Pump 2 electrical control panel.",
    instructions: "Inspect the electrical control panel and document the condition. Create a Safety Checklist for any job-site hazard before beginning work.",
    checklist: [
      check("panel", "Electrical control panel inspected"),
      condition(),
      text("notes", "Inspection notes"),
    ],
  },
  {
    ...base,
    id: 103,
    scenario: "offline",
    technician: "Aisha Patel",
    title: "Inspect Pressure Sensor – Pump 4",
    location: "West Creek Pump Station",
    dueDate: "April 22",
    status: "Not Started",
    priority: "Normal",
    taskCode: "SENSOR.004",
    connection: "Offline",
    description: "Inspect the Pump 4 pressure sensor, record the current reading, inspect the sensor for visible damage, and document the completed inspection.",
    instructions: "Record the pressure reading with its unit and select the sensor condition. Attach a photograph that clearly shows the sensor and identification label.",
    checklist: [
      check("inspected", "Pressure sensor visually inspected"),
      text("pressure", "Current pressure reading"),
      { ...condition(), label: "Sensor condition" },
    ],
    photos: [createPhoto("sensor", "Pressure-sensor photograph", "April 22", "3:14 PM", "West Creek Pump Station")],
  },
  {
    ...base,
    id: 104,
    scenario: "uploadFailure",
    technician: "Daniel Brooks",
    title: "Inspect Repaired Disconnect Switch – Bay 4",
    location: "Cedar Grove Substation",
    dueDate: "April 23",
    status: "In Progress",
    priority: "High",
    taskCode: "SWITCH.004",
    connection: "Poor connectivity",
    description: "Inspect the repaired disconnect switch in Bay 4, verify that the repair is complete, and document the condition of the equipment.",
    instructions: "Record the inspection and equipment condition, add an inspection note, and attach separate photographs of the identification plate and completed repair.",
    checklist: [
      check("inspected", "Repair visually inspected"),
      condition(),
      text("note", "Inspection note"),
    ],
    photos: [
      createPhoto("plate", "Equipment identification-plate photograph", "April 23", "3:52 PM", "Cedar Grove Substation"),
      createPhoto("repair", "Completed-repair photograph", "April 23", "3:53 PM", "Cedar Grove Substation"),
    ],
  },
];
