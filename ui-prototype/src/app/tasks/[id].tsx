import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Attachment,
  ChecklistItem,
  ChecklistResponse,
  isChecklistItemAnswered,
  Task,
} from "../../constants/tasks";
import { TaskDropdown } from "../../components/task-dropdown";
import { EvidencePhotoCard } from "../../components/evidence-photo";
import { TaskSyncPanel } from "../../components/task-sync-panel";
import { missingTaskRequirements } from "../../constants/prototype-workflows";
import { isTaskBlocked } from "../../constants/task-list";
import { useTasks } from "../../hooks/use-tasks";
import { sharedStyles, theme } from "../../theme/orbital-theme";

// Horizontal swipe distance (in px) required to dismiss back to the task list.
const SWIPE_DISMISS_THRESHOLD = 70;

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks } = useTasks();
  const task = tasks.find((entry) => entry.id === Number(id));
  return <TaskDetail key={id} task={task} />;
}

function TaskDetail({ task }: { task: Task | undefined }) {
  const { submitTask, updateChecklist, createSafety } = useTasks();
  const [submitError, setSubmitError] = useState("");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 16 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) > SWIPE_DISMISS_THRESHOLD) {
            router.replace("/tasks");
          }
        },
      }),
    []
  );

  if (!task) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={sharedStyles.heading2}>Task not found</Text>
        </View>
      </View>
    );
  }

  const setResponse = (itemId: string, response: ChecklistResponse) => {
    if (task.status === "Completed" || isTaskBlocked(task)) return;
    updateChecklist(task.id,
      task.checklist.map((item) =>
        item.id === itemId
          ? {
              ...item,
              response:
                item.kind === "yesNo" && item.response === response
                  ? null
                  : response,
            }
          : item
      )
    );
  };

  const checklist = task.checklist;
  const answeredCount = checklist.filter(isChecklistItemAnswered).length;
  const completed = task.status === "Completed";
  const blocked = isTaskBlocked(task);
  const readOnly = completed || blocked;
  const missing = missingTaskRequirements(task);
  const canSubmit = !readOnly && missing.length === 0;
  const submitDisabled = !canSubmit && task.scenario !== "validation";

  const setCustomText = (itemId: string, text: string) => {
    if (readOnly) return;
    updateChecklist(task.id,
      task.checklist.map((item) =>
        item.id === itemId ? { ...item, customText: text } : item
      )
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/tasks")}
        >
          <Text style={styles.backButtonText}>‹ Tasks</Text>
        </Pressable>
      </View>

      <View style={styles.body} {...panResponder.panHandlers}>
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.titleBlock}>
            <Text style={styles.taskCode}>
              {task.taskCode} · {task.disciplineNo}
            </Text>
            <Text style={sharedStyles.heading1}>{task.title}</Text>
            <Text style={styles.dueDate}>Due {task.dueDate}</Text>
          </View>

          <TaskInformation task={task} />

          {blocked && (
            <View style={styles.submissionNotice}>
              <Text style={sharedStyles.heading2}>Waiting for prerequisite</Text>
              <Text style={sharedStyles.body}>
                A previous task must be completed before you can work on this task.
                You can review its information, checklist, and attachments below.
              </Text>
            </View>
          )}

          <TaskSyncPanel task={task} />

          {completed && (
            <View style={styles.submissionNotice} accessibilityLiveRegion="polite">
              <Text style={sharedStyles.heading2}>
                {task.syncStatus === "Up to date" ? "Task submitted" : "Task completed on device"}
              </Text>
              <Text style={sharedStyles.body}>
                Completed by {task.completedBy} on {task.completedDate}. Your
                answers are available below.
              </Text>
              <Text style={styles.submissionNote}>
                Prototype only: records are kept while the app is open, not sent to a server.
              </Text>
            </View>
          )}

          {task.scenario === "safety" && !blocked && (
            <SectionCard title="Safety Checklist">
              <Text style={sharedStyles.body}>
                {task.safety
                  ? `${task.safety.status}${task.safety.saved && task.safety.status === "Draft" ? " saved" : ""} · Related task: ${task.title}`
                  : "Create a Safety Checklist associated with this job."}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={sharedStyles.secondaryButton}
                onPress={() => {
                  createSafety(task.id);
                  router.push(`/tasks/safety/${task.id}`);
                }}
              >
                <Text style={sharedStyles.secondaryButtonText}>
                  {task.safety ? task.safety.status === "Draft" ? "Open draft Safety Checklist" : "View submitted Safety Checklist" : "Create Safety Checklist"}
                </Text>
              </Pressable>
            </SectionCard>
          )}

          <TaskChecklist
            checklist={checklist}
            answeredCount={answeredCount}
            onSetResponse={setResponse}
            onChangeCustomText={setCustomText}
            readOnly={readOnly}
            showMissing={!!submitError}
          />
          <TaskPhotos task={task} />
          {task.attachments.length > 0 && (
            <TaskAttachments attachments={task.attachments} readOnly={readOnly} />
          )}

          {!readOnly && (
            <View style={styles.submitArea}>
              <Text style={styles.submissionNote}>
                {canSubmit
                  ? "All items complete. Ready to submit."
                  : `Complete all checklist items and required photographs to submit (${answeredCount}/${checklist.length} checklist items).`}
              </Text>
              {!!submitError && (
                <Text accessibilityRole="alert" style={styles.submitError}>
                  {submitError}
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: submitDisabled }}
                disabled={submitDisabled}
                style={[
                  sharedStyles.primaryButton,
                  submitDisabled && styles.submitDisabled,
                ]}
                onPress={() => {
                  const result = submitTask(task.id);
                  setSubmitError(result.success ? "" : result.error);
                }}
              >
                <Text
                  style={[
                    sharedStyles.primaryButtonText,
                    submitDisabled && styles.submitDisabledText,
                  ]}
                >
                  Submit
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function TaskInformation({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[sharedStyles.card, styles.sectionCard]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Task information"
        accessibilityState={{ expanded }}
        style={styles.sectionHeader}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Text style={sharedStyles.heading2}>Task Information</Text>
        <Text style={styles.informationToggle}>{expanded ? "▴" : "▾"}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.infoGrid}>
          <InfoField label="Project No." value={task.projectNo} />
          <InfoField label="Discipline Name" value={task.disciplineName} />
          <InfoField label="Workflow Type" value={task.workflowType} />
          <InfoField label="Due Date" value={task.dueDate} />
          <InfoField
            label="Time Estimate"
            value={`${task.timeEstimateHours.toFixed(2)} hrs`}
          />
          {task.completedBy && (
            <InfoField label="Completed By" value={task.completedBy} />
          )}
          {task.completedDate && (
            <InfoField label="Completed Date" value={task.completedDate} />
          )}
          <InfoField
            label="Sync Status"
            value={task.syncStatus}
            tone={task.syncStatus === "Unsynced" ? "gold" : "neutral"}
          />
        </View>
      )}
    </View>
  );
}

function TaskChecklist({
  checklist,
  answeredCount,
  onSetResponse,
  onChangeCustomText,
  readOnly,
  showMissing,
}: {
  checklist: ChecklistItem[];
  answeredCount: number;
  onSetResponse: (itemId: string, response: ChecklistResponse) => void;
  onChangeCustomText: (itemId: string, text: string) => void;
  readOnly: boolean;
  showMissing: boolean;
}) {
  return (
    <SectionCard
      title="Checklist"
      trailing={
        <Text style={styles.checklistCount}>
          {answeredCount}/{checklist.length}
        </Text>
      }
    >
      <View style={styles.checklist}>
        {checklist.map((item, index) => (
          <ChecklistRow
            key={item.id}
            item={item}
            isLast={index === checklist.length - 1}
            onSetResponse={onSetResponse}
            onChangeCustomText={onChangeCustomText}
            readOnly={readOnly}
            showMissing={showMissing}
          />
        ))}

        {checklist.length === 0 && (
          <Text style={styles.emptySectionText}>
            No checklist items for this task.
          </Text>
        )}
      </View>
    </SectionCard>
  );
}

function ChecklistRow({
  item,
  isLast,
  onSetResponse,
  onChangeCustomText,
  readOnly,
  showMissing,
}: {
  item: ChecklistItem;
  isLast: boolean;
  onSetResponse: (itemId: string, response: ChecklistResponse) => void;
  onChangeCustomText: (itemId: string, text: string) => void;
  readOnly: boolean;
  showMissing: boolean;
}) {
  return (
    <View style={[styles.checklistRow, isLast && styles.checklistRowLast]}>
      <View style={styles.checklistAnswerRow}>
        <View style={styles.checklistLabelArea}>
          <Text style={styles.checklistLabel}>{item.label}</Text>
        </View>

        {item.kind === "yesNo" && (
          <View style={styles.controlRow}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: Yes`}
                accessibilityState={{ selected: item.response === "Yes", disabled: readOnly }}
                disabled={readOnly}
                style={[
                  styles.toggleButton,
                  item.response === "Yes" && styles.toggleButtonActive,
                ]}
                onPress={() => onSetResponse(item.id, "Yes")}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    item.response === "Yes" && styles.toggleButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
            </Pressable>

            {item.allowNA !== false && <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: N/A`}
                accessibilityState={{ selected: item.response === "N/A", disabled: readOnly }}
                disabled={readOnly}
                style={[
                  styles.toggleButton,
                  item.response === "N/A" && styles.toggleButtonActive,
                ]}
                onPress={() => onSetResponse(item.id, "N/A")}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    item.response === "N/A" && styles.toggleButtonTextActive,
                  ]}
                >
                  N/A
                </Text>
            </Pressable>}
          </View>
        )}
      </View>

      {item.kind === "dropdown" && (
        <TaskDropdown
          label={item.label}
          value={item.response}
          options={item.options}
          onChange={(value) => onSetResponse(item.id, value)}
          disabled={readOnly}
        />
      )}
      {item.kind === "text" && (
        <TextInput
          accessibilityLabel={item.label}
          editable={!readOnly}
          value={item.customText}
          onChangeText={(text) => onChangeCustomText(item.id, text)}
          placeholder="Add a custom answer…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.checklistCustomInput}
          multiline
        />
      )}
      {showMissing && !isChecklistItemAnswered(item) && (
        <Text style={styles.submitError}>Required: {item.label}</Text>
      )}
    </View>
  );
}

function TaskPhotos({ task }: { task: Task }) {
  const { keepPhoto } = useTasks();
  if (!task.photos?.length) return null;
  return (
    <SectionCard title="Required photographs">
      {task.photos.map((photo) => (
        <EvidencePhotoCard
          key={photo.id}
          photo={photo}
          readOnly={task.status === "Completed" || isTaskBlocked(task)}
          onKeep={() => keepPhoto(task.id, photo.id)}
        />
      ))}
    </SectionCard>
  );
}

function TaskAttachments({
  attachments,
  readOnly,
}: {
  attachments: Attachment[];
  readOnly: boolean;
}) {
  return (
    <SectionCard title="Attachments">
      {!readOnly && <Pressable
        style={styles.uploadButton}
        onPress={() =>
          Alert.alert(
            "Upload File",
            "This is a UI prototype — file upload is not functional."
          )
        }
      >
        <Text style={styles.uploadButtonText}>+ Click to upload a file</Text>
      </Pressable>}

      <View style={styles.attachmentList}>
        {attachments.map((attachment) => (
          <AttachmentRow key={attachment.id} attachment={attachment} readOnly={readOnly} />
        ))}

        {attachments.length === 0 && (
          <Text style={styles.emptySectionText}>No files attached yet.</Text>
        )}
      </View>
    </SectionCard>
  );
}

function SectionCard({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[sharedStyles.card, styles.sectionCard]}>
      <View style={styles.sectionHeader}>
        <Text style={sharedStyles.heading2}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

function InfoField({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "gold";
}) {
  return (
    <View style={styles.infoField}>
      <Text style={sharedStyles.label}>{label}</Text>
      <View
        style={[
          styles.infoValueBox,
          tone === "gold" && styles.infoValueBoxGold,
        ]}
      >
        <Text style={styles.infoValueText}>{value}</Text>
      </View>
    </View>
  );
}

function AttachmentRow({
  attachment,
  readOnly,
}: {
  attachment: Attachment;
  readOnly: boolean;
}) {
  return (
    <View style={styles.attachmentRow}>
      <View style={styles.attachmentIcon}>
        <Text style={styles.attachmentIconText}>
          {attachment.extension.replace(".", "").slice(0, 3).toUpperCase()}
        </Text>
      </View>

      <View style={styles.attachmentInfo}>
        <Text style={styles.attachmentName}>
          {attachment.fileName}
          {attachment.extension}
        </Text>
        <Text style={styles.attachmentMeta}>
          {attachment.size} · {attachment.createdDate} ·{" "}
          {attachment.createdBy}
        </Text>
      </View>

      {!readOnly && <Pressable
        onPress={() =>
          Alert.alert(
            "Remove Attachment",
            "This is a UI prototype — nothing will be removed."
          )
        }
      >
        <Text style={styles.attachmentRemove}>Remove</Text>
      </Pressable>}
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

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    flex: 1,
  },

  page: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },

  titleBlock: {
    marginBottom: theme.spacing.xs,
  },

  taskCode: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },

  dueDate: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: theme.spacing.xs,
  },

  informationToggle: {
    color: theme.colors.navy,
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCard: {
    gap: theme.spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },

  checklistCount: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },

  infoField: {
    width: "47%",
    gap: theme.spacing.xs,
  },

  infoValueBox: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.warmWhite,
    paddingHorizontal: theme.spacing.md,
    justifyContent: "center",
  },

  infoValueBoxGold: {
    borderColor: theme.colors.gold,
    backgroundColor: "#F3EBDD",
  },

  infoValueText: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },

  checklist: {
    gap: 0,
  },

  checklistRow: {
    flexDirection: "column",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.mist,
  },

  checklistRowLast: {
    borderBottomWidth: 0,
  },

  checklistLabel: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },

  checklistAnswerRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },

  checklistLabelArea: {
    flex: 1,
    minWidth: 0,
  },

  controlRow: {
    flexDirection: "row",
    flexShrink: 0,
    justifyContent: "flex-end",
    gap: theme.spacing.xs,
    alignItems: "center",
  },

  toggleButton: {
    minWidth: 40,
    minHeight: 32,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  toggleButtonActive: {
    borderColor: theme.colors.navy,
    backgroundColor: theme.colors.navy,
  },

  toggleButtonText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },

  toggleButtonTextActive: {
    color: theme.colors.white,
  },

  checklistCustomInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.warmWhite,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.ink,
    fontSize: 13,
  },

  emptySectionText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: theme.spacing.sm,
  },

  uploadButton: {
    minHeight: 52,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF8F3",
  },

  uploadButtonText: {
    color: theme.colors.navy,
    fontSize: 14,
    fontWeight: "600",
  },

  attachmentList: {
    gap: theme.spacing.sm,
  },

  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.mist,
  },

  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },

  attachmentIconText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },

  attachmentInfo: {
    flex: 1,
  },

  attachmentName: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },

  attachmentMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  attachmentRemove: {
    color: "#B3261E",
    fontSize: 13,
    fontWeight: "700",
  },

  submitArea: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  submitDisabled: { backgroundColor: theme.colors.mist },
  submitDisabledText: { color: theme.colors.textMuted },
  submitError: { color: "#B3261E", fontSize: 14 },
  submissionNotice: {
    ...sharedStyles.card,
    backgroundColor: theme.colors.mist,
    gap: theme.spacing.sm,
  },
  submissionNote: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },

});
