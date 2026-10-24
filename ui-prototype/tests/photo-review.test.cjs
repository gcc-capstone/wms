const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function renderReview({ safety = false, status = "Not Started", safetyStatus = "Draft", photoId, fromGallery = false, addPhoto = false } = {}) {
  const photo = { id: "sensor", label: "Sensor", attached: false };
  const hazard = { id: "hazard", label: "Hazard", attached: false };
  const task = { id: 103, status, photos: [photo], safety: { status: safetyStatus, photo: hazard } };
  const saved = [];
  const destinations = [];
  let returns = 0;
  const states = [];
  let hookIndex = 0;
  const jsx = (type, props) => ({ type, props });
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: { useState: (value) => {
      const index = hookIndex++;
      if (!(index in states)) states[index] = value;
      return [states[index], (next) => { states[index] = next; }];
    } },
    "expo-image": { Image: "Image" },
    "expo-router": {
      Stack: { Screen: "Screen" },
      useLocalSearchParams: () => ({ id: "103", photoId: photoId ?? (safety ? "hazard" : "sensor"), safety: String(safety), fromGallery: String(fromGallery), addPhoto: String(addPhoto) }),
    },
    "react-native": { Pressable: "Pressable", Text: "Text", TextInput: "TextInput", View: "View", StyleSheet: { create: (styles) => styles } },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }) },
    "../../../components/android-back-transition": { useSmoothReturn: (destination) => {
      destinations.push(destination);
      return () => { returns++; };
    } },
    "../../../constants/evidence-photos": { photoUri: (id) => `dummy:${id}` },
    "../../../constants/prototype-workflows": { galleryPhotoPreview: () => ({ id: "sensor", label: "Additional photo" }) },
    "../../../constants/task-list": { taskDisplayStatus: (entry) => ({ Upcoming: "Current", Completed: "Completed", Pending: "Pending", Error: "Error" }[entry.status] ?? "Available") },
    "../../../hooks/use-tasks": { useTasks: () => ({ tasks: [task], keepPhoto: (...args) => saved.push(args) }) },
    "../../../theme/orbital-theme": { theme: { colors: { white: "#FFFFFF", navy: "#284765" }, radius: { md: 8 } } },
  };
  const captureSource = fs.readFileSync(require.resolve("../src/components/photo-capture.tsx"), "utf8");
  const captureExports = {};
  const captureCode = ts.transpileModule(captureSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  modules["../constants/evidence-photos"] = modules["../../../constants/evidence-photos"];
  modules["../theme/orbital-theme"] = modules["../../../theme/orbital-theme"];
  vm.runInNewContext(captureCode, { exports: captureExports, require: (name) => { assert.ok(modules[name], name); return modules[name]; } });
  modules["../../../components/photo-capture"] = captureExports;
  const source = fs.readFileSync(require.resolve("../src/app/tasks/photo/[id].tsx"), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (name) => {
    assert.ok(modules[name], name);
    return modules[name];
  } });
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node.type === "function") return walk(node.type(node.props));
    nodes.push(node);
    walk(node.props?.children);
  }
  const render = () => { nodes.length = 0; hookIndex = 0; walk(exports.default()); return nodes; };
  const button = (label) => render().find((node) => node.type === "Pressable" &&
    (node.props.accessibilityLabel === label || node.props.children?.props?.children === label));
  return { button, saved, destinations, get nodes() { return render(); }, get returns() { return returns; } };
}

for (const safety of [false, true]) {
  test(`${safety ? "safety" : "task"} photo only attaches on Use Photo and returns to its source`, () => {
    const review = renderReview({ safety });
    assert.equal(review.nodes.find((node) => node.type === "Image").props.source.uri, safety ? "dummy:hazard" : "dummy:sensor");
    review.button("Retake").props.onPress();
    assert.equal(review.saved.length, 0);
    assert.equal(review.returns, 0);
    review.button("Cancel photo").props.onPress();
    assert.equal(review.saved.length, 0);
    assert.equal(review.returns, 1);
    review.button("Use Photo").props.onPress();
    assert.deepEqual(review.saved, [[103, safety ? "hazard" : "sensor", safety, false, ""]]);
    assert.equal(review.returns, 2);
    assert.equal(review.destinations[0], safety ? "/tasks/safety/103" : "/tasks/103");
  });
}

test("read-only tasks and submitted safety checklists cannot attach photos", () => {
  for (const options of [{ status: "Error" }, { status: "Completed" }, { status: "Pending" }, { status: "Upcoming" }, { safety: true, safetyStatus: "Submitted" }]) {
    const review = renderReview(options);
    assert.equal(review.button("Use Photo").props.disabled, true);
    review.button("Use Photo").props.onPress();
    assert.equal(review.saved.length, 0);
    assert.equal(review.returns, 0);
  }
});

test("unknown photo identifiers cannot attach another photo", () => {
  const review = renderReview({ photoId: "missing" });
  assert.equal(review.button("Use Photo"), undefined);
  assert.equal(review.saved.length, 0);
});


test("reviewing a Safety Checklist photo from the gallery returns to the gallery", () => {
  const review = renderReview({ safety: true, fromGallery: true });
  review.button("Cancel photo").props.onPress();
  assert.equal(review.destinations[0], "/tasks/photos/103");
  assert.equal(review.saved.length, 0);
  assert.equal(review.returns, 1);
});


test("Add photo cancels without saving and only appends when confirmed", () => {
  const review = renderReview({ fromGallery: true, addPhoto: true });
  review.button("Cancel photo").props.onPress();
  assert.equal(review.saved.length, 0);
  review.button("Retake").props.onPress();
  assert.equal(review.saved.length, 0);
  review.button("Use Photo").props.onPress();
  assert.deepEqual(review.saved, [[103, "sensor", false, true, ""]]);
  assert.equal(review.destinations[0], "/tasks/photos/103");
});


test("Add photo cannot confirm on Current, Pending, Error, or Completed tasks", () => {
  for (const status of ["Upcoming", "Pending", "Error", "Completed"]) {
    const review = renderReview({ status, addPhoto: true, fromGallery: true });
    assert.equal(review.button("Use Photo").props.disabled, true);
    review.button("Use Photo").props.onPress();
    assert.equal(review.saved.length, 0);
  }
});


test("optional photo description saves on Use Photo and can be cancelled without saving", () => {
  const review = renderReview({ fromGallery: true, addPhoto: true });
  review.nodes.find((node) => node.type === "TextInput").props.onChangeText("  Repaired switch  ");
  assert.equal(review.saved.length, 0);
  review.button("Use Photo").props.onPress();
  assert.deepEqual(review.saved, [[103, "sensor", false, true, "Repaired switch"]]);
  const cancel = renderReview({ addPhoto: true });
  cancel.nodes.find((node) => node.type === "TextInput").props.onChangeText("Unsaved description");
  cancel.button("Cancel photo").props.onPress();
  assert.equal(cancel.saved.length, 0);
});
