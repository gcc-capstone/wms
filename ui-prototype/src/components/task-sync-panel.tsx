import { Pressable, StyleSheet, Text, View } from "react-native";

import { Task } from "../constants/tasks";
import { useTasks } from "../hooks/use-tasks";
import { sharedStyles, theme } from "../theme/orbital-theme";

export function TaskSyncPanel({ task }: { task: Task }) {
  const { beginSync, endSync } = useTasks();
  if (task.scenario !== "offline" && task.scenario !== "uploadFailure") return null;
  const completed = task.status === "Completed";
  const syncing = task.syncStatus === "Synchronizing";
  const failed = task.syncStatus === "Upload failed";
  const synced = completed && task.syncStatus === "Up to date";
  const time = task.scenario === "offline" ? "3:35 PM" : "4:10 PM";

  return (
    <View style={[sharedStyles.card, styles.panel]}>
      <Text style={sharedStyles.heading2}>
        {synced ? "Synchronized with WMS" : syncing ? "Synchronizing" : failed ? "Photo upload failed" : completed ? "Completed on device / waiting to sync" : task.connection}
      </Text>
      <Text accessibilityLiveRegion="polite" style={sharedStyles.body}>
        {synced
          ? "WMS has received the completed checklist, notes, and all required photographs. Nothing is waiting to synchronize."
          : failed
            ? "The completed-repair photograph did not upload. Your checklist and inspection note have been received, and the identification-plate photograph uploaded successfully. The original repair photograph is still saved on this device."
            : syncing
              ? `Connection restored at ${time}. ${task.syncAttempt === "retry" ? "Retrying only the completed-repair photograph; previously received information is unchanged." : "Sending checklist information and photographs to WMS."}`
              : completed
                ? "Your checklist, notes, and photographs are saved on this device. They have not yet been sent to WMS."
                : task.scenario === "offline"
                  ? "This task is available offline. You can complete the inspection without network access; your answers and photo will be kept on this device."
                  : "Connectivity is unreliable. Completed work and both photographs will remain on this device until synchronization succeeds."}
      </Text>
      {completed && (
        <>
          <Text style={styles.note}>Prototype simulation only - no network requests or real synchronization.</Text>
          {task.syncStatus === "Unsynced" && (
            <Action label={`Simulate connection returning at ${time}`} onPress={() => beginSync(task.id)} />
          )}
          {syncing && <Action label="Finish simulated synchronization" onPress={() => endSync(task.id)} />}
          {failed && <Action label="Retry failed photograph" onPress={() => beginSync(task.id, true)} />}
          {(failed || (syncing && task.syncAttempt === "retry")) && (
            <Text style={styles.note}>Checklist and inspection note: Received by WMS</Text>
          )}
          {(task.photos ?? []).map((photo) => (
            <Text key={photo.id} style={styles.note}>{photo.label}: {photo.upload}</Text>
          ))}
        </>
      )}
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={sharedStyles.secondaryButton} onPress={onPress}>
      <Text style={sharedStyles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { gap: theme.spacing.md },
  note: { fontSize: 13, lineHeight: 19, color: theme.colors.textMuted },
});
