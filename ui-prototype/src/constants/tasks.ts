/*
  Dummy task data shared by the task list and task detail screens.
  This is prototype-only data — nothing here is persisted or fetched from a server.
*/
import { representativeTasks } from "./representative-tasks";

export type TaskStatus = "Current" | "Upcoming" | "In Progress" | "Not Started" | "Completed";
export type Priority = "High" | "Normal" | "Medium" | "Low";
export type SyncStatus = "Unsynced" | "Up to date" | "Synchronizing" | "Upload failed";
export type Scenario = "validation" | "safety" | "offline" | "uploadFailure";
export type PhotoKind = "sticker" | "hazard" | "sensor" | "plate" | "repair";
export type PhotoUpload = "Saved on device" | "Uploading" | "Received by WMS" | "Upload failed";

export type EvidencePhoto = {
  id: PhotoKind;
  label: string;
  attached: boolean;
  date: string;
  time: string;
  location: string;
  upload: PhotoUpload;
};

export type SafetyChecklist = {
  status: "Draft" | "Submitted";
  saved: boolean;
  condition: string | null;
  ppe: string[];
  hazard: string;
  controlPlan: string;
  crewMember: string;
  resolution: string;
  reviewedWithCrew: boolean;
  photo: EvidencePhoto;
};
export type ChecklistResponse = string;
// Each checklist item takes exactly one input form: a Yes/N/A toggle,
// a task-specific dropdown, or a free-form text answer.
export type ChecklistKind = "yesNo" | "dropdown" | "text";

export type ChecklistItem = {
  id: string;
  label: string;
  response: ChecklistResponse | null;
  // Free-form answer typed by the user. Only used when kind is "text".
  customText: string;
  allowNA?: boolean;
} & (
  | { kind: "dropdown"; options: string[] }
  | { kind: "yesNo" | "text" }
);

export type Attachment = {
  id: string;
  fileName: string;
  extension: string;
  size: string;
  createdDate: string;
  createdBy: string;
};

export type Task = {
  id: number;
  title: string;
  dueDate: string;
  status: TaskStatus;
  description: string;
  instructions: string;
  priority: Priority;
  availableOffline: boolean;
  syncStatus: SyncStatus;
  projectNo: string;
  disciplineNo: string;
  disciplineName: string;
  workflowType: string;
  taskCode: string;
  timeEstimateHours: number;
  completedBy: string | null;
  completedDate: string | null;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  scenario?: Scenario;
  technician?: string;
  location?: string;
  photos?: EvidencePhoto[];
  safety?: SafetyChecklist;
  connection?: "Online" | "Offline" | "Poor connectivity";
  syncAttempt?: "initial" | "retry";
};

export const tasks: Task[] = [
  ...representativeTasks,
  {
    id: 1,
    title: "Inspect Pole Line Segment",
    dueDate: "Oct 3, 2026",
    status: "Current",
    description:
      "Complete the field inspection and record visible damage, access issues, and site notes.",
    instructions:
      "Verify the pole ID against the project mastersheet before recording observations. Photograph each side and document the condition of guy wires and anchors. Classify clearance and access conditions below, then use the notes field to identify third-party attachments or state that none were found. Flag any damage or restricted access for the project manager before leaving the site.",
    priority: "High",
    availableOffline: true,
    syncStatus: "Unsynced",
    projectNo: "FRSTE0.FETDWP.UTY.003912",
    disciplineNo: "WPN.012",
    disciplineName: "22-WIN0118",
    workflowType: "First Energy",
    taskCode: "INS.004",
    timeEstimateHours: 3.5,
    completedBy: null,
    completedDate: null,
    checklist: [
      { id: "c1", label: "Verify pole number matches project mastersheet", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c2", label: "Photograph all four sides of the pole", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c3", label: "Check for visible rot, cracking, or woodpecker damage", kind: "yesNo", response: "N/A", customText: "" },
      { id: "c4", label: "Confirm guy wire tension and anchor condition", kind: "yesNo", response: null, customText: "" },
      { id: "c5", label: "Classify clearance to nearest obstruction", kind: "dropdown", options: ["Clearance verified", "Measurement review needed", "Obstruction identified"], response: "Measurement review needed", customText: "" },
      { id: "c6", label: "Record access or right-of-way conditions", kind: "dropdown", options: ["Unrestricted access", "Gate or permission required", "Access blocked"], response: null, customText: "" },
      { id: "c7", label: "Flag any third-party attachments found on the pole", kind: "text", response: null, customText: "East anchor tension felt slightly loose — flagged for follow-up." },
    ],
    attachments: [
      {
        id: "a1",
        fileName: "Pole_Segment_Overview",
        extension: ".jpg",
        size: "2.4 MB",
        createdDate: "2026-09-29",
        createdBy: "Alex Rivera",
      },
      {
        id: "a2",
        fileName: "Field_Notes_09-29",
        extension: ".pdf",
        size: "184 KB",
        createdDate: "2026-09-29",
        createdBy: "Alex Rivera",
      },
    ],
  },
  {
    id: 2,
    title: "Verify Site Measurements",
    dueDate: "Oct 5, 2026",
    status: "Current",
    description:
      "Confirm measurements from the previous survey and attach updated field photos.",
    instructions:
      "Use the survey comparison sheet to verify span lengths, roadway clearance, and attachment heights at both poles. Record the photo coverage for the measurement points. Describe each discrepancy with its location and corrected measurement, or enter 'No discrepancies found' if the survey matches the field conditions.",
    priority: "Medium",
    availableOffline: true,
    syncStatus: "Up to date",
    projectNo: "FRSTE0.FETDWP.UTY.003918",
    disciplineNo: "WPN.027",
    disciplineName: "22-WIN0205",
    workflowType: "COMM without SPANS",
    taskCode: "SUR.011",
    timeEstimateHours: 2,
    completedBy: null,
    completedDate: null,
    checklist: [
      { id: "c1", label: "Compare span length to previous survey data", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c2", label: "Verify mid-span clearance over roadway", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c3", label: "Confirm attachment heights on both poles", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c4", label: "Record measurement photo coverage", kind: "dropdown", options: ["All points photographed", "Partial coverage - follow-up needed", "Photos not required"], response: "All points photographed", customText: "" },
      { id: "c5", label: "Document any discrepancies from the original survey", kind: "text", response: null, customText: "" },
    ],
    attachments: [
      {
        id: "a1",
        fileName: "Survey_Comparison_Sheet",
        extension: ".xlsx",
        size: "96 KB",
        createdDate: "2026-09-27",
        createdBy: "Priya Natarajan",
      },
    ],
  },
  {
    id: 3,
    title: "Transformer Location Review",
    dueDate: "Oct 12, 2026",
    status: "Upcoming",
    description:
      "Review the assigned transformer locations and note any access or clearance concerns.",
    instructions:
      "Compare each assigned location with the site map and confirm coordinates. Check nearby structures, vegetation, and overhead lines for conflicts. Select the access condition and describe the existing pad or riser pole, including any repairs or follow-up review needed.",
    priority: "Medium",
    availableOffline: false,
    syncStatus: "Up to date",
    projectNo: "FRSTE0.FETDWP.UTY.003944",
    disciplineNo: "WPN.034",
    disciplineName: "22-WIN0231",
    workflowType: "First Energy",
    taskCode: "REV.006",
    timeEstimateHours: 1.5,
    completedBy: null,
    completedDate: null,
    checklist: [
      { id: "c1", label: "Confirm transformer GPS coordinates on site map", kind: "yesNo", response: null, customText: "" },
      { id: "c2", label: "Verify clearance from structures and vegetation", kind: "yesNo", response: null, customText: "" },
      { id: "c3", label: "Check for overhead conflicts with existing lines", kind: "yesNo", response: null, customText: "" },
      { id: "c4", label: "Record transformer site access", kind: "dropdown", options: ["Open access", "Gated - key required", "Restricted - escort required"], response: null, customText: "" },
      { id: "c5", label: "Note condition of existing pad or riser pole", kind: "text", response: null, customText: "" },
    ],
    attachments: [],
  },
  {
    id: 4,
    title: "Right-of-Way Photo Survey",
    dueDate: "Oct 18, 2026",
    status: "Upcoming",
    description:
      "Capture required right-of-way photos and document any obstructions.",
    instructions:
      "Photograph the corridor from both directions and include close-ups of vegetation, fencing, and access points. Classify equipment access and reference photo locations in your notes so the project team can locate each obstruction on the map. If the corridor is clear, explicitly note that no obstructions were found.",
    priority: "Low",
    availableOffline: true,
    syncStatus: "Up to date",
    projectNo: "FRSTE0.FETDWP.UTY.003967",
    disciplineNo: "WPN.041",
    disciplineName: "22-WIN0260",
    workflowType: "COMM without SPANS",
    taskCode: "PHO.002",
    timeEstimateHours: 2.5,
    completedBy: null,
    completedDate: null,
    checklist: [
      { id: "c1", label: "Photograph full right-of-way corridor", kind: "yesNo", response: null, customText: "" },
      { id: "c2", label: "Document overgrown vegetation or encroachments", kind: "yesNo", response: null, customText: "" },
      { id: "c3", label: "Note any fencing, gates, or locked access points", kind: "yesNo", response: null, customText: "" },
      { id: "c4", label: "Classify equipment access obstructions", kind: "dropdown", options: ["No obstructions", "Vegetation clearing needed", "Fence or gate blocks access"], response: null, customText: "" },
      { id: "c5", label: "Tag photo locations to the project map", kind: "text", response: null, customText: "" },
    ],
    attachments: [],
  },
  {
    id: 5,
    title: "Completed Site Walkdown",
    dueDate: "Sep 28, 2026",
    status: "Completed",
    description:
      "Field walkdown completed and submitted with all required notes and attachments.",
    instructions:
      "The walkdown covered strand maps, overlapping proposals, and right-of-way crossings. All site notes and supporting photos were filed in the project folder. Review the submitted checklist and attached summary report for the final observations and completion record.",
    priority: "High",
    availableOffline: true,
    syncStatus: "Up to date",
    projectNo: "FRSTE0.FETDWP.UTY.003879",
    disciplineNo: "WPN.008",
    disciplineName: "22-WIN0074",
    workflowType: "First Energy",
    taskCode: "WLK.009",
    timeEstimateHours: 4,
    completedBy: "Ronald Flores",
    completedDate: "09/28/2026",
    checklist: [
      { id: "c1", label: "Verify or enter your name in the project mastersheet", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c2", label: "Check spans for strand maps", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c3", label: "Verify overlapping proposals were checked by tracer", kind: "yesNo", response: "Yes", customText: "" },
      { id: "c4", label: "Check route for R.O.W. crossings", kind: "yesNo", response: "N/A", customText: "" },
      { id: "c5", label: "Record project folder documentation status", kind: "dropdown", options: ["All notes uploaded", "Upload pending", "No additional notes required"], response: "All notes uploaded", customText: "" },
      { id: "c6", label: "Notify project manager of walkdown completion", kind: "text", response: null, customText: "Called site supervisor to confirm completion — no outstanding items." },
    ],
    attachments: [
      {
        id: "a1",
        fileName: "Walkdown_Summary_Report",
        extension: ".pdf",
        size: "312 KB",
        createdDate: "2026-09-28",
        createdBy: "Ronald Flores",
      },
      {
        id: "a2",
        fileName: "Site_Photos_Batch1",
        extension: ".zip",
        size: "18.6 MB",
        createdDate: "2026-09-28",
        createdBy: "Ronald Flores",
      },
      {
        id: "a3",
        fileName: "Signed_Checklist",
        extension: ".pdf",
        size: "221 KB",
        createdDate: "2026-09-28",
        createdBy: "Ronald Flores",
      },
    ],
  },
];

export function getTaskById(id: number): Task | undefined {
  return tasks.find((task) => task.id === id);
}

export function isChecklistItemAnswered(item: ChecklistItem): boolean {
  switch (item.kind) {
    case "text":
      return item.customText.trim().length > 0;
    case "yesNo":
      return item.response === "Yes" || (item.allowNA !== false && item.response === "N/A");
    case "dropdown":
      return item.response !== null && item.options.includes(item.response);
  }
}
