import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { PhotoGallery } from "../../../components/task-photo-gallery";
import { useSafetyForms } from "../../../hooks/use-safety-forms";
import { sharedStyles, theme } from "../../../theme/orbital-theme";

export default function ChecklistPhotosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const back = useSmoothReturn(`/checklists/form/${id}`);
  const { forms, editPhoto } = useSafetyForms();
  const form = forms.find((entry) => entry.id === id);
  const insets = useSafeAreaInsets();
  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + 64 }]}>
        {form && <PhotoGallery photos={form.photos.map((photo, index) => ({ photo, target: { source: "additional", index } }))} canAddPhoto={form.status === "Draft"} readOnly={form.status !== "Draft"} onEditPhoto={(target, description) => editPhoto(id, target.index, description)} onAddPhoto={() => router.push({ pathname: "/checklists/photo/[id]", params: { id } })} />}
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to checklist form" onPress={back} style={[styles.back, { top: insets.top + 8 }]}><Text style={styles.arrow}>←</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 960, alignSelf: "center", padding: 20 },
  back: { position: "absolute", left: 12, width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  arrow: { color: theme.colors.navy, fontSize: 32 },
});
