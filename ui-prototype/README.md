# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. FROM THE UI-PROTOTYPE DIRECTORY Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

Or:

   ```bash
   npx expo start --web
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Task prototype flow

- Log in to view the compact task list. Switch between **My Tasks** and **Completed** in the normal list view. The header search icon opens search and an ungrouped list across every task status, including Completed; section tabs are hidden while searching. Closing search clears it and restores the previous section. Returning from an item also resets search. Swipe left across the task area for Completed or right for My Tasks; both panels follow the drag and smoothly settle into place. Tapping the tabs animates the same transition. Short swipes spring back, and vertical scrolling and pull-to-refresh stay separate. The list initially opens to My Tasks, which combines Current, Available, and Pending tasks. The normal tabs sort by due date, earliest first; search has additional sorting options. Each card displays its status; task headers display the same status in a compact box.
- Upcoming fixtures display **Current** and remain prerequisite-blocked and view-only, with a greyed-out Submit button. Existing Current, In Progress, and Not Started fixtures display **Available** and can be worked on. **Pending** submissions stay in My Tasks until the simulated upload. These are local prototype statuses. Transformer Location Review waits on Inspect Repaired Disconnect Switch – Bay 4; Right-of-Way Photo Survey waits on Inspect Pressure Sensor – Pump 4. Each linked Current task displays its prerequisite title and becomes Available as soon as that prerequisite reaches Pending or Completed. This is a local simulation with no server scheduling. Offline indicators on tasks 103 and 104 sit to the left of the header status; Pending keeps its yellow Pending action.
- Status tags below search filter the combined results. Task tags are Available, Current, Pending, and Completed; checklist tags are Submitted, Pending, and Drafts. Tags match their status badge colors; selected tags have a darker outline and an X, and tapping them again clears them. Select several to combine statuses, or clear all to include every status. The filter icon opens sorting options: Newest/Oldest by due date for tasks or creation date for checklists, and A–Z/Z–A by title. Error tasks retain their priority at the top. Safety Checklist search matches title, description, and checklist type. Closing search clears tags and restores default sorting.
- Pull down from the top of the task list to drag the content beneath the fixed header and refresh. Releasing a short pull returns the content without refreshing; a full pull shows a loading indicator followed by the **Task List Refreshed** toast. Refreshing keeps answers and does not contact a server. The header matches the 58-point Settings bar.
- Open a task on a single scrollable screen. A rightward swipe from the left edge returns with the reverse stack transition; a leftward swipe does not leave the task. Safety Checklist back, Save as draft, and successful Submit return to the related task with the same reverse transition. Android briefly captures the outgoing app view to a temporary local image and slides it alongside the real destination, avoiding the native pop animation; the temporary image is deleted after the transition and is not saved to the gallery. Android hardware Back uses the same return animation. Use the small arrow beside **Task Information** to expand its metadata. Task descriptions, technician/location lines, priority/status badges, review/comments actions, and detail tabs are not shown. Attachments appear after the checklist when present.
- Answer each checklist item using Yes/No/N/A (unanswered items start with no selection), task-specific dropdown choices, or nonblank notes. **Submit** is active for every editable task. An incomplete submission shows red **Required Fields Missing** text above Submit and **\* Field Required** beneath missing checklist fields and required photographs. Safety Checklists use the same warnings for missing fields. All requirements must be complete before submission succeeds.
- Submitting marks the task **Completed**, retains its answers, greys out the button with **Submitted on [completion date]**, and shows a header-blue **Submission Successful** toast sliding down from the top for four seconds. A one-second loading spinner precedes the submitted button and toast. Completed checklists are read-only and their status also updates in the task list.
- Records are held in memory while the app is open. Reloading or restarting restores the dummy data; no authentication, server submission, or synchronization is performed.
- Submitted tasks stay view-only, including their attachments. Offline and upload-failure scenario submissions remain in **My Tasks** with a yellow **Pending** badge until uploaded, then move to **Completed**.

## Representative walkthroughs

The four April assignments in the My Tasks tab are frontend-only fixtures from `OrbitalTasks.md`. Search by task title. Each assignment shows its due date; no real login is required. The October demo assignments remain in their corresponding tabs.

1. **Sarah Miller, April 20:** Open **Replace Fuse – Control Cabinet 3**. Record the new fuse, select **Good**, and enter **Jeffrey Fisher**. Use **Take Photo** and **Use Photo** for the inspection sticker. The preview supplies April 20, 2:14 PM, and North Ridge Substation. Submit without answering the work-area item to see validation warnings. Select Yes, No, or N/A for the missing item and submit again. Every editable task permits an incomplete Submit attempt to show validation warnings.
2. **Marcus Lee, April 21:** Open **Inspect Control Panel – Pump 2**, create its Safety Checklist, and record the standing-water hazard, PPE, control plan, Elena Rodriguez, and the dummy hazard photo. **Save as draft**, leave the task, and reopen the draft. Record the water-removal resolution, confirm the crew review, and submit. The submitted Safety Checklist stays linked to the task; submitting it does not complete the separate electrical inspection.
3. **Aisha Patel, April 22:** Open **Inspect Pressure Sensor – Pump 4** in My Tasks. Enter **62 PSI**, select **Good**, confirm inspection, keep the sensor photo, and submit. After the loading spinner, the toast says **Offline -- Submission Pending** and the disabled button says **Submission Pending**. The task stays in My Tasks with a yellow **Pending** badge and retains its answers and photo. Press the yellow **Pending** control in the task header to simulate connection returning at **3:35 PM** and upload the submission in one step. The header control disappears, the task moves to Completed, and the button displays **Submitted on April 22**. There is no offline or completed-on-device panel for this task.
4. **Daniel Brooks, April 23:** Open **Inspect Repaired Disconnect Switch – Bay 4**, confirm inspection, select **Good**, enter the inspection note, and keep both required photos. Submit to see **Offline -- Submission Pending**, a disabled **Submission Pending** button, and a yellow **Pending** header control. The task stays in My Tasks with a **Pending** badge and no connectivity or completed-on-device box. Press **Pending** to simulate connection returning at **4:10 PM** and advance directly to **Photo upload failed**: the completed-repair photo fails while the checklist, note, and identification photo succeed. The header control becomes a red **Error** badge, and the task stays at the top of My Tasks. Inspect the retained repair image and press **Retry Failed Photograph** to complete the task immediately. The error panel disappears, with no Synchronizing or Synchronized panel.

**Take Photo** opens a full-screen review of the existing dummy image against a black background. The back arrow cancels without attaching it; **Retake** leaves the preview unchanged for now; The same screen includes an optional description field above the bottom **Retake** and **Use Photo** buttons. **Use Photo** attaches the image with or without a description and returns to the source screen. In the task photo gallery, tap a thumbnail to view the full image and its description. Tap the description (or **No description**) to edit it below the fixed photo. Tapping away saves the text without closing the viewer; another tap outside closes it. The top-left trash icon opens a deletion confirmation, and **Cancel** preserves the photo.

**Standalone Safety Checklists:** Use the floating **Checklists** tab, then the document-plus button to create an Industrial, Electrical, Site Hazards, or General form. Each uses the existing checklist fields with a required Title, optional Description, and its own optional photo gallery. Closing an untouched new form discards it; closing changed content saves a draft and shows **Form saved as a draft**. **Save as draft** also saves partial or empty forms. Drafts reopen for editing and can be deleted with confirmation. Valid submission moves a form to **Pending**, where its fields and photos are view-only; Submitted is reserved for a later workflow. Capture returns to the checklist gallery, whose back arrow returns to its form.

All photographs are local dummy SVG illustrations; no camera, GPS, external image URLs, API calls, backend, real offline detection, or actual uploads are used. The synchronization controls are temporary walkthrough controls. Drafts, answers, photos, and simulated sync progress survive navigation while the app is open, but reloads/restarts reset fixtures. Personal notes and reflective "My Thoughts" sections are not implementation requirements.

Run the focused workflow tests with `npm test`; run lint with `npm run lint` and type-check with `npx tsc --noEmit`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
