import { useLocalSearchParams } from "expo-router";

import { PhotoCapture } from "../../../components/photo-capture";
import { useSmoothReturn } from "../../../components/android-back-transition";
import { galleryPhotoPreview } from "../../../constants/prototype-workflows";
import { taskDisplayStatus } from "../../../constants/task-list";
import { useTasks } from "../../../hooks/use-tasks";

export default function PhotoReviewScreen() {
  const { id, photoId, safety, fromGallery, addPhoto } = useLocalSearchParams<{ id: string; photoId: string; safety?: string; fromGallery?: string; addPhoto?: string }>();
  const isSafety = safety === "true";
  const returnToSource = useSmoothReturn(fromGallery === "true" ? `/tasks/photos/${Number(id)}` : `/tasks/${Number(id)}`);
  const { tasks, keepPhoto } = useTasks();
  const task = tasks.find((entry) => entry.id === Number(id));
  const additional = addPhoto === "true";
  const photo = additional && task ? galleryPhotoPreview(task) : isSafety
    ? task?.safety?.photo.id === photoId ? task.safety.photo : undefined
    : task?.photos?.find((entry) => entry.id === photoId);
  const readOnly = !task || taskDisplayStatus(task) !== "Available" || (isSafety && task.safety?.status === "Submitted");
  return <PhotoCapture photo={photo} readOnly={readOnly} returnToSource={returnToSource} onUsePhoto={(description) => {
    if (task && photo) keepPhoto(task.id, photo.id, additional ? false : isSafety, additional, description);
  }} />;
}
