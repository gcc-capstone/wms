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

- Log in to view the compact task list. Search task titles and switch between **My Tasks** and **Completed**. Swipe left across the task area for Completed or right for My Tasks; tapping the tabs also works. The list initially opens to My Tasks, which combines Current, Available, and Pending tasks. Both tabs sort tasks by due date, earliest first, including when search or filters are active. Each card displays its status; task headers display the same status in a compact box.
- Upcoming fixtures display **Current** and remain prerequisite-blocked and view-only, with a greyed-out Submit button. Existing Current, In Progress, and Not Started fixtures display **Available** and can be worked on. **Pending** submissions stay in My Tasks until the simulated upload. These are local prototype statuses. Transformer Location Review waits on Inspect Repaired Disconnect Switch – Bay 4; Right-of-Way Photo Survey waits on Inspect Pressure Sensor – Pump 4. Each linked Current task displays its prerequisite title and becomes Available as soon as that prerequisite reaches Pending or Completed. This is a local simulation with no server scheduling. Offline indicators on tasks 103 and 104 sit to the left of the header status; Pending keeps its yellow Pending action.
- The filter icon beside search opens an overlay menu without shifting the list and filters My Tasks by Available, Current, or Pending. Select multiple statuses to combine them, or uncheck all statuses to clear the filter. Click outside the dropdown to dismiss it. Search and status filters work together; Completed always shows completed tasks and disables the status filter.
- Pull down from the top of the task list to drag the content beneath the fixed header and refresh. Releasing a short pull returns the content without refreshing; a full pull shows a loading indicator followed by the **Task List Refreshed** toast. Refreshing keeps answers and does not contact a server. The header matches the 58-point Settings bar.
- Open a task on a single scrollable screen. Use the small arrow beside **Task Information** to expand its metadata. Task descriptions, technician/location lines, priority/status badges, review/comments actions, and detail tabs are not shown. Attachments appear after the checklist when present.
- Answer each checklist item using Yes/No/N/A (unanswered items start with no selection), task-specific dropdown choices, or nonblank notes. **Submit** is active for every editable task. An incomplete submission shows red **Required Fields Missing** text above Submit and **\* Field Required** beneath missing checklist fields and required photographs. Safety Checklists use the same warnings for missing fields. All requirements must be complete before submission succeeds.
- Submitting marks the task **Completed**, retains its answers, greys out the button with **Submitted on [completion date]**, and shows a header-blue **Submission Successful** toast sliding down from the top for four seconds. A one-second loading spinner precedes the submitted button and toast. Completed checklists are read-only and their status also updates in the task list.
- Records are held in memory while the app is open. Reloading or restarting restores the dummy data; no authentication, server submission, or synchronization is performed.
- Submitted tasks stay view-only, including their attachments. Offline and upload-failure scenario submissions remain in **My Tasks** with a yellow **Pending** badge until uploaded, then move to **Completed**.

## Representative walkthroughs

The four April assignments in the My Tasks tab are frontend-only fixtures from `OrbitalTasks.md`. Search by task title. Each assignment shows its due date; no real login is required. The October demo assignments remain in their corresponding tabs.

1. **Sarah Miller, April 20:** Open **Replace Fuse – Control Cabinet 3**. Record the new fuse, select **Good**, and enter **Jeffrey Fisher**. Use **Take photo** and **Use photo** for the inspection sticker. The preview supplies April 20, 2:14 PM, and North Ridge Substation. Submit without answering the work-area item to see validation warnings. Select Yes, No, or N/A for the missing item and submit again. Every editable task permits an incomplete Submit attempt to show validation warnings.
2. **Marcus Lee, April 21:** Open **Inspect Control Panel – Pump 2**, create its Safety Checklist, and record the standing-water hazard, PPE, control plan, Elena Rodriguez, and the dummy hazard photo. **Save as draft**, leave the task, and reopen the draft. Record the water-removal resolution, confirm the crew review, and submit. The submitted Safety Checklist stays linked to the task; submitting it does not complete the separate electrical inspection.
3. **Aisha Patel, April 22:** Open **Inspect Pressure Sensor – Pump 4** in My Tasks. Enter **62 PSI**, select **Good**, confirm inspection, keep the sensor photo, and submit. After the loading spinner, the toast says **Offline -- Submission Pending** and the disabled button says **Submission Pending**. The task stays in My Tasks with a yellow **Pending** badge and retains its answers and photo. Press the yellow **Pending** control in the task header to simulate connection returning at **3:35 PM** and upload the submission in one step. The header control disappears, the task moves to Completed, and the button displays **Submitted on April 22**. There is no offline or completed-on-device panel for this task.
4. **Daniel Brooks, April 23:** Open **Inspect Repaired Disconnect Switch – Bay 4**, confirm inspection, select **Good**, enter the inspection note, and keep both required photos. Submit to see **Offline -- Submission Pending**, a disabled **Submission Pending** button, and a yellow **Pending** header control. The task stays in My Tasks with a **Pending** badge and no connectivity or completed-on-device box. Press **Pending** to simulate connection returning at **4:10 PM** and advance directly to **Photo upload failed**: the completed-repair photo fails while the checklist, note, and identification photo succeed. The header control disappears and the task moves to Completed. Inspect the retained repair image, **Retry failed photograph**, and finish synchronization again.

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
