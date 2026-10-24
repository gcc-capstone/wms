import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { DeleteConfirmation } from "../../../components/delete-confirmation";
import { TaskDropdown } from "../../../components/task-dropdown";
import { missingFormFields, SafetyFormFields } from "../../../constants/safety-forms";
import { useSafetyForms } from "../../../hooks/use-safety-forms";
import { sharedStyles, theme } from "../../../theme/orbital-theme";

export default function SafetyFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { forms, updateForm, closeForm, saveDraft, deleteForm, submitForm } = useSafetyForms();
  const skipSave = useRef(false);
  const onClose = useCallback(() => { if (!skipSave.current) closeForm(id); }, [closeForm, id]);
  const close = useSmoothReturn("/checklists", onClose);
  const insets = useSafeAreaInsets();
  const [showErrors, setShowErrors] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialForm] = useState(() => forms.find((entry) => entry.id === id));
  const form = forms.find((entry) => entry.id === id) ?? initialForm;
  if (!form) return <View style={sharedStyles.content}><Pressable accessibilityRole="button" onPress={close}><Text style={sharedStyles.body}>Return to Safety Checklists</Text></Pressable></View>;
  const readOnly = form.status !== "Draft";
  const missing = showErrors ? missingFormFields(form) : [];
  const updateFields = (changes: Partial<SafetyFormFields>) => updateForm(id, { fields: { ...form.fields, ...changes } });
  const errorFor = (field: string) => missing.includes(field) ? <Text style={styles.error}>* Field Required</Text> : null;

  return (
    <View style={sharedStyles.screen}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 28 }]}>
        {!readOnly && <Pressable accessibilityRole="button" accessibilityLabel="Delete safety checklist" onPress={() => setDeleting(true)} style={[styles.cornerButton, { top: insets.top + 8, left: insets.left + 12 }]}><SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} tintColor={theme.colors.navy} size={26} fallback={<Text style={styles.iconFallback}>🗑</Text>} /></Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel="Close safety checklist" onPress={close} style={[styles.cornerButton, { top: insets.top + 8, right: insets.right + 12 }]}><Text style={styles.closeText}>×</Text></Pressable>
        <View style={styles.titleRow}>
          <Text accessibilityRole="header" style={styles.title}>{form.type} Safety Checklist</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="View checklist photos" style={styles.iconButton} onPress={() => router.push({ pathname: "/checklists/photos/[id]", params: { id } })}>
            <SymbolView name={{ ios: "camera", android: "photo_camera", web: "photo_camera" }} tintColor={theme.colors.navy} size={28} fallback={<Text style={styles.iconFallback}>📷</Text>} />
          </Pressable>
        </View>
        <View style={[sharedStyles.card, styles.fields]}>
          <Text style={sharedStyles.label}>Title (required)</Text>
          <TextInput accessibilityLabel="Checklist title" value={form.title} onChangeText={(title) => updateForm(id, { title })} editable={!readOnly} style={sharedStyles.input} />
          {errorFor("title")}
          <Text style={sharedStyles.label}>Description</Text>
          <TextInput accessibilityLabel="Checklist description" value={form.description} onChangeText={(description) => updateForm(id, { description })} editable={!readOnly} multiline style={[sharedStyles.input, styles.notes]} />
          <Text style={sharedStyles.label}>Job-site condition (required)</Text>
          <TaskDropdown label="Job-site condition" value={form.fields.condition} options={["Standing water near electrical equipment", "Work area clear", "Restricted access"]} onChange={(condition) => updateFields({ condition })} disabled={readOnly} />
          {errorFor("condition")}
          <Text style={sharedStyles.label}>Required PPE (select all that apply)</Text>
          {["Safety glasses", "Insulated gloves", "Hard hat", "Safety boots"].map((ppe) => (
            <Pressable key={ppe} accessibilityRole="checkbox" accessibilityLabel={ppe} accessibilityState={{ checked: form.fields.ppe.includes(ppe), disabled: readOnly }} disabled={readOnly} style={styles.check} onPress={() => updateFields({ ppe: form.fields.ppe.includes(ppe) ? form.fields.ppe.filter((entry) => entry !== ppe) : [...form.fields.ppe, ppe] })}>
              <Text style={sharedStyles.body}>{form.fields.ppe.includes(ppe) ? "☑" : "☐"} {ppe}</Text>
            </Pressable>
          ))}
          {errorFor("ppe")}
          {([["hazard", "Hazard description"], ["controlPlan", "Control plan"], ["crewMember", "Crew member"], ["resolution", "Hazard addressed"]] as const).map(([key, label]) => (
            <View key={key} style={styles.fields}>
              <Text style={sharedStyles.label}>{label} (required)</Text>
              <TextInput accessibilityLabel={label} value={form.fields[key]} onChangeText={(value) => updateFields({ [key]: value })} editable={!readOnly} multiline={key !== "crewMember"} style={[sharedStyles.input, key !== "crewMember" && styles.notes]} />
              {errorFor(key)}
            </View>
          ))}
          <Pressable accessibilityRole="checkbox" accessibilityLabel="Safety requirements reviewed with crew" accessibilityState={{ checked: form.fields.reviewedWithCrew, disabled: readOnly }} disabled={readOnly} style={styles.check} onPress={() => updateFields({ reviewedWithCrew: !form.fields.reviewedWithCrew })}>
            <Text style={sharedStyles.body}>{form.fields.reviewedWithCrew ? "☑" : "☐"} Safety requirements reviewed with crew</Text>
          </Pressable>
          {errorFor("reviewedWithCrew")}
        </View>
        {!readOnly && <>
          <Pressable accessibilityRole="button" style={sharedStyles.secondaryButton} onPress={() => { saveDraft(id); skipSave.current = true; close(); }}><Text style={sharedStyles.secondaryButtonText}>Save as draft</Text></Pressable>
          {!!missing.length && <Text accessibilityRole="alert" style={styles.error}>Required Fields Missing</Text>}
          <Pressable accessibilityRole="button" style={[sharedStyles.primaryButton, sharedStyles.submitButton]} onPress={() => { setShowErrors(true); if (submitForm(id)) { skipSave.current = true; close(); } }}><Text style={[sharedStyles.primaryButtonText, sharedStyles.submitButtonText]}>Submit Safety Checklist</Text></Pressable>
        </>}
      </ScrollView>

      <DeleteConfirmation visible={deleting} title="Delete checklist?" onCancel={() => setDeleting(false)} onDelete={() => { setDeleting(false); skipSave.current = true; deleteForm(id); close(); }} />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 960, alignSelf: "center", paddingHorizontal: 20, gap: 16 },
  fields: { gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { flex: 1, color: theme.colors.navy, fontSize: 24, lineHeight: 32, fontWeight: "400" },
  iconButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  cornerButton: { position: "absolute", width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  closeText: { color: theme.colors.navy, fontSize: 32, lineHeight: 36 },
  iconFallback: { color: theme.colors.navy, fontSize: 26 },
  check: { minHeight: 44, justifyContent: "center" },
  notes: { minHeight: 90, paddingVertical: 8, textAlignVertical: "top" },
  error: { color: theme.colors.errorAccent, fontSize: 14 },
});
