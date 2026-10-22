import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { EvidencePhotoCard } from "../../../components/evidence-photo";
import { useSmoothReturn } from "../../../components/android-back-transition";
import { TaskDropdown } from "../../../components/task-dropdown";
import { useTasks } from "../../../hooks/use-tasks";
import { sharedStyles, theme } from "../../../theme/orbital-theme";

export default function SafetyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const returnToTask = useSmoothReturn(`/tasks/${Number(id)}`);
  const { tasks, updateSafety, saveSafety, submitSafety } = useTasks();
  const task = tasks.find((entry) => entry.id === Number(id));
  const [error, setError] = useState("");
  const safety = task?.safety;
  if (!task || !safety) {
    return (
      <View style={sharedStyles.content}>
        <Text style={sharedStyles.heading2}>Safety Checklist not found</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/tasks")}>
          <Text style={sharedStyles.body}>Return to Tasks</Text>
        </Pressable>
      </View>
    );
  }
  const readOnly = safety.status === "Submitted";

  return (
    <View style={sharedStyles.screen}>
      <View style={sharedStyles.header}>
        <Pressable accessibilityRole="button" onPress={returnToTask}>
          <Text style={styles.back}>‹ Related task</Text>
        </Pressable>
        <Text style={styles.back}>{safety.status}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={sharedStyles.heading1}>Safety Checklist</Text>
        <View style={[sharedStyles.card, styles.fields]}>
          <Text style={sharedStyles.body}>Date: {task.dueDate}</Text>
          <Text style={sharedStyles.body}>Related task: {task.title}</Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={sharedStyles.body}>
          {readOnly
            ? "Safety Checklist accepted. Submitted and associated with this task."
            : safety.saved ? "Draft saved. Your entries and photograph are kept while the prototype is open." : "Draft - not yet saved. Save as draft before returning to other work."}
        </Text>
        <View style={[sharedStyles.card, styles.fields]}>
          <Text style={sharedStyles.label}>Job-site condition (required)</Text>
          <TaskDropdown
            label="Job-site condition"
            value={safety.condition}
            options={["Standing water near electrical equipment", "Work area clear", "Restricted access"]}
            onChange={(condition) => updateSafety(task.id, { condition })}
            disabled={readOnly}
          />
          {!!error && !safety.condition && <Text style={styles.error}>* Field Required</Text>}
          <Text style={sharedStyles.label}>Required PPE (select all that apply)</Text>
          {["Safety glasses", "Insulated gloves", "Hard hat", "Safety boots"].map((ppe) => (
            <Pressable
              key={ppe}
              accessibilityRole="checkbox"
              accessibilityLabel={ppe}
              accessibilityState={{ checked: safety.ppe.includes(ppe), disabled: readOnly }}
              disabled={readOnly}
              style={styles.check}
              onPress={() => updateSafety(task.id, {
                ppe: safety.ppe.includes(ppe) ? safety.ppe.filter((item) => item !== ppe) : [...safety.ppe, ppe],
              })}
            >
              <Text style={sharedStyles.body}>{safety.ppe.includes(ppe) ? "☑" : "☐"} {ppe}</Text>
            </Pressable>
          ))}
          {!!error && safety.ppe.length === 0 && <Text style={styles.error}>* Field Required</Text>}
          {([
            ["hazard", "Hazard description"],
            ["controlPlan", "Control plan"],
            ["crewMember", "Crew member"],
            ["resolution", "Hazard addressed"],
          ] as const).map(([key, label]) => (
            <View key={key} style={styles.fields}>
              <Text style={sharedStyles.label}>{label} (required)</Text>
              <TextInput
                accessibilityLabel={label}
                value={safety[key]}
                onChangeText={(value) => updateSafety(task.id, { [key]: value })}
                editable={!readOnly}
                multiline={key !== "crewMember"}
                style={[sharedStyles.input, key !== "crewMember" && styles.notes]}
              />
              {!!error && !safety[key].trim() && <Text style={styles.error}>* Field Required</Text>}
            </View>
          ))}
          <EvidencePhotoCard
            photo={safety.photo}
            taskId={task.id}
            safety
            showMissing={!!error}
            readOnly={readOnly}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Safety requirements reviewed with crew"
            accessibilityState={{ checked: safety.reviewedWithCrew, disabled: readOnly }}
            disabled={readOnly}
            style={styles.check}
            onPress={() => updateSafety(task.id, { reviewedWithCrew: !safety.reviewedWithCrew })}
          >
            <Text style={sharedStyles.body}>{safety.reviewedWithCrew ? "☑" : "☐"} Safety requirements reviewed with crew</Text>
          </Pressable>
          {!!error && !safety.reviewedWithCrew && <Text style={styles.error}>* Field Required</Text>}
        </View>
        {!readOnly && (
          <>
            <Pressable accessibilityRole="button" style={sharedStyles.secondaryButton} onPress={() => {
              saveSafety(task.id);
              returnToTask();
            }}>
              <Text style={sharedStyles.secondaryButtonText}>Save as draft</Text>
            </Pressable>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <Pressable accessibilityRole="button" style={[sharedStyles.primaryButton, sharedStyles.submitButton]} onPress={() => {
              const result = submitSafety(task.id);
              setError(result.success ? "" : result.error);
              if (result.success) returnToTask();
            }}>
              <Text style={[sharedStyles.primaryButtonText, sharedStyles.submitButtonText]}>Submit Safety Checklist</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 960, alignSelf: "center", padding: theme.spacing.xl, gap: theme.spacing.lg, paddingBottom: 28 },
  fields: { gap: theme.spacing.sm },
  back: { color: theme.colors.white, fontSize: 16, fontWeight: "600" },
  notes: { minHeight: 90, paddingVertical: theme.spacing.sm, textAlignVertical: "top" },
  error: { color: "#B3261E", fontSize: 15, lineHeight: 22 },
  check: { minHeight: 44, justifyContent: "center" },
});
