import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { photoUri } from "../../../constants/evidence-photos";
import { galleryPhotoPreview } from "../../../constants/prototype-workflows";
import { taskDisplayStatus } from "../../../constants/task-list";
import { useTasks } from "../../../hooks/use-tasks";
import { theme } from "../../../theme/orbital-theme";

export default function PhotoReviewScreen() {
  const { id, photoId, safety, fromGallery, addPhoto } = useLocalSearchParams<{ id: string; photoId: string; safety?: string; fromGallery?: string; addPhoto?: string }>();
  const isSafety = safety === "true";
  const returnToSource = useSmoothReturn(fromGallery === "true" ? `/tasks/photos/${Number(id)}` : isSafety ? `/tasks/safety/${Number(id)}` : `/tasks/${Number(id)}`);
  const { tasks, keepPhoto } = useTasks();
  const [description, setDescription] = useState("");
  const [confirming, setConfirming] = useState(false);
  const insets = useSafeAreaInsets();
  const task = tasks.find((entry) => entry.id === Number(id));
  const additional = addPhoto === "true";
  const photo = additional && task ? galleryPhotoPreview(task) : isSafety
    ? task?.safety?.photo.id === photoId ? task.safety.photo : undefined
    : task?.photos?.find((entry) => entry.id === photoId);
  const readOnly = !task || taskDisplayStatus(task) !== "Available" ||
    (isSafety && task.safety?.status === "Submitted");

  return (
    <>
      <Stack.Screen options={{ contentStyle: { backgroundColor: "#000000" }, statusBarStyle: "light" }} />
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16), paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel photo" disabled={confirming} style={styles.backButton} onPress={returnToSource}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        </View>

        <View style={styles.photoArea}>
          {photo ? (
            <Image
              source={{ uri: photoUri(photo.id) }}
              style={styles.photo}
              contentFit="contain"
              accessibilityLabel={`Photo preview: ${photo.label}`}
            />
          ) : <Text style={styles.message}>Photo not found.</Text>}
        </View>

        {photo && (
          <View style={styles.controls}>
            <TextInput accessibilityLabel="Photo description" placeholder="Add a description…" placeholderTextColor="#A8ADB4" keyboardAppearance="dark" value={description} onChangeText={setDescription} editable={!readOnly && !confirming} multiline style={styles.descriptionInput} />
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={confirming} style={[styles.button, styles.retakeButton, styles.actionButton]} onPress={() => {}}>
                <Text style={styles.buttonText}>Retake</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={readOnly || confirming} style={[styles.button, styles.useButton, styles.actionButton, (readOnly || confirming) && styles.disabledButton]} onPress={() => {
                if (readOnly || confirming || !task) return;
                setConfirming(true);
                keepPhoto(task.id, photo.id, additional ? false : isSafety, additional, description.trim());
                returnToSource();
              }}>
                <Text style={styles.buttonText}>Use Photo</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },
  header: { minHeight: 64, paddingHorizontal: 16, justifyContent: "center" },
  backButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  backArrow: { color: theme.colors.white, fontSize: 36 },
  photoArea: { flex: 1, minHeight: 0, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  message: { color: theme.colors.white, fontSize: 16 },
  controls: { height: 248, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 12 },
  actions: { flexDirection: "row", gap: 16, marginTop: "auto" },
  actionButton: { flex: 1 },
  descriptionInput: { minHeight: 140, maxHeight: 140, borderRadius: theme.radius.md, backgroundColor: "#242424", color: theme.colors.white, borderWidth: 1, borderColor: "#505050", padding: 12, fontSize: 16, textAlignVertical: "top" },
  button: { minHeight: 56, paddingHorizontal: 12, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  retakeButton: { borderWidth: 1, borderColor: theme.colors.white },
  useButton: { backgroundColor: theme.colors.navy },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: theme.colors.white, fontSize: 18, fontWeight: "600", textAlign: "center" },
});
