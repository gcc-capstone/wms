const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");
const vm = require("node:vm");

function pager(categories, category) {
  let handlers;
  let stateIndex = 0;
  const changes = [];
  const swipeStates = [];
  class Value {
    constructor(value) { this.value = value; }
    stopAnimation(callback) { callback?.(this.value); }
    setValue(value) { this.value = value; }
  }
  const jsx = (type, props) => ({ type, props });
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: (initial) => [stateIndex++ === 0 ? 400 : typeof initial === "function" ? initial() : initial, () => {}],
      useRef: (value) => ({ current: value }),
      useCallback: (callback) => callback,
      useMemo: (callback) => callback(),
      useLayoutEffect: (callback) => callback(),
      useEffect: () => {},
    },
    "react-native": {
      View: "View",
      Animated: { Value, View: "AnimatedView", spring: (value, options) => ({ start: () => value.setValue(options.toValue) }) },
      PanResponder: { create: (callbacks) => { handlers = callbacks; return { panHandlers: callbacks }; } },
      StyleSheet: { create: (styles) => styles },
    },
    "../constants/task-list": { taskCategories: ["My Tasks", "Completed"] },
  };
  const source = fs.readFileSync(require.resolve("../src/components/task-category-pager.tsx"), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (name) => { assert.ok(modules[name], name); return modules[name]; } });
  exports.CategoryPager({ categories, category, onCategoryChange: (next) => changes.push(next), onSwipeStateChange: (next) => swipeStates.push(next), minHeight: 400, children: () => null });
  return {
    changes, swipeStates,
    swipe: (dx, dy = 0) => {
      const gesture = { dx, dy, vx: 0 };
      if (!handlers.onMoveShouldSetPanResponderCapture(null, gesture)) return;
      handlers.onPanResponderGrant();
      handlers.onPanResponderMove(null, gesture);
      handlers.onPanResponderRelease(null, gesture);
    },
  };
}

test("checklist swipes select adjacent sections and stop at either edge", () => {
  const categories = ["Submitted", "Pending", "Drafts"];
  for (const [current, dx, expected] of [
    ["Submitted", -80, "Pending"], ["Pending", -80, "Drafts"],
    ["Drafts", 80, "Pending"], ["Pending", 80, "Submitted"],
    ["Submitted", 80, "Submitted"], ["Drafts", -80, "Drafts"],
  ]) {
    const view = pager(categories, current);
    view.swipe(dx);
    assert.deepEqual(view.changes, [expected]);
    assert.deepEqual(view.swipeStates, [true, false]);
  }
});

test("vertical gestures leave sections alone, and task swipes still use two pages", () => {
  const view = pager(["Submitted", "Pending", "Drafts"], "Pending");
  view.swipe(20, 100);
  assert.deepEqual(view.changes, []);
  const tasks = pager(["My Tasks", "Completed"], "My Tasks");
  tasks.swipe(-80);
  assert.deepEqual(tasks.changes, ["Completed"]);
});
