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

- Log in to view the compact task list. Search task titles and switch between **Current**, **Available**, and **Completed**. Current tasks are waiting on a prerequisite and are view-only; Available tasks can be worked on. The list initially opens to Available.
- The existing Upcoming fixtures represent prerequisite-blocked Current tasks; existing Current, In Progress, and Not Started fixtures appear in Available. These are local display categories, not server scheduling or a working dependency engine.
- The cycle icon beside **My Tasks** confirms a local refresh without resetting answers or contacting a server. The header matches the 58-point Settings bar.
- Open a task on a single scrollable screen. Use the small arrow beside **Task Information** to expand its metadata. Task descriptions, technician/location lines, priority/status badges, review/comments actions, and detail tabs are not shown. Attachments appear after the checklist when present.
- Answer each checklist item using Yes/N/A, task-specific dropdown choices, or nonblank notes. **Submit** stays grey and disabled until every item is answered.
- Submitting marks the task **Completed**, retains its answers, and displays a confirmation. Completed checklists are read-only and their status also updates in the task list.
- Records are held in memory while the app is open. Reloading or restarting restores the dummy data; no authentication, server submission, or synchronization is performed.
- Submitted tasks move to **Completed** and stay view-only, including their attachments.

## Representative walkthroughs

The four April assignments in the Available tab are frontend-only fixtures from `OrbitalTasks.md`. Search by task title. Each assignment shows its due date; no real login is required. The October demo assignments remain in their corresponding tabs.

1. **Sarah Miller, April 20:** Open **Replace Fuse – Control Cabinet 3**. Record the new fuse, select **Good**, and enter **Jeffrey Fisher**. Use **Take photo** and **Use photo** for the inspection sticker. The preview supplies April 20, 2:14 PM, and North Ridge Substation. Submit without confirming the work area to see the named validation error. Confirm the missing item and submit again. Unlike other task forms, this scenario intentionally permits an incomplete Submit attempt to exercise validation.
2. **Marcus Lee, April 21:** Open **Inspect Control Panel – Pump 2**, create its Safety Checklist, and record the standing-water hazard, PPE, control plan, Elena Rodriguez, and the dummy hazard photo. **Save as draft**, leave the task, and reopen the draft. Record the water-removal resolution, confirm the crew review, and submit. The submitted Safety Checklist stays linked to the task; submitting it does not complete the separate electrical inspection.
3. **Aisha Patel, April 22:** Open **Inspect Pressure Sensor – Pump 4** in Available to see its offline-ready information. Opening it simulates loss of coverage. Enter **62 PSI**, select **Good**, confirm inspection, keep the sensor photo, and submit. Navigate away and return to see completed work waiting on the device. **Simulate connection returning at 3:35 PM** enters Synchronizing; **Finish simulated synchronization** shows receipt of checklist and photograph.
4. **Daniel Brooks, April 23:** Open **Inspect Repaired Disconnect Switch – Bay 4**, confirm inspection, select **Good**, enter the inspection note, and keep both required photos. Submit, then simulate connection returning at **4:10 PM**. Finish synchronization to see the completed-repair photo fail while the checklist, note, and identification photo succeed. Inspect the retained repair image, **Retry failed photograph**, and finish synchronization again.

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
