const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function renderReview({ safety = false, status = "Not Started", safetyStatus = "Draft", photoId } = {}) {
  const photo = { id: "sensor", label: "Sensor", attached: false };
  const hazard = { id: "hazard", label: "Hazard", attached: false };
  const task = { id: 103, status, photos: [photo], safety: { status: safetyStatus, photo: hazard } };
  const saved = [];
  const destinations = [];
  let returns = 0;
  const jsx = (type, props) => ({ type, props });
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: { useState: (value) => [value, () => {}] },
    "expo-image": { Image: "Image" },
    "expo-router": {
      Stack: { Screen: "Screen" },
      useLocalSearchParams: () => ({ id: "103", photoId: photoId ?? (safety ? "hazard" : "sensor"), safety: String(safety) }),
    },
    "react-native": { Pressable: "Pressable", Text: "Text", View: "View", StyleSheet: { create: (styles) => styles } },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }) },
    "../../../components/android-back-transition": { useSmoothReturn: (destination) => {
      destinations.push(destination);
      return () => { returns++; };
    } },
    "../../../constants/evidence-photos": { photoUri: (id) => `dummy:${id}` },
    "../../../constants/task-list": { isTaskBlocked: (entry) => entry.status === "Upcoming" },
    "../../../hooks/use-tasks": { useTasks: () => ({ tasks: [task], keepPhoto: (...args) => saved.push(args) }) },
    "../../../theme/orbital-theme": { theme: { colors: { white: "#FFFFFF", navy: "#284765" }, radius: { md: 8 } } },
  };
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
    nodes.push(node);
    walk(node.props?.children);
  }
  walk(exports.default());
  const button = (label) => nodes.find((node) => node.type === "Pressable" &&
    (node.props.accessibilityLabel === label || node.props.children?.props?.children === label));
  return { button, saved, destinations, nodes, get returns() { return returns; } };
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
    assert.deepEqual(review.saved, [[103, safety ? "hazard" : "sensor", safety]]);
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
