import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { sharedStyles, theme } from "../../theme/orbital-theme";

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/tasks")}
        >
          <Text style={styles.backButtonText}>‹ Tasks</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.page}>
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.heading2}>Account</Text>
          <Text style={styles.helperText}>
            This is a UI prototype — no account settings are available yet.
          </Text>

          <Pressable
            style={styles.logoutButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    minHeight: 58,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navy,
  },

  backButton: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },

  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  headerTitle: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 70,
  },

  page: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },

  helperText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  logoutButton: {
    minHeight: 46,
    borderRadius: theme.radius.md,
    backgroundColor: "#B3261E",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonText: {
    color: theme.colors.white,
    ...theme.typography.button,
  },
});
