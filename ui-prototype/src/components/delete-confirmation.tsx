import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { sharedStyles, theme } from "../theme/orbital-theme";

export function DeleteConfirmation({ visible, title, onCancel, onDelete }: { visible: boolean; title: string; onCancel: () => void; onDelete: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel deletion" style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text accessibilityRole="header" style={sharedStyles.heading2}>{title}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={[sharedStyles.secondaryButton, styles.button]} onPress={onCancel}><Text style={sharedStyles.secondaryButtonText}>Cancel</Text></Pressable>
            <Pressable accessibilityRole="button" style={[sharedStyles.primaryButton, styles.button, styles.delete]} onPress={onDelete}><Text style={sharedStyles.primaryButtonText}>Delete</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 360, backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, padding: 24, gap: 20 },
  actions: { flexDirection: "row", gap: 12 },
  button: { flex: 1 },
  delete: { backgroundColor: theme.colors.errorAccent },
});
