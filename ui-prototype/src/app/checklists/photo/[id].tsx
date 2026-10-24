import { useLocalSearchParams } from "expo-router";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { PhotoCapture } from "../../../components/photo-capture";
import { useSafetyForms } from "../../../hooks/use-safety-forms";
import { EvidencePhoto } from "../../../constants/tasks";

const photo: EvidencePhoto = { id: "hazard", label: "Safety checklist photo", attached: false, date: "", time: "", location: "", upload: "Saved on device" };

export default function ChecklistPhotoCaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const back = useSmoothReturn(`/checklists/photos/${id}`);
  const { forms, addPhoto } = useSafetyForms();
  const form = forms.find((entry) => entry.id === id);
  return <PhotoCapture photo={form ? photo : undefined} readOnly={!form || form.status !== "Draft"} returnToSource={back} onUsePhoto={(description) => addPhoto(id, description)} />;
}
