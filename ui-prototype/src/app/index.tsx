import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { sharedStyles, theme } from "../theme/orbital-theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureEntry, setSecureEntry] = useState(true);

  const handleLogin = () => {
    // Prototype only — no authentication is performed.
    router.replace("/tasks");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBand}>
        <Image
          source={require("../assets/orbital-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>ORBITAL</Text>
        <Text style={styles.brandSubtitle}>Workflow Management System</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={sharedStyles.heading2}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your credentials to view your assigned tasks.
            </Text>

            <View style={styles.field}>
              <Text style={sharedStyles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@orbitalengr.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={sharedStyles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={sharedStyles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={secureEntry}
                  style={[sharedStyles.input, styles.passwordInput]}
                />
                <Pressable
                  style={styles.showHideButton}
                  onPress={() => setSecureEntry((prev) => !prev)}
                >
                  <Text style={styles.showHideText}>
                    {secureEntry ? "Show" : "Hide"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>

            <Pressable style={sharedStyles.primaryButton} onPress={handleLogin}>
              <Text style={sharedStyles.primaryButtonText}>Log In</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Version 3.0.1 · © 2026 Orbital Engineering, Inc
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.navy,
  },

  topBand: {
    alignItems: "center",
    paddingTop: 72,
    paddingBottom: 36,
    paddingHorizontal: theme.spacing.xl,
  },

  logo: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing.md,
  },

  brandTitle: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 3,
  },

  brandSubtitle: {
    color: "#C7D2DC",
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },

  formWrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  formScroll: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },

  card: {
    ...sharedStyles.card,
  },

  cardSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },

  field: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
  },

  showHideButton: {
    position: "absolute",
    right: theme.spacing.md,
  },

  showHideText: {
    color: theme.colors.navy,
    fontSize: 13,
    fontWeight: "700",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
  },

  forgotPasswordText: {
    color: theme.colors.navy,
    fontSize: 13,
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: theme.spacing.xl,
  },
});
