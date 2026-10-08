import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { sharedStyles, theme } from "../theme/orbital-theme";

export function TaskDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an answer",
  disabled = false,
}: {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        style={styles.button}
        onPress={() => setOpen((previous) => !previous)}
      >
        <Text style={styles.value}>{value ?? placeholder}</Text>
        <Text style={styles.arrow}>{open ? "▴" : "▾"}</Text>
      </Pressable>
      {open && !disabled && (
        <View style={styles.menu}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: option === value }}
              style={[styles.option, option === value && styles.selected]}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <Text style={styles.value}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.xs },
  button: {
    ...sharedStyles.input,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  value: { color: theme.colors.ink, fontSize: 15, flexShrink: 1 },
  arrow: { color: theme.colors.navy, fontSize: 18 },
  menu: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.white,
  },
  option: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: "center",
  },
  selected: { backgroundColor: theme.colors.mist },
});
