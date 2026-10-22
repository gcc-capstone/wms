import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EvidencePhoto } from "../constants/tasks";
import { photoUri } from "../constants/evidence-photos";
import { sharedStyles, theme } from "../theme/orbital-theme";

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
  const openPhoto = () => router.push({
    pathname: "/tasks/photo/[id]",
    params: { id: taskId, photoId: photo.id, safety: safety ? "true" : "false" },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{photo.label} (required)</Text>
      {photo.attached && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Review photo: ${photo.label}`} onPress={openPhoto}>
          <Image
            source={{ uri: photoUri(photo.id) }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={`Dummy photo: ${photo.label}`}
          />
        </Pressable>
      )}
      {photo.attached ? (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {photo.upload === "Upload failed"
            ? "Upload failed - original photo still saved on device"
            : `Photo attached · ${photo.upload}`}
        </Text>
      ) : !readOnly ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Take photo: ${photo.label}`}
          style={sharedStyles.secondaryButton}
          onPress={openPhoto}
        >
          <Text style={sharedStyles.secondaryButtonText}>Take Photo</Text>
        </Pressable>
      ) : <Text style={styles.note}>No photo attached.</Text>}
      {showMissing && !photo.attached && (
        <Text style={styles.error}>* Field Required</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: "#B3261E", fontSize: 14 },
  card: { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  label: { ...sharedStyles.label, color: "#4B5966", fontSize: 16, lineHeight: 22, textAlign: "center", marginBottom: theme.spacing.xs },
  image: { width: "100%", height: 220, borderRadius: theme.radius.md },
  note: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  status: { color: theme.colors.navy, fontWeight: "600", fontSize: 14 },
});
