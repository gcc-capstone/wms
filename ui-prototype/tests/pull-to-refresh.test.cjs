const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function createPull() {
  const timers = new Map();
  let timerId = 0;
  let refreshCount = 0;
  const handlers = {};
  const nativeScroll = {};
  const pan = {};
  for (const name of ["onBegin", "onStart", "onUpdate", "onEnd", "onFinalize"]) {
    pan[name] = (callback) => { handlers[name] = callback; return pan; };
  }
  for (const name of ["runOnJS", "activeOffsetY", "failOffsetX", "simultaneousWithExternalGesture"]) {
    pan[name] = (value) => { handlers[name] = value; return pan; };
  }
  class Value {
    constructor(value) { this.value = value; }
    setValue(value) { this.value = value; }
    stopAnimation() {}
  }
  const modules = {
    react: {
      useRef: (value) => ({ current: value }),
      useState: (initial) => {
        let value = typeof initial === "function" ? initial() : initial;
        return [value, (next) => { value = next; }];
      },
      useMemo: (factory) => factory(),
      useCallback: (callback) => callback,
      useEffect: () => {},
    },
    "react-native": {
      Animated: { Value, spring: (value, options) => ({ start: () => value.setValue(options.toValue) }) },
      PanResponder: { create: (callbacks) => ({ panHandlers: callbacks }) },
    },
    "react-native-gesture-handler": { Gesture: { Native: () => nativeScroll, Pan: () => pan } },
  };
  const source = fs.readFileSync(require.resolve("../src/hooks/use-pull-to-refresh.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exportsObject = {};
  vm.runInNewContext(outputText, {
    exports: exportsObject,
    require: (name) => { assert.ok(modules[name], name); return modules[name]; },
    setTimeout: (callback) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  });
  const hook = exportsObject.usePullToRefresh(() => { refreshCount += 1; });
  return {
    hook, handlers, timers,
    get refreshCount() { return refreshCount; },
    release: () => { for (const callback of timers.values()) callback(); timers.clear(); },
    pull: (distance) => {
      handlers.onBegin(); handlers.onStart();
      handlers.onUpdate({ translationY: distance }); handlers.onEnd(); handlers.onFinalize();
    },
  };
}

test("native pull shares the ScrollView gesture and refreshes at the top on either list", () => {
  const pull = createPull();
  assert.equal(pull.handlers.simultaneousWithExternalGesture, pull.hook.nativeScrollGesture);
  assert.equal(pull.handlers.activeOffsetY, 10);
  assert.equal(pull.handlers.runOnJS, true);
  for (let index = 0; index < 2; index++) {
    pull.hook.setScrollTop(0);
    pull.pull(160);
    assert.equal(pull.hook.offset.value, 64);
    assert.equal(pull.timers.size, 1);
    pull.release();
    assert.equal(pull.refreshCount, index + 1);
    assert.equal(pull.hook.offset.value, 0);
  }
});

test("native pulls do not refresh while scrolled, below threshold, or when cancelled", () => {
  const pull = createPull();
  pull.hook.setScrollTop(150);
  pull.pull(180);
  assert.equal(pull.timers.size, 0);
  pull.hook.setScrollTop(0);
  pull.pull(60);
  assert.equal(pull.timers.size, 0);
  assert.equal(pull.hook.offset.value, 0);
  pull.handlers.onBegin(); pull.handlers.onStart();
  pull.handlers.onUpdate({ translationY: 160 }); pull.handlers.onFinalize();
  assert.equal(pull.timers.size, 0);
  assert.equal(pull.hook.offset.value, 0);
});

test("fractional top offsets work and repeated pulls cannot start duplicate refreshes", () => {
  const pull = createPull();
  pull.hook.setScrollTop(1);
  pull.pull(160); pull.pull(160);
  assert.equal(pull.timers.size, 1);
  pull.release();
  assert.equal(pull.refreshCount, 1);
});
