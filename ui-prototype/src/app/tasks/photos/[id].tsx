import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useSmoothReturn } from "../../../components/android-back-transition";
import { TaskPhotoGallery } from "../../../components/task-photo-gallery";
import { useTasks } from "../../../hooks/use-tasks";
import { sharedStyles, theme } from "../../../theme/orbital-theme";

export default function TaskPhotosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const returnToTask = useSmoothReturn(`/tasks/${Number(id)}`);
  const { tasks } = useTasks();
  const task = tasks.find((entry) => entry.id === Number(id));

  return (
    <View style={sharedStyles.screen}>
      <View style={sharedStyles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to task" onPress={returnToTask} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={sharedStyles.headerText}>Photos</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {task ? (
          <TaskPhotoGallery task={task} />
        ) : <Text style={sharedStyles.body}>Task not found.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 48, minWidth: 48, justifyContent: "center" },
  backText: { color: theme.colors.white, fontSize: 18, fontWeight: "600" },
  content: { width: "100%", maxWidth: 960, alignSelf: "center", padding: theme.spacing.xl, gap: theme.spacing.lg },
});
