import { compareListItems, ListSort } from "./list-sort";
import type { EvidencePhoto, SafetyChecklist } from "./tasks";

export const checklistTypes = ["Industrial", "Electrical", "Site Hazards", "General"] as const;
export const checklistTypeIcons = {
  Industrial: { ios: "wrench.and.screwdriver", android: "construction", web: "construction" },
  Electrical: { ios: "bolt", android: "bolt", web: "bolt" },
  "Site Hazards": { ios: "exclamationmark.triangle", android: "warning", web: "warning" },
  General: { ios: "checklist", android: "fact_check", web: "fact_check" },
} as const;
export type ChecklistType = (typeof checklistTypes)[number];
export type ChecklistSection = "Submitted" | "Pending" | "Drafts";
export type SafetyFormFields = Omit<SafetyChecklist, "status" | "saved" | "photo">;
export type SafetyForm = {
  id: string;
  createdAt: number;
  type: ChecklistType;
  title: string;
  description: string;
  status: "Draft" | "Pending";
  saved: boolean;
  fields: SafetyFormFields;
  photos: EvidencePhoto[];
  savedContent: string;
};

export function formContent(form: Pick<SafetyForm, "title" | "description" | "fields" | "photos">): string {
  return JSON.stringify({ title: form.title, description: form.description, fields: form.fields, photos: form.photos });
}

export function newSafetyForm(id: string, type: ChecklistType): SafetyForm {
  const content = {
    title: "", description: "", photos: [],
    fields: { condition: null, ppe: [], hazard: "", controlPlan: "", crewMember: "", resolution: "", reviewedWithCrew: false },
  };
  return { ...content, id, createdAt: Date.now(), type, status: "Draft", saved: false, savedContent: formContent(content) };
}

export function hasFormChanges(form: SafetyForm): boolean {
  return formContent(form) !== form.savedContent;
}

export function saveFormDraft(form: SafetyForm, force = false): SafetyForm {
  return form.status !== "Draft" || (!force && !hasFormChanges(form)) ? form : { ...form, saved: true, savedContent: formContent(form) };
}

export function missingFormFields(form: SafetyForm): string[] {
  return [
    ...(!form.title.trim() ? ["title"] : []),
    ...(!form.fields.condition ? ["condition"] : []),
    ...(!form.fields.ppe.length ? ["ppe"] : []),
    ...(["hazard", "controlPlan", "crewMember", "resolution"] as const).filter((key) => !form.fields[key].trim()),
    ...(!form.fields.reviewedWithCrew ? ["reviewedWithCrew"] : []),
  ];
}

export function submitForm(form: SafetyForm): SafetyForm {
  if (form.status !== "Draft") throw new Error("This form has already been submitted.");
  if (missingFormFields(form).length) throw new Error("Required Fields Missing");
  return { ...form, status: "Pending", saved: true, savedContent: formContent(form) };
}

export function changeForm(form: SafetyForm, changes: Partial<Pick<SafetyForm, "title" | "description" | "fields" | "photos">>): SafetyForm {
  return form.status === "Draft" ? { ...form, ...changes } : form;
}


export function filterSafetyForms(forms: SafetyForm[], section: ChecklistSection | "All", query: string, statuses: readonly ChecklistSection[] = [], sort: ListSort = "oldest"): SafetyForm[] {
  const search = query.trim().toLowerCase();
  const category = (form: SafetyForm): ChecklistSection => form.status === "Draft" ? "Drafts" : form.status === "Pending" ? "Pending" : "Submitted";
  const createdAt = (form: SafetyForm) => form.createdAt ?? Number(form.id.split("-")[1]);
  return forms.filter((form) => form.saved &&
    (section === "All" || category(form) === section) &&
    (!statuses.length || statuses.includes(category(form))) &&
    `${form.title.trim() || "Draft Checklist"} ${form.description} ${form.type} Safety Checklist ${form.status}`.toLowerCase().includes(search))
    .sort((left, right) => compareListItems(left.title.trim() || "Draft Checklist", right.title.trim() || "Draft Checklist", createdAt(left), createdAt(right), sort));
}
