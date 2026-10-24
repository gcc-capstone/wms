import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { photoUri } from "../constants/evidence-photos";
import { nextGalleryPhoto } from "../constants/prototype-workflows";
import { taskDisplayStatus } from "../constants/task-list";
import { Task, TaskPhotoRef } from "../constants/tasks";
import { useTasks } from "../hooks/use-tasks";
import { sharedStyles, theme } from "../theme/orbital-theme";

export function TaskPhotoGallery({ task }: { task: Task }) {
  const { editPhoto } = useTasks();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [viewerSize, setViewerSize] = useState({ width, height });
  const editingSession = useRef(false);
  const tapStartedEditing = useRef(false);
  const previewWidth = Math.max(0, Math.min(viewerSize.width - 2 * theme.spacing.xl, 960, Math.max(100, viewerSize.height - insets.top - insets.bottom - 330) * 480 / 280));
  const [selectedRef, setSelectedRef] = useState<TaskPhotoRef | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [gridWidth, setGridWidth] = useState(0);
  const photos = [
    ...(task.photos ?? []).map((photo, index) => ({ photo, target: { source: "task" as const, index } })),
    ...(task.safety ? [{ photo: task.safety.photo, target: { source: "safety" as const, index: 0 } }] : []),
    ...(task.additionalPhotos ?? []).map((photo, index) => ({ photo, target: { source: "additional" as const, index } })),
  ].filter(({ photo }) => photo.attached);
  const selected = photos.find(({ target }) => target.source === selectedRef?.source && target.index === selectedRef.index)?.photo;
  const closePreview = () => { editingSession.current = false; setSelectedRef(null); setConfirmDelete(false); setEditing(false); };
  const saveDescription = () => {
    if (!editingSession.current) return;
    editingSession.current = false;
    if (selectedRef) editPhoto(task.id, selectedRef, description.trim());
    setEditing(false);
  };
  const beginOutsideTap = () => {
    tapStartedEditing.current = editingSession.current;
    if (editingSession.current) saveDescription();
  };
  const endOutsideTap = () => {
    if (tapStartedEditing.current) { tapStartedEditing.current = false; return; }
    if (editingSession.current) saveDescription();
    else closePreview();
  };
  const canAddPhoto = taskDisplayStatus(task) === "Available";
  const capture = nextGalleryPhoto(task);
  const tileSize = Math.max(0, (gridWidth - 2 * theme.spacing.sm) / 3);

  return (
    <>
      <View style={styles.gallery} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {photos.map(({ photo, target }, index) => (
          <Pressable
            key={`${photo.id}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`View photo: ${photo.label}`}
            style={[styles.tile, { width: tileSize }]}
            onPress={() => { setViewerSize({ width, height }); setSelectedRef(target); setConfirmDelete(false); setEditing(false); editingSession.current = false; }}
          >
            <Image source={{ uri: photoUri(photo.id) }} style={styles.thumbnail} contentFit="cover" accessibilityLabel={photo.label} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          accessibilityState={{ disabled: !canAddPhoto }}
          disabled={!canAddPhoto}
          style={[styles.tile, styles.addTile, { width: tileSize }, !canAddPhoto && styles.disabled]}
          onPress={() => router.push({ pathname: "/tasks/photo/[id]", params: { id: task.id, photoId: capture.photo.id, safety: String(capture.safety), addPhoto: String(capture.additional), fromGallery: "true" } })}
        >
          <Text style={styles.plus}>+</Text>
          <Text style={styles.addLabel}>Add photo</Text>
        </Pressable>
      </View>
      <Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => { if (confirmDelete) setConfirmDelete(false); else if (editingSession.current) saveDescription(); else closePreview(); }} statusBarTranslucent>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close photo preview" onPressIn={beginOutsideTap} onPress={endOutsideTap} />
          <View style={{ position: "absolute", top: (viewerSize.height - previewWidth * 280 / 480) / 2, left: (viewerSize.width - previewWidth) / 2, width: previewWidth }} pointerEvents="box-none">
            <Pressable accessibilityRole="button" accessibilityLabel="Photo preview" onPress={saveDescription} style={[styles.preview, { width: previewWidth }]}>
              {selected && <Image source={{ uri: photoUri(selected.id) }} style={styles.fullPhoto} contentFit="contain" accessibilityLabel={selected.label} />}
            </Pressable>
            {editing ? (
              <View style={styles.descriptionEditor}>
                <TextInput autoFocus accessibilityLabel="Edit photo description" placeholder="Description (optional)" placeholderTextColor="#A8ADB4" keyboardAppearance="dark" value={description} onChangeText={setDescription} onBlur={saveDescription} multiline style={styles.descriptionInput} />

              </View>
            ) : <ScrollView style={styles.descriptionScroll}>
              <Pressable accessibilityRole="button" accessibilityLabel="Edit photo description" style={styles.descriptionAction} onPress={() => { setDescription(selected?.description ?? ""); editingSession.current = true; setEditing(true); }}>
                <Text style={styles.description}>{selected?.description?.trim() ? selected.description : "No description"}</Text>
              </Pressable>
            </ScrollView>}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Delete photo" onPress={() => { saveDescription(); setConfirmDelete(true); }} style={[styles.closeButton, { top: insets.top + theme.spacing.sm, left: insets.left + theme.spacing.sm }]}>
            <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} tintColor={theme.colors.white} size={26} fallback={<Text style={styles.editText}>🗑</Text>} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Close photo preview" onPressIn={beginOutsideTap} onPress={endOutsideTap} style={[styles.closeButton, { top: insets.top + theme.spacing.sm, right: insets.right + theme.spacing.sm }]}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          {confirmDelete && (
            <View style={[StyleSheet.absoluteFill, styles.confirmOverlay]}>
              <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cancel deletion" onPress={() => setConfirmDelete(false)} />
              <View accessibilityViewIsModal style={styles.confirmCard}>
                <Text accessibilityRole="header" style={sharedStyles.heading2}>Delete photo?</Text>
                <View style={styles.confirmActions}>
                  <Pressable accessibilityRole="button" style={[sharedStyles.secondaryButton, styles.confirmButton]} onPress={() => setConfirmDelete(false)}><Text style={sharedStyles.secondaryButtonText}>Cancel</Text></Pressable>
                  <Pressable accessibilityRole="button" style={[sharedStyles.primaryButton, styles.confirmButton, styles.deleteButton]} onPress={() => { if (selectedRef) editPhoto(task.id, selectedRef, null); closePreview(); }}><Text style={sharedStyles.primaryButtonText}>Delete</Text></Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, width: "100%" },
  tile: { aspectRatio: 1, borderRadius: theme.radius.md, overflow: "hidden", backgroundColor: theme.colors.mist },
  thumbnail: { width: "100%", height: "100%" },
  addTile: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border },
  plus: { color: theme.colors.navy, fontSize: 36, lineHeight: 40 },
  addLabel: { color: theme.colors.navy, fontSize: 14, textAlign: "center" },
  disabled: { opacity: 0.5 },
  overlay: { flex: 1, backgroundColor: "rgba(70, 70, 70, 0.75)", alignItems: "center", justifyContent: "center", padding: theme.spacing.xl },
  editText: { color: theme.colors.white, fontSize: 16, fontWeight: "600" },
  confirmOverlay: { backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  confirmCard: { width: "100%", maxWidth: 360, backgroundColor: theme.colors.white, padding: 24, borderRadius: theme.radius.lg, gap: 16 },
  confirmActions: { flexDirection: "row", gap: 12 },
  confirmButton: { flex: 1 },
  deleteButton: { backgroundColor: theme.colors.errorAccent },
  descriptionAction: { minHeight: 44 },
  descriptionScroll: { maxHeight: 100 },
  description: { color: theme.colors.white, fontSize: 16, lineHeight: 24, paddingTop: 12 },
  descriptionEditor: { gap: 8, paddingTop: 12 },
  descriptionInput: { minHeight: 140, maxHeight: 140, padding: 12, backgroundColor: "#242424", borderWidth: 1, borderColor: "#505050", borderRadius: theme.radius.md, fontSize: 16, color: theme.colors.white, textAlignVertical: "top" },
  preview: { aspectRatio: 480 / 280, justifyContent: "center" },
  fullPhoto: { width: "100%", height: "100%" },
  closeButton: { position: "absolute", top: 0, right: 0, width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  closeText: { color: theme.colors.white, fontSize: 32, lineHeight: 36 },
});
