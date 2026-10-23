import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EvidencePhoto } from "../constants/tasks";
import { theme } from "../theme/orbital-theme";

export function EvidencePhotoCard({
  photo,
  taskId,
  safety = false,
  readOnly = false,
  showMissing = false,
}: {
  photo: EvidencePhoto;
  taskId: number;
  safety?: boolean;
  readOnly?: boolean;
  showMissing?: boolean;
}) {
  const disabled = readOnly && !photo.attached;
  const openPhoto = () => router.push({
    pathname: "/tasks/photo/[id]",
    params: { id: taskId, photoId: photo.id, safety: safety ? "true" : "false" },
  });

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${photo.attached ? "Review" : "Take"} photo: ${photo.label}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={[styles.action, disabled && styles.disabled]}
        onPress={openPhoto}
      >
        <Text style={styles.label}>{photo.label} (required)</Text>
        <View style={styles.camera}>
          <SymbolView
            name={{ ios: "camera", android: "photo_camera", web: "photo_camera" }}
            tintColor={theme.colors.navy}
            size={26}
            fallback={<Text style={styles.fallback}>📷</Text>}
          />
        </View>
      </Pressable>
      {photo.attached && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Review attached photo: ${photo.label}`} hitSlop={8} onPress={openPhoto}>
          <Text accessibilityLiveRegion="polite" style={[styles.status, photo.upload === "Upload failed" && styles.error]}>
            {photo.upload === "Upload failed" ? "Photo upload failed" : "Photo attached"}
          </Text>
        </Pressable>
      )}
      {showMissing && !photo.attached && (
        <Text style={styles.error}>* Field Required</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  action: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, minHeight: 44 },
  label: { flex: 1, minWidth: 0, color: theme.colors.ink, fontSize: 16, lineHeight: 24 },
  camera: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  fallback: { fontSize: 26 },
  disabled: { opacity: 0.5 },
  status: { color: theme.colors.navy, fontWeight: "600", fontSize: 14 },
  error: { color: theme.colors.errorAccent, fontSize: 14 },
});
