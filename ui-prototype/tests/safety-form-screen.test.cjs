const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");
const vm = require("node:vm");

function screen({ pending = false, valid = false } = {}) {
  const calls = [];
  const slots = [];
  let slot = 0;
  const form = { id: "form-1", type: "Electrical", title: "Panel review", description: "Description", status: pending ? "Pending" : "Draft", fields: { condition: null, ppe: [], hazard: "", controlPlan: "", crewMember: "", resolution: "", reviewedWithCrew: false } };
  const jsx = (type, props) => ({ type, props });
  const store = {
    forms: [form],
    updateForm: (...args) => calls.push(["update", ...args]),
    closeForm: (id) => calls.push(["close", id]),
    saveDraft: (id) => calls.push(["saveDraft", id]),
    deleteForm: (id) => calls.push(["delete", id]),
    submitForm: (id) => { calls.push(["submit", id]); return valid; },
  };
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: {
      useRef: (value) => { const index = slot++; if (!(index in slots)) slots[index] = { current: value }; return slots[index]; },
      useState: (value) => { const index = slot++; if (!(index in slots)) slots[index] = typeof value === "function" ? value() : value; return [slots[index], (next) => { slots[index] = next; }]; },
      useCallback: (callback) => callback,
    },
    "expo-router": { Stack: { Screen: "Screen" }, useLocalSearchParams: () => ({ id: "form-1" }), router: { push: (route) => calls.push(["route", route]) } },
    "expo-symbols": { SymbolView: "SymbolView" },
    "react-native": { Pressable: "Pressable", ScrollView: "ScrollView", Text: "Text", TextInput: "TextInput", View: "View", StyleSheet: { create: (styles) => styles } },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }) },
    "../../../components/android-back-transition": { useSmoothReturn: (path, beforeReturn) => () => { beforeReturn?.(); calls.push(["return", path]); } },
    "../../../components/delete-confirmation": { DeleteConfirmation: "DeleteConfirmation" },
    "../../../components/task-dropdown": { TaskDropdown: "TaskDropdown" },
    "../../../constants/safety-forms": { missingFormFields: () => valid ? [] : ["condition"] },
    "../../../hooks/use-safety-forms": { useSafetyForms: () => store },
    "../../../theme/orbital-theme": { sharedStyles: {}, theme: { colors: { navy: "#284765" } } },
  };
  const source = fs.readFileSync(require.resolve("../src/app/checklists/form/[id].tsx"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => { assert.ok(modules[name], name); return modules[name]; } });
  function nodes() {
    slot = 0;
    const result = [];
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      result.push(node); walk(node.props?.children);
    }
    walk(exports.default());
    return result;
  }
  const button = (label) => nodes().find((node) => node.type === "Pressable" && (node.props.accessibilityLabel === label || node.props.children?.props?.children === label));
  return { nodes, calls, button };
}

test("form X autosaves; explicit Save as draft saves once and returns", () => {
  const close = screen();
  close.button("Close safety checklist").props.onPress();
  assert.deepEqual(close.calls, [["close", "form-1"], ["return", "/checklists"]]);
  const draft = screen();
  draft.button("Save as draft").props.onPress();
  assert.deepEqual(draft.calls, [["saveDraft", "form-1"], ["return", "/checklists"]]);
});

test("valid submission returns without saving a draft; invalid submission stays", () => {
  const valid = screen({ valid: true });
  valid.button("Submit Safety Checklist").props.onPress();
  assert.deepEqual(valid.calls, [["submit", "form-1"], ["return", "/checklists"]]);
  const invalid = screen();
  invalid.button("Submit Safety Checklist").props.onPress();
  assert.deepEqual(invalid.calls, [["submit", "form-1"]]);
});

test("Pending form is view-only, while the gallery remains accessible", () => {
  const pending = screen({ pending: true });
  assert.equal(pending.button("Save as draft"), undefined);
  assert.equal(pending.button("Submit Safety Checklist"), undefined);
  assert.equal(pending.button("Delete safety checklist"), undefined);
  assert.ok(pending.nodes().filter((node) => node.type === "TextInput").every((node) => node.props.editable === false));
  assert.ok(pending.nodes().filter((node) => node.props?.accessibilityRole === "checkbox").every((node) => node.props.disabled === true));
  pending.button("View checklist photos").props.onPress();
  assert.equal(pending.calls[0][1].pathname, "/checklists/photos/[id]");
});
