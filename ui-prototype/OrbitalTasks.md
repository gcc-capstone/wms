## Personal Note
Hey guys,

Me and your other new customer, ChatGPT, spent a few hours working through a good set of representative tasks. I recommend that each of you choose one of them for your cognitive walkthrough.

I saw your current UI, and it is a good start. You will want to make sure it can support all of the representative tasks below, so depending on the task you choose, you will need to add some new dummy data and probably make a few minor additions to the prototype.

The tasks should be detailed enough that you can give them, along with your existing code, to AI and have it help add the necessary dummy data and interactions without requiring a lot of extra time. 

While much of the wording below eventually came from AI, each task went through a lot of iteration. I went through them line by line and added specific details intentionally so that the walkthroughs should expose weaknesses in the current UI and give you useful things to improve. Please treat the details in the scenarios as important rather than just filler text to complete the assignment. Please also pay close attention to the feedback the user is expecting and recieving along the way as they complete their tasks.

## About the Dummy UI

Remember that this is still a **dummy UI for cognitive walkthroughs and user testing**. You are not implementing the real application yet.

You already have a prototype, but you should now modify it so that the representative tasks below can actually be walked through from beginning to end using the specific people, tasks, dates, data, errors, and other details in the scenarios.

Only implement enough behavior to make those representative tasks feel realistic.

For example, if a representative task says that Sarah takes a photograph of an inspection sticker:

- The prototype does not need to access the real device camera.
- Taking the photo can simply cause a dummy inspection-sticker image to appear.
- The UI might allow Sarah to keep the photo or retake it.
- If the representative task says that Sarah keeps the first photo, the retake path does not need to work.

Similarly, the prototype can contain additional tasks, buttons, menu choices, or screens that help it look like a realistic application without making every one of them functional.

The goal right now is **not to implement WMS Mobile**. The goal is to create a realistic enough prototype that another person can attempt the representative tasks and expose problems in your interface design.

### Using AI to Update the Prototype
If you decide to update the dummy UI for all the tasks at once (recommended) you might want to remove the "My Thoughts" sections or tell AI to ignore that text --- that is stuff I want you to think through -- i dont want the AI to consider good ways to address these issues for you.

You are welcome to use AI heavily to modify the dummy UI. Give the AI your existing project and the representative tasks, and be very explicit that this is a test prototype rather than the real implementation.

A prompt along these lines should work well:

> I have an existing React Native dummy UI for a proposed WMS Mobile application. This prototype is only being used for cognitive walkthroughs and user testing. It is NOT the production application, and it is not connected to a real backend.
>
> I will give you several detailed representative tasks that specific users must be able to walk through.
> Please ignore any text in the "My Thoughts" sections, do not substantially change the current look to address the questions posed in those sections. That will be discovered as the students work through their cognitive walkthroughs.
>
> Modify my existing prototype so those exact representative tasks can be completed from beginning to end.
>
> Important constraints:
>
> - Preserve the existing look and overall structure of the prototype where reasonable rather than rebuilding the application from scratch.
> - Add the exact dummy tasks, names, dates, locations, checklist values, statuses, errors, and other information described in the representative tasks.
> - Implement only the interactions necessary to complete those representative tasks.
> - Do not build real backend functionality, authentication, synchronization, camera integration, location services, or other production functionality.
> - Simulate those behaviors with local state and hard-coded dummy data.
> - When a representative task requires a photograph, simulate taking the photograph by displaying an appropriate dummy image.
> - The UI may show other realistic actions even when they do not work. If an action is not exercised by one of the representative tasks, it does not need to be implemented.
> - When an error is part of a representative task, simulate that exact error at the appropriate point in the workflow.
> - Preserve the user's previously entered dummy data when the representative task says that information should remain.
> - Do not add extra features or workflows unless they are necessary to support the representative tasks.
>
> Most importantly, do not decide how the user should accomplish a task merely because the representative task says what the user wants to accomplish. Use the existing UI design where possible, and help me make the prototype testable without unnecessarily prescribing or redesigning the interface.
>
> Here are the representative tasks:
>
> [PASTE REPRESENTATIVE TASKS HERE]
>
> Here is the current React Native project/code:
>
> [PROVIDE PROJECT OR RELEVANT FILES HERE]


## Representative Task 1: Complete a Field Task with Checklist Validation and Photo Evidence

### Scenario

Sarah Miller is a field technician working at North Ridge Substation on April 20. Earlier that morning, she replaced a blown fuse in a control cabinet. She now needs to document the work and complete the assigned task in WMS Mobile.

### Task Flow

Sarah should be able to complete the following workflow:

1. Sarah opens WMS Mobile and looks for her task for today.

2. She finds the task:

   **Replace Fuse – Control Cabinet 3**

   The task is:

   - At `North Ridge Substation`
   - Due `April 20`
   - `High` priority
   - Currently `In Progress`

3. Sarah opens the task and reviews the work description:

   `Replace the failed 15A fuse in Control Cabinet 3 and complete the post-replacement inspection.`

4. Sarah has already installed the new fuse. She records that the following checklist item has been completed:

   `New 15A fuse installed`

5. She records the condition of the equipment after replacement as:

   `Good`

6. The task asks for the foreman or site contact. Sarah enters:

   `Jeffrey Fisher`

7. The task requires a photograph of the inspection sticker. Sarah takes a photograph using the device camera.

8. Sarah sees a preview of the photograph. The inspection sticker is clear and readable, so she chooses to use the photograph rather than retake it.

9. Sarah notices that the application has already recorded:

   - Date: `April 20`
   - Time: `2:14 PM`
   - Location: `North Ridge Substation`

   She does not need to enter this information herself.

10. Sarah has accidentally left the following required checklist item unanswered:

`Work area clear of tools and debris`

She does not notice the missing item and attempts to complete the task.

11. The task cannot be completed because required information is missing. Sarah is clearly informed that:

`Work area clear of tools and debris`

has not been completed.

12. Sarah returns to the missing checklist item and confirms that the work area is clear of tools and debris.

13. All of Sarah's previously entered information is still present:

- The new-fuse installation is still recorded.
- Equipment condition is still `Good`.
- `Jeffrey Fisher` is still recorded as the site contact.
- The inspection-sticker photograph is still attached.

14. Sarah reviews the completed task and photograph.

15. Sarah attempts to complete the task again.

16. This time the task is successfully completed, and Sarah receives clear confirmation that the completion was accepted.

17. The task is now recorded as `Completed`.

### My Thoughts for Representative task 1

Don't just use the cognitive walkthrough to ask, "Can Sarah eventually figure out how to do this?" Pay attention to small details in the representative task and think about what they imply about how the application should work.

For example, the first step intentionally says that Sarah is looking for **her task for today**. That small detail could lead to a much bigger UI change.

Maybe Sarah should not normally begin on a generic screen where she has to search through all of her tasks. Perhaps today's work should be immediately visible. Maybe once Sarah has selected or started her current task, opening the application should take her directly back to that task. Maybe there should be an obvious distinction between the task she is currently working on, the rest of today's work, and tasks scheduled for later.  Maybe when she selects a task from the list, she has the immediate opportunity to mark it as her current task.

I am not saying that any of those is necessarily the right solution. The point of the walkthrough is to notice things like this and ask whether your current design matches how someone would realistically use the application in the field.


## Representative Task 2: Create and Complete a Safety Checklist for a Job-Site Hazard
I know you guys heard that perhaps safety lists are not as important any more - i kinda want to still do them, I think they are an interesting addition.  I certainly want to do them more than imagine 100 different sync issues. However, I am fine if you want to drop them.

### Scenario

Marcus Lee is a field technician working at East Valley Pump Station on April 21. He is there to inspect the electrical control panel for Pump 2.

Before beginning the inspection, Marcus notices standing water on the floor near the electrical panel. The water needs to be addressed before he can safely begin the work. Marcus needs to create a Safety Checklist documenting the condition, the precautions that will be taken, and the people involved.

### Task Flow

Marcus should be able to complete the following workflow:

1. Marcus opens WMS Mobile and looks for his task for today.

2. He finds the task:

   **Inspect Control Panel – Pump 2**

   The task is:

   - At `East Valley Pump Station`
   - Due `April 21`
   - `High` priority
   - Currently `Not Started`

3. Marcus reviews the task and sees that he is supposed to inspect the Pump 2 electrical control panel.

4. Before beginning the work, Marcus notices standing water near the electrical panel. He decides that he needs to create a new Safety Checklist for this job.

5. Marcus creates a Safety Checklist associated with:

   **Inspect Control Panel – Pump 2**

6. Marcus sees that information the application already knows has been filled in for him:

   - Technician: `Marcus Lee`
   - Date: `April 21`
   - Location: `East Valley Pump Station`
   - Related task: `Inspect Control Panel – Pump 2`

   He does not need to enter this information again.

7. Marcus records the job-site condition:

   `Standing water near electrical equipment`

8. Marcus identifies the required PPE for the work as:

   - `Safety glasses`
   - `Insulated gloves`

9. Marcus describes the hazard:

   `Standing water is approximately three feet from the Pump 2 electrical control panel.`

10. Marcus records the control plan:

   `Barricade the wet area and have site maintenance remove the water before the electrical panel is opened.`

11. Marcus takes a photograph showing the standing water and its location relative to the electrical panel.

12. Marcus sees a preview of the photograph. The hazard and electrical panel are both clearly visible, so he chooses to use the photograph rather than retake it.

13. Marcus records that another member of the crew involved in the work is:

   `Elena Rodriguez`

14. Before the water has been removed, Marcus needs to leave the checklist temporarily. He saves the Safety Checklist as a draft and returns to his other work in the application.

15. A short time later, site maintenance has removed the water. Marcus returns to the Safety Checklist he started earlier.

16. Marcus sees that the checklist is still a draft and that all of the information he previously entered is still present, including:

   - The identified hazard.
   - Required PPE.
   - The control plan.
   - `Elena Rodriguez` as a crew member.
   - The photograph of the site condition.

17. Marcus records that the hazard has now been addressed:

   `Water removed and work area dry before electrical inspection began.`

18. Marcus confirms that the safety requirements have been reviewed with the crew.

19. Marcus reviews the completed Safety Checklist and submits it.

20. Marcus receives clear confirmation that the Safety Checklist was accepted.

21. The Safety Checklist is now recorded as `Submitted` and remains associated with:

   **Inspect Control Panel – Pump 2**

### My Thoughts on Task 2

This task is different from Representative Task 1 in an important way. Marcus is not simply completing information that was already attached to an assigned task. He recognizes a safety issue in the field and creates a **new record** that needs to remain connected to his existing work.

Think carefully about what that means for the UI.

For example, Marcus notices the hazard while working on `Inspect Control Panel – Pump 2`. Does your current design make it natural for him to create a Safety Checklist in that context? After creating one, will he be confident that it is associated with the correct task?

Also notice how much information WMS Mobile already knows. Marcus is logged in, the application knows which task he is working on, and the task already has a location and date. Making him type `Marcus Lee`, `East Valley Pump Station`, and `April 21` again may create unnecessary work and opportunities for mistakes. Think about what information should be inherited from the task or filled in automatically and what information really needs Marcus's input.

Saving the checklist as a draft is also intentional. Field work may be interrupted. Marcus should not have to finish a long form in one sitting, and he should not have to wonder whether the information he already entered was saved. When he comes back later, think about how he finds his unfinished Safety Checklist and how the interface communicates that it is still a draft.

There are similar questions throughout this task:

- Is it clear that Marcus is creating a Safety Checklist rather than completing the task's normal checklist?
- When Marcus leaves an unfinished checklist, is he confident that his work has been saved?
- When he returns later, can he easily find the draft and understand what remains to be completed?
- After submission, is it clear that the Safety Checklist was successfully submitted and remains associated with the correct task?



## Representative Task 3: Complete Work Offline and Synchronize It Later

### Scenario

Aisha Patel is a field technician scheduled to inspect a pressure sensor at West Creek Pump Station on April 22. The pump station is in an area where cellular service is unreliable, so she needs to be able to complete the work even if WMS Mobile cannot communicate with the server.

Before leaving an area with network access, Aisha makes sure that the task she plans to work on is available on her device. She then travels to West Creek Pump Station, where her device loses its network connection.

Aisha completes the inspection while offline. Later, after she leaves the site and regains network access, the work is synchronized with WMS.

### Task Flow

Aisha should be able to complete the following workflow:

1. While she still has network access, Aisha opens WMS Mobile and looks for her task for today.

2. She finds the task:

   **Inspect Pressure Sensor – Pump 4**

   The task is:

   - At `West Creek Pump Station`
   - Due `April 22`
   - `Normal` priority
   - Currently `Not Started`

3. Aisha checks that the information she will need for this task is available on her device before she leaves network coverage.

4. Aisha arrives at West Creek Pump Station and opens the task.

5. Her device no longer has a network connection.

6. Aisha reviews the work description:

   `Inspect the Pump 4 pressure sensor, record the current reading, inspect the sensor for visible damage, and document the completed inspection.`

7. Aisha records that the following inspection item has been completed:

   `Pressure sensor visually inspected`

8. The task asks for the current pressure reading. Aisha enters:

   `62 PSI`

9. Aisha records the condition of the sensor as:

   `Good`

10. The task requires a photograph of the pressure sensor after the inspection. Aisha takes a photograph.

11. Aisha sees a preview of the photograph. The sensor and its identification label are clearly visible, so she chooses to use the photograph rather than retake it.

12. Aisha reviews her work and completes the task while she is still offline.

13. The application makes it clear that her work has been saved on the device but has **not yet been sent to WMS**.

14. Aisha leaves the task and looks at the rest of her assigned work.

15. Before leaving the site, Aisha returns to **Inspect Pressure Sensor – Pump 4**.

16. She can see that:

   - Her `62 PSI` reading is still present.
   - The sensor condition is still recorded as `Good`.
   - The photograph is still attached.
   - The task has been completed on the device.
   - The completed work is still waiting to synchronize with WMS.

17. Aisha leaves West Creek Pump Station.

18. At `3:35 PM`, her device regains network access.

19. The completed checklist information and photograph are synchronized with WMS.

20. Aisha can tell when synchronization is still in progress and when it has finished successfully.

21. After the server has accepted all of the information associated with the task, Aisha can see that the task is now synchronized with WMS.

22. Aisha is confident that the work is no longer stored only on her device and that WMS has received the completed task and photograph.

### My Thoughts for task 3
I think this is one of the most interesting tasks for thinking through the right feedback you want to give the user. 

The important part of this representative task is not simply that "the app works offline." Think about what Aisha needs to **understand** while she moves between online and offline work.

When Aisha is standing at West Creek Pump Station without a network connection, she should not have to wonder whether she is allowed to continue working. The application should help her understand that the task is available offline and that the information she enters is being saved.

There is an important difference between:

**"My work is safely saved on this device."**

and:

**"My work has been received by WMS."**

Those are not the same thing.

Your current UI may not make that distinction very important because most of your prototype has assumed that data is immediately available. This representative task should make you think carefully about how a field technician understands the state of their work.

The beginning of the task may also lead you to reconsider how assigned work is presented. Aisha knows she is heading somewhere with poor network connectivity. How does she know whether `Inspect Pressure Sensor – Pump 4` will actually be usable when she gets there? Would your current interface give her confidence before she leaves?

Likewise, think about what happens after Aisha completes the task offline. If she returns to her task list, a simple `Completed` label could actually be misleading. The field work may be complete, but WMS has not received it yet. Your design may need to distinguish between those two ideas in some way.


### Prototype Note for task 3

For this task, do not spend time implementing real offline detection or real synchronization yet. The goal of the dummy UI is to let us test whether the user understands the different states of their work.

Aisha's `Inspect Pressure Sensor – Pump 4` task should open in a way that clearly represents the application being offline. Other dummy tasks in your prototype can still appear to be online.

You may also add temporary controls that exist only for the prototype so that a tester can move through events that would normally happen because of time or network changes.

For example, after Aisha completes the task offline, you could include a temporary prototype-only action that simulates the network connection returning. That could move the UI through states such as:

- Completed on device / waiting to sync
- Synchronizing
- Synchronized with WMS

maybe just for this task you can have 3 buttons across the bottom that lets you toggle between these 3 states to see the effect on the ui

That temporary action is not part of the proposed final interface. It is simply a way to let the cognitive walkthrough or user test experience the important states without actually turning network access on and off or waiting for time to pass.

The important thing to prototype realistically is what the user sees and understands, not the underlying networking behavior.

### What to Tell AI

I think it might be good to share all these tasks to AI to modify the code in one go, but I think it is good to add some other instructions for this task>

> Here are some additional instructions for writing the dummy React Native prototype code that is specific for this task number 3.
>
> Modify the existing prototype so that the representative task involving Aisha Patel and `Inspect Pressure Sensor – Pump 4` can be walked through exactly as written.
>
> For this task only, make the app appear to be offline when Aisha opens the task. Other dummy tasks can continue to look online.
>
> Do not implement real network detection, offline storage, or synchronization.
>
> Instead, simulate the important UI states with local dummy state.
>
> After Aisha completes the task offline, show that the work is saved on the device but has not yet reached WMS.
>
> Add a clearly temporary prototype-only control that simulates the network connection returning. When used, have the prototype move through realistic synchronization states and eventually show that the task has synchronized successfully.
>
> The temporary simulation control is only for testing and should not be treated as part of the final application design.
>
> Preserve the existing UI design where reasonable. Add only the behavior and dummy data needed to support this representative task.


## Representative Task 4: Recover from a Failed Photo Upload

### Scenario

Daniel Brooks is a field technician working at Cedar Grove Substation on April 23. He has completed a scheduled inspection of a repaired disconnect switch and documented the work in WMS Mobile.

The task requires two photographs. Daniel completes the work in an area with unreliable connectivity. When his device reconnects and the completed task begins synchronizing with WMS, most of the information is received successfully, but one of the photographs fails to upload.

Daniel needs to understand what happened, know that his work has not been lost, and successfully finish synchronizing the task without repeating work that was already completed.

### Task Flow

Daniel should be able to complete the following workflow:

1. Daniel opens WMS Mobile and looks for his task for today.

2. He finds the task:

   **Inspect Repaired Disconnect Switch – Bay 4**

   The task is:

   - At `Cedar Grove Substation`
   - Due `April 23`
   - `High` priority
   - Currently `In Progress`

3. Daniel reviews the work description:

   `Inspect the repaired disconnect switch in Bay 4, verify that the repair is complete, and document the condition of the equipment.`

4. Daniel records that:

   `Repair visually inspected`

   has been completed.

5. He records the condition of the repaired equipment as:

   `Good`

6. Daniel enters the following inspection note:

   `Repair complete. No visible damage or loose connections observed.`

7. The task requires a photograph of the equipment identification plate. Daniel takes the photograph, sees that the identification information is clearly readable, and chooses to use it.

8. The task also requires a photograph showing the completed repair. Daniel takes a second photograph, sees that the repair is clearly visible, and chooses to use it.

9. Daniel reviews his work and completes the task.

10. His device has poor connectivity, so the completed work cannot immediately be fully synchronized with WMS. The work remains safely stored on the device.

11. At `4:10 PM`, Daniel's device regains a reliable network connection and synchronization begins.

12. WMS successfully receives:

   - The completed checklist information.
   - Daniel's inspection note.
   - The photograph of the equipment identification plate.

13. The photograph showing the completed repair fails to upload.

14. Daniel can clearly tell that the task has **not yet fully synchronized**.

15. Daniel is informed that the completed-repair photograph did not upload successfully.

16. He can also tell that:

   - His checklist information has not been lost.
   - His inspection note has not been lost.
   - The identification-plate photograph was successfully received.
   - The failed completed-repair photograph is still saved on his device.

17. Daniel looks at the failed photograph and sees that it is still the correct, clear photograph he originally took. He does not need to take another picture.

18. Daniel tries to synchronize the failed photograph again.

19. This time the photograph uploads successfully.

20. WMS now has all of the required information for the task.

21. Daniel can clearly see that the entire task, including both photographs, has successfully synchronized with WMS.

22. Daniel is confident that there is no remaining work waiting on his device and that he does not need to repeat any part of the inspection.

### My Thoughts for task 4

The interesting part of this task is the **partial failure**.

Most of Daniel's work succeeded. One thing did not.

That is very different from simply showing a generic message that says something like "Synchronization failed."

Think about what Daniel actually needs to know. If he sees an error after spending time completing a field inspection, one of his first concerns may be whether all of his work was lost. Your interface should help him understand exactly what succeeded, what did not, and what still needs his attention.

Also notice that Daniel should not have to redo successful work just because one photograph failed. The checklist has already been received. One photograph has already been received. The second photograph is still safely stored on his device. The remaining job is relatively small: get that one photograph to WMS.

This may cause you to reconsider how your current UI represents synchronization. A single task-level status such as `Failed` may not tell the user enough. On the other hand, showing every internal API request or technical detail would probably be overwhelming. Think about what level of information is actually useful to Daniel.

This task will also need some "prototype only" buttons that allow you to show the passage of time to a new state and perhaps toggle back to see what it looked like before.



