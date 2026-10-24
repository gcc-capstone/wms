const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function gallery(description = "", readOnly = false, canAddPhoto = !readOnly) {
  const changes = [];
  const states = [];
  let hookIndex = 0;
  const jsx = (type, props) => ({ type, props });
  const task = { id: 104, status: "Not Started", photos: [{ id: "repair", label: "Repair", attached: true, description }] };
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: { useRef: (value) => {
      const index = hookIndex++;
      if (!(index in states)) states[index] = { current: value };
      return states[index];
    }, useState: (value) => {
      const index = hookIndex++;
      if (!(index in states)) states[index] = value;
      return [states[index], (next) => { states[index] = next; }];
    } },
    "expo-image": { Image: "Image" },
    "expo-router": { router: { push: () => {} } },
    "expo-symbols": { SymbolView: "SymbolView" },
    "react-native": {
      Modal: "Modal", Pressable: "Pressable", ScrollView: "ScrollView", Text: "Text", TextInput: "TextInput", View: "View",
      StyleSheet: { create: (styles) => styles, absoluteFill: {}, absoluteFillObject: {} },
      useWindowDimensions: () => ({ width: 400, height: 800 }),
    },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 0, left: 0 }) },
    "../constants/evidence-photos": { photoUri: () => "dummy:repair" },
    "../constants/prototype-workflows": { nextGalleryPhoto: () => ({ photo: task.photos[0], safety: false, additional: true }) },
    "../constants/task-list": { taskDisplayStatus: () => "Available" },
    "../hooks/use-tasks": { useTasks: () => ({ editPhoto: (...args) => changes.push(args) }) },
    "../theme/orbital-theme": { sharedStyles: {}, theme: { colors: {}, spacing: { sm: 8, xl: 20 }, radius: {} } },
  };
  const source = fs.readFileSync(require.resolve("../src/components/task-photo-gallery.tsx"), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (name) => { assert.ok(modules[name], name); return modules[name]; } });
  function nodes() {
    hookIndex = 0;
    const found = [];
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (typeof node.type === "function") return walk(node.type(node.props));
      found.push(node);
      walk(node.props?.children);
    }
    const wrapper = exports.TaskPhotoGallery({ task });
    walk({ ...wrapper, props: { ...wrapper.props, readOnly, canAddPhoto } });
    return found;
  }
  function button(label) {
    return nodes().find((node) => node.type === "Pressable" &&
      (node.props.accessibilityLabel === label || node.props.children?.props?.children === label));
  }
  button("View photo: Repair").props.onPress();
  return { changes, nodes, button };
}

test("description saves when tapped away, photo stays fixed, and a second tap closes", () => {
  const view = gallery();
  assert.ok(view.nodes().some((node) => node.type === "Text" && node.props.children === "No description"));
  const photoLayout = view.button("Photo preview").props.style;
  view.button("Edit photo description").props.onPress();
  assert.deepEqual(view.button("Photo preview").props.style, photoLayout);
  view.nodes().find((node) => node.type === "TextInput").props.onChangeText("  Repair checked  ");
  assert.equal(view.button("Save description"), undefined);
  const outside = view.button("Close photo preview");
  outside.props.onPressIn();
  // A blur can occur during the same pointer gesture; it must not save twice.
  const input = view.nodes().find((node) => node.type === "TextInput");
  if (input) input.props.onBlur();
  view.button("Close photo preview").props.onPress();
  assert.equal(view.changes.length, 1);
  assert.equal(view.changes[0][0], 104);
  assert.equal(view.changes[0][2], "Repair checked");
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, true);
  view.button("Close photo preview").props.onPressIn();
  view.button("Close photo preview").props.onPress();
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, false);
});

test("description blur saves once without closing the viewer", () => {
  const view = gallery("Old");
  view.button("Edit photo description").props.onPress();
  view.nodes().find((node) => node.type === "TextInput").props.onChangeText("New");
  view.nodes().find((node) => node.type === "TextInput").props.onBlur();
  assert.equal(view.changes.length, 1);
  assert.equal(view.changes[0][2], "New");
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, true);
});

test("trash requires confirmation and cancellation preserves the photo", () => {
  const view = gallery("Existing description");
  assert.ok(view.nodes().some((node) => node.type === "Text" && node.props.children === "Existing description"));
  view.button("Delete photo").props.onPress();
  assert.equal(view.changes.length, 0);
  view.button("Cancel").props.onPress();
  assert.equal(view.changes.length, 0);
  assert.equal(view.button("Delete"), undefined);
  view.button("Delete photo").props.onPress();
  view.button("Delete").props.onPress();
  assert.equal(view.changes.length, 1);
  assert.equal(view.changes[0][2], null);
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, false);
});


test("read-only checklist galleries allow viewing but no photo edits, deletion, or adding", () => {
  const view = gallery("Existing description", true);
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, true);
  assert.equal(view.button("Delete photo"), undefined);
  assert.equal(view.button("Edit photo description"), undefined);
  assert.equal(view.button("Photo description").props.disabled, true);
  assert.equal(view.button("Add photo"), undefined);
});


test("task galleries hide Add photo when the task cannot accept new photos", () => {
  const view = gallery("Existing photo", false, false);
  assert.equal(view.button("Add photo"), undefined);
  assert.equal(view.nodes().find((node) => node.type === "Modal").props.visible, true);
});
