import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EvidencePhoto, PhotoKind } from "../constants/tasks";
import { sharedStyles, theme } from "../theme/orbital-theme";

const scenes: Record<PhotoKind, string> = {
  sticker: `<rect x="90" y="30" width="300" height="205" rx="12" fill="#f6f1d1"/><text x="240" y="70">INSPECTION RECORD</text><text x="240" y="110">CONTROL CABINET 3</text><text x="240" y="150">15A FUSE REPLACED</text><text x="240" y="190">APRIL 20 - INSPECTED</text>`,
  hazard: `<rect x="265" y="20" width="165" height="170" fill="#71818d"/><rect x="280" y="45" width="135" height="40" fill="#fff"/><text x="347" y="72">PUMP 2 PANEL</text><ellipse cx="145" cy="220" rx="115" ry="35" fill="#7eb7cf"/><text x="145" y="225">STANDING WATER</text><path d="M175 165 L265 165" stroke="#fff" stroke-width="3"/><text x="220" y="150">3 FEET</text>`,
  sensor: `<path d="M0 200 H480" stroke="#71818d" stroke-width="35"/><rect x="220" y="115" width="40" height="90" fill="#99a6af"/><circle cx="240" cy="80" r="65" fill="#f7f5f1" stroke="#71818d" stroke-width="12"/><text x="240" y="78">62 PSI</text><text x="240" y="103">PUMP 4</text><rect x="300" y="170" width="160" height="60" fill="#fff"/><text x="380" y="197">PRESSURE SENSOR</text><text x="380" y="218">ID: P4-PS-001</text>`,
  plate: `<rect x="65" y="45" width="350" height="180" rx="8" fill="#cdd5da" stroke="#fff" stroke-width="4"/><text x="240" y="90">CEDAR GROVE SUBSTATION</text><text x="240" y="130">DISCONNECT SWITCH</text><text x="240" y="168">BAY 4 - ID: DS-004</text><text x="240" y="201">EQUIPMENT IDENTIFICATION</text>`,
  repair: `<rect x="60" y="50" width="360" height="150" fill="#99a6af"/><path d="M100 125 H185 L290 80 M290 125 H380" stroke="#d1b16a" stroke-width="15"/><circle cx="185" cy="125" r="12" fill="#fff"/><circle cx="290" cy="125" r="12" fill="#fff"/><rect x="110" y="215" width="260" height="35" fill="#f7f5f1"/><text x="240" y="239">BAY 4 - COMPLETED REPAIR</text>`,
};

function photoUri(kind: PhotoKind): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><rect width="480" height="280" fill="#284765"/><g font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1f2933">${scenes[kind]}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function EvidencePhotoCard({
  photo,
  readOnly = false,
  onKeep,
}: {
  photo: EvidencePhoto;
  readOnly?: boolean;
  onKeep: () => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={sharedStyles.label}>{photo.label} (required)</Text>
      {(preview || photo.attached) && (
        <>
          <Image
            source={{ uri: photoUri(photo.id) }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={`Dummy photo: ${photo.label}`}
          />
          <Text style={styles.note}>Simulated photo - no device camera is used.</Text>
          <Text style={sharedStyles.body}>Date: {photo.date} · Time: {photo.time}</Text>
          <Text style={sharedStyles.body}>Location: {photo.location}</Text>
        </>
      )}
      {photo.attached ? (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {photo.upload === "Upload failed"
            ? "Upload failed - original photo still saved on device"
            : `Photo attached · ${photo.upload}`}
        </Text>
      ) : preview ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" style={sharedStyles.primaryButton} onPress={onKeep}>
            <Text style={sharedStyles.primaryButtonText}>Use photo</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={sharedStyles.secondaryButton} onPress={() => setPreview(false)}>
            <Text style={sharedStyles.secondaryButtonText}>Retake</Text>
          </Pressable>
        </View>
      ) : !readOnly ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Take photo: ${photo.label}`}
          style={sharedStyles.secondaryButton}
          onPress={() => setPreview(true)}
        >
          <Text style={sharedStyles.secondaryButtonText}>Take photo</Text>
        </Pressable>
      ) : <Text style={styles.note}>No photo attached.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  image: { width: "100%", height: 220, borderRadius: theme.radius.md },
  note: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  status: { color: theme.colors.navy, fontWeight: "600", fontSize: 14 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
});
