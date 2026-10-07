/*
  Dummy task data shared by the task list and task detail screens.
  This is prototype-only data — nothing here is persisted or fetched from a server.
*/

export type TaskStatus = "Current" | "Upcoming" | "Completed";
export type Priority = "High" | "Medium" | "Low";
export type SyncStatus = "Unsynced" | "Up to date";
export type ChecklistResponse = "Yes" | "N/A" | "A" | "B" | "C";
// Each checklist item takes exactly one input form: a Yes/N/A toggle,
// an A/B/C dropdown, or a free-form text answer.
export type ChecklistKind = "yesNo" | "dropdown" | "text";

export type ChecklistItem = {
  id: string;
  label: string;
  kind: ChecklistKind;
  response: ChecklistResponse | null;
  // Free-form answer typed by the user. Only used when kind is "text".
  customText: string;
};

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
};

export const tasks: Task[] = [
  {
    id: 1,
    title: "Inspect Pole Line Segment",
    dueDate: "Oct 3, 2026",
    status: "Current",
    description:
      "Complete the field inspection and record visible damage, access issues, and site notes.",
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
      { id: "c5", label: "Record clearance measurements to nearest obstruction", kind: "dropdown", response: "B", customText: "" },
      { id: "c6", label: "Note any access or right-of-way issues", kind: "dropdown", response: null, customText: "" },
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
      { id: "c4", label: "Capture updated photos of each measurement point", kind: "dropdown", response: "A", customText: "" },
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
      { id: "c4", label: "Check for restricted or gated access", kind: "dropdown", response: null, customText: "" },
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
      { id: "c4", label: "Flag obstructions blocking equipment access", kind: "dropdown", response: null, customText: "" },
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
      { id: "c5", label: "Confirm all site notes uploaded to the project folder", kind: "dropdown", response: "A", customText: "" },
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
