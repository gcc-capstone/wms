import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { photoUri } from "../../../constants/evidence-photos";
import { isTaskBlocked } from "../../../constants/task-list";
import { useTasks } from "../../../hooks/use-tasks";
import { theme } from "../../../theme/orbital-theme";

export default function PhotoReviewScreen() {
  const { id, photoId, safety } = useLocalSearchParams<{ id: string; photoId: string; safety?: string }>();
  const isSafety = safety === "true";
  const returnToSource = useSmoothReturn(isSafety ? `/tasks/safety/${Number(id)}` : `/tasks/${Number(id)}`);
  const { tasks, keepPhoto } = useTasks();
  const [confirming, setConfirming] = useState(false);
  const insets = useSafeAreaInsets();
  const task = tasks.find((entry) => entry.id === Number(id));
  const photo = isSafety
    ? task?.safety?.photo.id === photoId ? task.safety.photo : undefined
    : task?.photos?.find((entry) => entry.id === photoId);
  const readOnly = !task || isTaskBlocked(task) || (isSafety
    ? task.safety?.status === "Submitted"
    : task.status === "Completed" || task.status === "Pending" || task.status === "Error");

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
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={confirming} style={[styles.button, styles.retakeButton]} onPress={() => {}}>
              <Text style={styles.buttonText}>Retake</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: readOnly || confirming }}
              disabled={readOnly || confirming}
              style={[styles.button, styles.useButton, (readOnly || confirming) && styles.disabledButton]}
              onPress={() => {
                if (readOnly || confirming || !task) return;
                setConfirming(true);
                keepPhoto(task.id, photo.id, isSafety);
                returnToSource();
              }}
            >
              <Text style={styles.buttonText}>Use Photo</Text>
            </Pressable>
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
  actions: { flexDirection: "row", gap: 16, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  button: { flex: 1, minHeight: 56, paddingHorizontal: 12, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  retakeButton: { borderWidth: 1, borderColor: theme.colors.white },
  useButton: { backgroundColor: theme.colors.navy },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: theme.colors.white, fontSize: 18, fontWeight: "600", textAlign: "center" },
});
