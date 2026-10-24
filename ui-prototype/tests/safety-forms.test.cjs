const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");
const vm = require("node:vm");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
};
const workflows = require("../src/constants/safety-forms.ts");
const { filterSafetyForms, checklistTypes, newSafetyForm, changeForm, hasFormChanges, saveFormDraft, submitForm } = workflows;

function storeHarness() {
  const states = [];
  let index = 0;
  const modules = {
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    react: {
      createContext: () => ({ Provider: "Provider" }),
      useCallback: (callback) => callback,
      useState: (initial) => {
        const slot = index++;
        if (!(slot in states)) states[slot] = initial;
        return [states[slot], (next) => { states[slot] = typeof next === "function" ? next(states[slot]) : next; }];
      },
      useRef: (initial) => {
        const slot = index++;
        if (!(slot in states)) states[slot] = { current: initial };
        return states[slot];
      },
    },
    "../constants/safety-forms": workflows,
  };
  const source = fs.readFileSync(require.resolve("../src/hooks/use-safety-forms.tsx"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => { assert.ok(modules[name], name); return modules[name]; } });
  return () => { index = 0; return exports.SafetyFormProvider({ children: null }).props.value; };
}

const completeFields = { condition: "Work area clear", ppe: ["Hard hat"], hazard: "Hazard", controlPlan: "Control", crewMember: "Alex", resolution: "Addressed", reviewedWithCrew: true };

test("all four templates start unchanged; only content changes create drafts", () => {
  assert.deepEqual(checklistTypes, ["Industrial", "Electrical", "Site Hazards", "General"]);
  for (const type of checklistTypes) {
    const form = newSafetyForm("id", type);
    assert.equal(form.type, type);
    assert.equal(hasFormChanges(form), false);
    assert.equal(form.saved, false);
    assert.equal(saveFormDraft(form), form);
    const changed = changeForm(form, { description: "Some notes" });
    assert.equal(hasFormChanges(changed), true);
    assert.equal(hasFormChanges(changeForm(changed, { description: "" })), false);
    const draft = saveFormDraft(changed);
    assert.equal(draft.saved, true);
    assert.equal(hasFormChanges(draft), false);
    assert.throws(() => submitForm(draft), /Required Fields Missing/);
    const pending = submitForm(changeForm(draft, { title: "Site check", fields: completeFields }));
    assert.equal(pending.status, "Pending");
    assert.equal(pending.photos.length, 0);
    assert.equal(changeForm(pending, { title: "Changed" }), pending);
  }
});

test("closing an empty new form discards it; closing changes saves a draft and toast", () => {
  const store = storeHarness();
  const emptyId = store().createForm("Industrial");
  store().closeForm(emptyId);
  assert.equal(store().forms.length, 0);
  assert.equal(store().notice, null);
  const id = store().createForm("Electrical");
  store().updateForm(id, { title: "Panel check" });
  store().closeForm(id);
  assert.equal(store().forms[0].saved, true);
  assert.equal(store().notice.message, "Form saved as a draft");
  assert.equal(store().notice.section, "Drafts");
  store().acknowledgeNotice();
  store().closeForm(id);
  assert.equal(store().notice, null);
  assert.equal(store().forms.length, 1);
  store().updateForm(id, { description: "More notes" });
  store().closeForm(id);
  assert.equal(store().notice.message, "Form saved as a draft");
  store().deleteForm(id);
  assert.equal(store().forms.length, 0);
});

test("checklist photos belong only to their form; Pending rejects edits and photo changes", () => {
  const store = storeHarness();
  const id = store().createForm("General");
  const otherId = store().createForm("Site Hazards");
  store().addPhoto(id, "First image");
  assert.equal(store().forms.find((form) => form.id === otherId).photos.length, 0);
  store().editPhoto(id, 0, "Updated");
  store().closeForm(id);
  assert.equal(store().forms.find((form) => form.id === id).photos[0].description, "Updated");
  assert.equal(store().submitForm(id), false);
  store().updateForm(id, { title: "Safety review", fields: completeFields });
  assert.equal(store().submitForm(id), true);
  const pending = store().forms.find((form) => form.id === id);
  assert.equal(store().notice.section, "Pending");
  store().addPhoto(id, "Another");
  store().editPhoto(id, 0, null);
  store().updateForm(id, { title: "Cannot edit" });
  store().deleteForm(id);
  assert.equal(store().forms.find((form) => form.id === id), pending);
  assert.equal(store().forms.find((form) => form.id === id).status, "Pending");
  store().addPhoto(otherId, "Delete this one");
  store().editPhoto(otherId, 0, null);
  assert.equal(store().forms.find((form) => form.id === otherId).photos.length, 0);
});


test("explicit Save as draft saves even an otherwise untouched form", () => {
  const store = storeHarness();
  const id = store().createForm("Industrial");
  store().saveDraft(id);
  assert.equal(store().forms[0].saved, true);
  assert.equal(store().forms[0].title, "");
  assert.equal(store().notice.message, "Form saved as a draft");
  store().acknowledgeNotice();
  store().closeForm(id);
  assert.equal(store().forms.length, 1);
  assert.equal(store().notice, null);
});


test("combined checklist search matches saved drafts and pending forms by title, type, and description", () => {
  const draft = saveFormDraft(changeForm(newSafetyForm("draft", "Electrical"), { title: "Panel review" }));
  const pending = submitForm(changeForm(newSafetyForm("pending", "Industrial"), { title: "Pump review", description: "Panel notes", fields: completeFields }));
  const untitled = saveFormDraft(newSafetyForm("untitled", "General"), true);
  const unsaved = changeForm(newSafetyForm("unsaved", "Electrical"), { title: "Panel unsaved" });
  const forms = [draft, pending, untitled, unsaved];
  assert.deepEqual(filterSafetyForms(forms, "All", "").map((form) => form.id), ["draft", "pending", "untitled"]);
  assert.deepEqual(filterSafetyForms(forms, "All", "  PANEL  ").map((form) => form.id), ["draft", "pending"]);
  assert.deepEqual(filterSafetyForms(forms, "All", "electrical").map((form) => form.id), ["draft"]);
  assert.deepEqual(filterSafetyForms(forms, "All", "Draft Checklist").map((form) => form.id), ["untitled"]);
  assert.deepEqual(filterSafetyForms(forms, "Drafts", "").map((form) => form.id), ["draft", "untitled"]);
  assert.deepEqual(filterSafetyForms(forms, "Pending", "").map((form) => form.id), ["pending"]);
  assert.deepEqual(filterSafetyForms(forms, "Submitted", ""), []);
});


test("checklist status tags and date/alphabetical sorts compose with search", () => {
  const forms = [
    { ...saveFormDraft(changeForm(newSafetyForm("bravo", "General"), { title: "Bravo" })), createdAt: 100 },
    { ...saveFormDraft(newSafetyForm("untitled", "Electrical"), true), createdAt: 200 },
    { ...submitForm(changeForm(newSafetyForm("alpha", "Industrial"), { title: "Alpha", fields: completeFields })), createdAt: 300 },
  ];
  const ids = (sort, statuses = [], query = "") => filterSafetyForms(forms, "All", query, statuses, sort).map((form) => form.id);
  assert.deepEqual(ids("newest"), ["alpha", "untitled", "bravo"]);
  assert.deepEqual(ids("oldest"), ["bravo", "untitled", "alpha"]);
  assert.deepEqual(ids("a-z"), ["alpha", "bravo", "untitled"]);
  assert.deepEqual(ids("z-a"), ["untitled", "bravo", "alpha"]);
  assert.deepEqual(ids("oldest", ["Drafts"]), ["bravo", "untitled"]);
  assert.deepEqual(ids("oldest", ["Pending"]), ["alpha"]);
  assert.deepEqual(ids("a-z", ["Drafts", "Pending"]), ["alpha", "bravo", "untitled"]);
  assert.deepEqual(ids("a-z", ["Drafts"], "alpha"), []);
  assert.deepEqual(ids("a-z", ["Pending"], "alpha"), ["alpha"]);
  assert.deepEqual(ids("newest", ["Submitted"]), []);
});

test("date sorting also handles forms created before creation timestamps were added", () => {
  const older = { ...saveFormDraft(newSafetyForm("form-100-1", "General"), true), createdAt: undefined };
  const newer = { ...saveFormDraft(newSafetyForm("form-200-2", "General"), true), createdAt: 200 };
  assert.deepEqual(filterSafetyForms([newer, older], "All", "", [], "oldest").map((form) => form.id), [older.id, newer.id]);
});
