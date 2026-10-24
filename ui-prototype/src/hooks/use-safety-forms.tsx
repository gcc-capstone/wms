import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";

import { changeForm, ChecklistSection, ChecklistType, hasFormChanges, newSafetyForm, SafetyForm, saveFormDraft, submitForm } from "../constants/safety-forms";
import { EvidencePhoto } from "../constants/tasks";

type Notice = { sequence: number; section: ChecklistSection; message?: string };
type Store = {
  forms: SafetyForm[];
  createForm: (type: ChecklistType) => string;
  updateForm: (id: string, changes: Partial<Pick<SafetyForm, "title" | "description" | "fields" | "photos">>) => void;
  closeForm: (id: string) => void;
  saveDraft: (id: string) => void;
  deleteForm: (id: string) => void;
  submitForm: (id: string) => boolean;
  addPhoto: (id: string, description: string) => void;
  editPhoto: (id: string, index: number, description: string | null) => void;
  notice: Notice | null;
  acknowledgeNotice: () => void;
};
const Context = createContext<Store | null>(null);

export function SafetyFormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<SafetyForm[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const sequence = useRef(0);
  const acknowledgeNotice = useCallback(() => setNotice(null), []);
  const announce = (section: ChecklistSection, message?: string) => setNotice({ sequence: ++sequence.current, section, message });
  const createForm = (type: ChecklistType) => {
    const id = `form-${Date.now()}-${++sequence.current}`;
    setForms((previous) => [...previous, newSafetyForm(id, type)]);
    return id;
  };
  const updateForm: Store["updateForm"] = (id, changes) => setForms((previous) => previous.map((form) => form.id === id ? changeForm(form, changes) : form));
  const closeForm = (id: string) => {
    const form = forms.find((entry) => entry.id === id);
    if (!form || form.status !== "Draft") return;
    if (hasFormChanges(form)) {
      setForms((previous) => previous.map((entry) => entry.id === id ? saveFormDraft(entry) : entry));
      announce("Drafts", "Form saved as a draft");
    } else if (!form.saved) {
      setForms((previous) => previous.filter((entry) => entry.id !== id));
    }
  };
  const saveDraft = (id: string) => {
    const form = forms.find((entry) => entry.id === id);
    if (!form || form.status !== "Draft") return;
    setForms((previous) => previous.map((entry) => entry.id === id ? saveFormDraft(entry, true) : entry));
    announce("Drafts", "Form saved as a draft");
  };
  const deleteForm = (id: string) => {
    setForms((previous) => previous.filter((form) => form.id !== id || form.status !== "Draft"));
  };
  const submit = (id: string) => {
    const form = forms.find((entry) => entry.id === id);
    if (!form) return false;
    try {
      const pending = submitForm(form);
      setForms((previous) => previous.map((entry) => entry.id === id ? pending : entry));
      announce("Pending");
      return true;
    } catch { return false; }
  };
  const addPhoto = (id: string, description: string) => {
    const photo: EvidencePhoto = { id: "hazard", label: "Safety checklist photo", attached: true, description, date: "", time: "", location: "", upload: "Saved on device" };
    setForms((previous) => previous.map((form) => form.id === id ? changeForm(form, { photos: [...form.photos, photo] }) : form));
  };
  const editPhoto: Store["editPhoto"] = (id, index, description) => setForms((previous) => previous.map((form) => form.id === id
    ? changeForm(form, { photos: form.photos.flatMap((photo, position) => position !== index ? [photo] : description === null ? [] : [{ ...photo, description }]) })
    : form));

  return <Context.Provider value={{ forms, createForm, updateForm, closeForm, saveDraft, deleteForm, submitForm: submit, addPhoto, editPhoto, notice, acknowledgeNotice }}>{children}</Context.Provider>;
}

export function useSafetyForms(): Store {
  const store = useContext(Context);
  if (!store) throw new Error("SafetyFormProvider is required.");
  return store;
}
