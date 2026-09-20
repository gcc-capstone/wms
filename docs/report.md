### Cover
text and images

### Introduction

> Field personnel at Orbital can access and manage their tasks from a mobile device. 

### Representative Tasks
text

### Related Work

#### Planera

Planera is a construction scheduling and project-planning platform. Its relevant features for our system are its focus on field execution, task-level progress tracking, and connecting office planning with work performed in the field. Planera allows field users to view schedules, update progress, and monitor changes from the jobsite. It also provides a mobile/iPad experience so field personnel can interact with project information while working.

Planera does provide a mobile experience for those in the field. Our system will focus on this component of the system. Users will be able to see their assigned tasks, complete or check off work, and provide information about completed work. Both mobile experiences emphasize making field work information accessible at the worksite rather than requiring workers to return to an office. Planera's field schedules similarly allow users to update progress and track the status of field activities.

The most significant differences between Planera and our application are the scope and the intended user. Planera is a scheduling and project-management platform. It provides features such as schedules, dependencies, resource planning, and critical-path analysis. Our system does not include scheduling or planning. Instead, tasks are assigned to field workers, who are responsible for completing and documenting those tasks. Planera has a holistic approach to project management. While our application will include an admin role for viewing tasks and assigning tasks, the creation of tasks is offloaded to the existing WMS platform. Our system is also designed specifically around mobile task execution while this is only one aspect of Planera.

An important capability for our application is offline task completion. If a worker loses connectivity at the worksite, they can still complete and check off tasks. This allows the core workflow to continue even when reliable internet access is unavailable. Planera does not support this kind of synchronization. This emphasizes our focus on those working in the field. The system is not designed for streamlined planning and scheduling. It is designed to enable the field workers to complete tasks efficiently, wherever they may be.

#### FieldAware

FieldAware is a field-service management platform designed around mobile workers completing assigned jobs. Its mobile application allows field personnel to receive assigned jobs, view job and task information, update job status, capture photos and other documentation, and complete work from an Android or iOS device. FieldAware also supports offline operation, allowing fieldworkers to continue working when a network connection is unavailable.

Our system will share many of FieldAware's core field-work interactions. Users will be able to view assigned tasks, complete or check off tasks, track task status, and upload photos documenting their work. Both applications are designed around giving fieldworkers the information they need directly on a mobile device rather than requiring them to return to an office. FieldAware's mobile application also allows workers to access assigned jobs and update their status from the field. They both will support offline synchronization capabilities.

The primary difference is the scope of the applications and the type of work being managed. FieldAware is a broader field-service management platform. In addition to mobile task execution, it provides scheduling and dispatching, customer and equipment information, GPS and routing, time tracking, work-order management, invoicing, and other features for managing an entire field-service operation.

Our system is more narrowly focused on employees completing assigned work within an industrial field environment. Workers will receive their tasks rather than create or manage schedules. The application will focus on completing tasks, documenting work through photographs, tracking task status, and completing safety checklists. A lot of functionality such as customer management, routing, invoicing, and broader scheduling and dispatching is outside the scope of our system.

### Siemens COMOS Mobile Worker

COMOS Mobile Worker provides a mobile interface for workers performing maintenance and inspection activities in industrial environments. Relevant features include task assignments, mobile inspection and safety checklists, photo/video documentation, task-status updates, and offline operation. Siemens specifically describes the application as supporting maintenance tasks, inspection tours, safety checks, and task assignments from mobile devices.

Our system will have a similar focus on field employees completing assigned work from a mobile device. Users will be able to view their assigned tasks, update task status, check off completed work, upload photos, and complete safety checklists. Like COMOS Mobile Worker, our application will allow workers to perform these activities at the worksite rather than requiring them to return to an office.

Offline functionality is another major similarity. COMOS Mobile Worker supports offline operation and automatically synchronizes information when a connection becomes available. Our system will similarly allow users to check off tasks while offline and synchronize those changes with the server once they reconnect.

The main difference is the scope of the information surrounding the worker's tasks. COMOS Mobile Worker is part of Siemens' broader COMOS industrial engineering and plant-management ecosystem. It can provide workers with access to equipment history, technical documentation, asset information, and integrations with other systems.

Our application has a narrower purpose. Workers receive assigned tasks and focus on completing and documenting those tasks. The system will not attempt to provide the broader engineering, asset-management, or enterprise-system functionality associated with COMOS. Our interface will instead concentrate on the immediate workflow of the employee performing the assigned work.

### Fieldwire

Fieldwire is a construction jobsite management software designed to connect field and office teams. Its relevant features for our system include task assignment and tracking, checklists, inspections, photos and videos, safety issues, and mobile access. Fieldwire describes its tasks as being used for work progress, inspections, safety issues, QA/QC issues, and other work that needs to be completed at the jobsite. Fieldworkers can complete these tasks through Android and iOS mobile applications.

Our system will share several of Fieldwire's core field capabilities. Users will be able to view assigned tasks, complete or check off tasks, track task status, upload photos, and complete safety checklists. Both systems are also designed around mobile use at the worksite. Fieldwire supports Android and allows workers to access and update project information from their mobile devices.

Another important similarity is offline functionality. Fieldwire allows users to work offline, including completing inspections and taking photos, and automatically synchronizes updated information after the device reconnects. Our system will use a similar approach: when a worker is offline, they can still check off assigned tasks, and those changes will synchronize with the server once connectivity is restored.

The primary difference is the scope of the application and the workflow surrounding tasks. Fieldwire is a broad construction management platform. In addition to tasks, it provides access to construction drawings, plan markups, as-builts, forms, reports, scheduling, and communication between project participants.

Our application will have a much narrower focus. Workers receive assigned tasks and complete them. They will not be responsible for creating project schedules, managing construction drawings, coordinating project participants, or managing the broader project. Our system instead focuses on the actions directly associated with completing assigned fieldwork.

There is also a difference in the intended environment. Fieldwire is specifically designed for construction teams and jobsites, while our system is being developed for employees performing fieldwork for a company in the industrial sector. Although the environments differ, many of the representative tasks completing assigned work, documenting that work, performing inspections or safety checks, and updating task status are similar.

### Bibliography
Planera. “Modern CPM Scheduling | Planera,” n.d. [https://www.planera.io/]().

FieldAware by GPS Insight. “Best Field Service Management Software & Mobile App.,” November 14, 2025. https://www.fieldaware.com/.

Siemens. “Why COMOS Mobile Worker?,” n.d. https://www.siemens.com/en-us/products/comos/mobile-worker/.

Fieldwire by Hilti. “Real-Time Jobsite Management Software | Fieldwire by Hilti | Fieldwire by Hilti,” n.d. https://www.fieldwire.com/.