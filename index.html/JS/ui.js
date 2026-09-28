(function () {
    "use strict";

    const utils = window.TaskFlowUtils;
    const tasks = window.TaskFlowTasks;
    const storage = window.TaskFlowStorage;

    if (!utils || !tasks || !storage) {
        console.error("[TaskFlow] Required modules are missing.");
        return;
    }

    const $ = utils.$;
    const $$ = utils.$$;

    /* =====================================================
       DOM
    ===================================================== */

    const el = {
        sidebar: $("#sidebar"),
        sidebarClose: $("#sidebarClose"),
        sidebarOverlay: $("#sidebarOverlay"),
        menuButton: $("#menuButton"),

        focusSearchButton: $("#focusSearchButton"),
        themeButton: $("#themeButton"),

        addTaskButton: $("#addTaskButton"),
        emptyAddTaskButton: $("#emptyAddTaskButton"),

        searchInput: $("#searchInput"),
        clearSearchButton: $("#clearSearchButton"),

        filterButtons: $$("[data-filter]"),

        sortButton: $("#sortButton"),
        sortMenu: $("#sortMenu"),

        taskList: $("#taskList"),
        emptyState: $("#emptyState"),
        noResultsState: $("#noResultsState"),

        totalTasks: $("#totalTasks"),
        pendingTasks: $("#pendingTasks"),
        completedTasks: $("#completedTasks"),
        progressPercentage: $("#progressPercentage"),

        allTasksCount: $("#allTasksCount"),
        todayTasksCount: $("#todayTasksCount"),
        upcomingTasksCount: $("#upcomingTasksCount"),
        completedTasksCount: $("#completedTasksCount"),

        productivityPercentage: $("#productivityPercentage"),
        productivityProgress: $("#productivityProgress"),

        taskModal: $("#taskModal"),
        taskModalTitle: $("#taskModalTitle"),
        closeTaskModal: $("#closeTaskModal"),
        cancelTaskButton: $("#cancelTaskButton"),

        taskForm: $("#taskForm"),
        taskId: $("#taskId"),
        taskTitle: $("#taskTitle"),
        taskDescription: $("#taskDescription"),
        taskPriority: $("#taskPriority"),
        taskDate: $("#taskDate"),

        saveTaskButton: $("#saveTaskButton"),
        saveTaskButtonText: $("#saveTaskButtonText"),

        confirmModal: $("#confirmModal"),
        cancelDeleteButton: $("#cancelDeleteButton"),
        confirmDeleteButton: $("#confirmDeleteButton"),

        toastContainer: $("#toastContainer"),

        navItems: $$(".nav-item"),

        settingsButton: $('.nav-item[data-action="settings"]')
    };

    /* =====================================================
       STATE
    ===================================================== */

    let editingTaskId = null;
    let deletingTaskId = null;

    /* =====================================================
       ICONS
    ===================================================== */

    const icons = {
        check: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="m5 12 4 4L19 6"/>
            </svg>
        `,

        edit: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
        `,

        trash: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v5"/>
                <path d="M14 11v5"/>
            </svg>
        `,

        copy: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">
                <rect x="9" y="9" width="11" height="11" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
        `,

        calendar: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="3"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
            </svg>
        `,

        close: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round">
                <path d="m6 6 12 12"/>
                <path d="m18 6-12 12"/>
            </svg>
        `,

        settings: `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z"/>
            </svg>
        `
    };

    /* =====================================================
       INTERNAL STYLES
       Makes burger/settings independent from broken CSS
    ===================================================== */

    function injectUIStyles() {

        if (document.getElementById("taskflow-ui-fixes")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "taskflow-ui-fixes";

        style.textContent = `
            /* ================================
               DESKTOP SIDEBAR COLLAPSE
            ================================= */

            body.taskflow-sidebar-collapsed .sidebar {
                transform: translateX(-100%) !important;
            }

            body.taskflow-sidebar-collapsed .main {
                margin-left: 0 !important;
                width: 100% !important;
            }

            body.taskflow-sidebar-collapsed .content {
                max-width: 1500px;
            }

            /* ================================
               MOBILE SIDEBAR
            ================================= */

            @media (max-width: 820px) {

                body.taskflow-sidebar-collapsed .sidebar {
                    transform: translateX(-100%) !important;
                }

                body.taskflow-sidebar-collapsed .main {
                    margin-left: 0 !important;
                    width: 100% !important;
                }
            }

            /* ================================
               SETTINGS MODAL
            ================================= */

            .taskflow-settings-modal {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(0, 0, 0, .72);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition:
                    opacity .22s ease,
                    visibility .22s ease;
            }

            .taskflow-settings-modal.is-open {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            .taskflow-settings-card {
                width: min(520px, 100%);
                max-height: min(720px, 90vh);
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,.09);
                border-radius: 24px;
                background:
                    linear-gradient(
                        145deg,
                        rgba(25,25,34,.98),
                        rgba(11,11,16,.98)
                    );
                box-shadow:
                    0 30px 100px rgba(0,0,0,.55),
                    0 0 50px rgba(139,124,255,.10);
                transform: translateY(18px) scale(.97);
                transition: transform .22s ease;
            }

            .taskflow-settings-modal.is-open
            .taskflow-settings-card {
                transform: translateY(0) scale(1);
            }

            .taskflow-settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 24px 24px 18px;
                border-bottom: 1px solid rgba(255,255,255,.07);
            }

            .taskflow-settings-title {
                margin: 0;
                font-size: 22px;
                font-weight: 800;
                color: #fff;
            }

            .taskflow-settings-subtitle {
                margin: 5px 0 0;
                font-size: 13px;
                color: rgba(255,255,255,.52);
            }

            .taskflow-settings-close {
                width: 40px;
                height: 40px;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 12px;
                background: rgba(255,255,255,.04);
                color: rgba(255,255,255,.75);
                display: grid;
                place-items: center;
                cursor: pointer;
                transition: .2s ease;
            }

            .taskflow-settings-close:hover {
                background: rgba(255,255,255,.09);
                color: #fff;
                transform: rotate(90deg);
            }

            .taskflow-settings-close svg {
                width: 18px;
                height: 18px;
            }

            .taskflow-settings-body {
                padding: 20px 24px 24px;
            }

            .taskflow-settings-section {
                padding: 16px 0;
            }

            .taskflow-settings-section + .taskflow-settings-section {
                border-top: 1px solid rgba(255,255,255,.06);
            }

            .taskflow-settings-label {
                margin-bottom: 4px;
                font-size: 14px;
                font-weight: 750;
                color: #fff;
            }

            .taskflow-settings-description {
                margin-bottom: 13px;
                font-size: 12px;
                line-height: 1.5;
                color: rgba(255,255,255,.48);
            }

            .taskflow-settings-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
            }

            .taskflow-settings-button {
                min-height: 40px;
                padding: 0 15px;
                border: 1px solid rgba(255,255,255,.09);
                border-radius: 11px;
                background: rgba(255,255,255,.055);
                color: #fff;
                font: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: .2s ease;
            }

            .taskflow-settings-button:hover {
                transform: translateY(-1px);
                background: rgba(139,124,255,.16);
                border-color: rgba(139,124,255,.35);
            }

            .taskflow-settings-button.danger:hover {
                background: rgba(255,80,110,.14);
                border-color: rgba(255,80,110,.3);
            }

            .taskflow-theme-switch {
                position: relative;
                width: 54px;
                height: 30px;
                flex: 0 0 auto;
            }

            .taskflow-theme-switch input {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }

            .taskflow-theme-slider {
                position: absolute;
                inset: 0;
                border-radius: 99px;
                background: rgba(255,255,255,.12);
                cursor: pointer;
                transition: .25s ease;
            }

            .taskflow-theme-slider::before {
                content: "";
                position: absolute;
                width: 22px;
                height: 22px;
                left: 4px;
                top: 4px;
                border-radius: 50%;
                background: #fff;
                transition: .25s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,.3);
            }

            .taskflow-theme-switch input:checked
            + .taskflow-theme-slider {
                background: #8b7cff;
            }

            .taskflow-theme-switch input:checked
            + .taskflow-theme-slider::before {
                transform: translateX(24px);
            }

            .taskflow-settings-footer {
                padding-top: 12px;
                font-size: 11px;
                color: rgba(255,255,255,.32);
                text-align: center;
            }

            @media (max-width: 520px) {

                .taskflow-settings-card {
                    border-radius: 20px;
                }

                .taskflow-settings-header,
                .taskflow-settings-body {
                    padding-left: 18px;
                    padding-right: 18px;
                }

                .taskflow-settings-row {
                    align-items: flex-start;
                }
            }

            /* ================================
               TOAST
            ================================= */

            .toast {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .toast__close {
                display: grid;
                place-items: center;
                flex: 0 0 auto;
            }

            .toast__close svg {
                width: 16px;
                height: 16px;
            }

            /* ================================
               TASK EMPTY
            ================================= */

            .task-list-hidden {
                display: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       HELPERS
    ===================================================== */

    function isSuccessful(result) {

        if (!result) {
            return false;
        }

        if (typeof result.success === "boolean") {
            return result.success;
        }

        return true;
    }

    function getResultTask(result) {

        if (!result) {
            return null;
        }

        return result.task || result;
    }

    function show(element) {

        if (!element) return;

        element.hidden = false;
        element.classList.remove("is-hidden");
    }

    function hide(element) {

        if (!element) return;

        element.hidden = true;
        element.classList.add("is-hidden");
    }

    /* =====================================================
       TASK CARD
    ===================================================== */

    function createTaskCard(task) {

        const card = document.createElement("article");

        card.className =
            "task-card" +
            (task.completed
                ? " task-card--completed"
                : "");

        card.dataset.taskId = task.id;

        let dueDate = "";

        if (task.dueDate) {

            dueDate = `
                <span class="task-meta-item">
                    ${icons.calendar}
                    <span>
                        ${utils.escapeHTML(
                            utils.formatShortDate(task.dueDate)
                        )}
                    </span>
                </span>
            `;
        }

        const description = task.description
            ? `
                <p class="task-description">
                    ${utils.escapeHTML(task.description)}
                </p>
            `
            : "";

        card.innerHTML = `

            <button
                type="button"
                class="task-checkbox"
                data-action="toggle"
                aria-label="${
                    task.completed
                        ? "Mark as active"
                        : "Mark as completed"
                }"
            >
                ${icons.check}
            </button>

            <div class="task-content">

                <h3 class="task-title">
                    ${utils.escapeHTML(task.title)}
                </h3>

                ${description}

                <div class="task-meta">

                    <span class="priority-badge priority-badge--${utils.escapeHTML(task.priority)}">
                        ${utils.capitalize(task.priority)}
                    </span>

                    ${dueDate}

                </div>

            </div>

            <div class="task-actions">

                <button
                    type="button"
                    class="task-action"
                    data-action="edit"
                    aria-label="Edit task"
                    title="Edit"
                >
                    ${icons.edit}
                </button>

                <button
                    type="button"
                    class="task-action"
                    data-action="duplicate"
                    aria-label="Duplicate task"
                    title="Duplicate"
                >
                    ${icons.copy}
                </button>

                <button
                    type="button"
                    class="task-action"
                    data-action="delete"
                    aria-label="Delete task"
                    title="Delete"
                >
                    ${icons.trash}
                </button>

            </div>
        `;

        return card;
    }

    /* =====================================================
       RENDER TASKS
    ===================================================== */

    function renderTasks() {

        if (!el.taskList) return;

        const visible = tasks.getVisibleTasks();

        el.taskList.innerHTML = "";

        if (visible.length === 0) {

            hide(el.taskList);

            const all = tasks.getAll();
            const state = tasks.getState();

            if (all.length > 0 && state.search) {

                hide(el.emptyState);
                show(el.noResultsState);

            } else {

                show(el.emptyState);
                hide(el.noResultsState);
            }

            return;
        }

        hide(el.emptyState);
        hide(el.noResultsState);
        show(el.taskList);

        const fragment =
            document.createDocumentFragment();

        visible.forEach(task => {

            fragment.appendChild(
                createTaskCard(task)
            );

        });

        el.taskList.appendChild(fragment);
    }

    /* =====================================================
       STATS
    ===================================================== */

    function renderStats() {

        const stats = tasks.getStats();

        if (el.totalTasks) {
            el.totalTasks.textContent = stats.total;
        }

        if (el.pendingTasks) {
            el.pendingTasks.textContent = stats.pending;
        }

        if (el.completedTasks) {
            el.completedTasks.textContent = stats.completed;
        }

        if (el.progressPercentage) {
            el.progressPercentage.textContent =
                `${stats.progress}%`;
        }

        if (el.allTasksCount) {
            el.allTasksCount.textContent = stats.total;
        }

        if (el.todayTasksCount) {
            el.todayTasksCount.textContent = stats.today;
        }

        if (el.upcomingTasksCount) {
            el.upcomingTasksCount.textContent = stats.upcoming;
        }

        if (el.completedTasksCount) {
            el.completedTasksCount.textContent =
                stats.completed;
        }

        if (el.productivityPercentage) {
            el.productivityPercentage.textContent =
                `${stats.progress}%`;
        }

        if (el.productivityProgress) {
            el.productivityProgress.style.width =
                `${stats.progress}%`;
        }
    }

    /* =====================================================
       FILTERS
    ===================================================== */

    function updateFilters() {

        const current =
            tasks.getState().filter;

        el.filterButtons.forEach(button => {

            const active =
                button.dataset.filter === current;

            button.classList.toggle(
                "filter-button--active",
                active
            );

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-selected",
                String(active)
            );
        });
    }

    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setView(view) {

        const validViews = [
            "all",
            "today",
            "upcoming",
            "completed"
        ];

        if (!validViews.includes(view)) {
            return;
        }

        tasks.setFilter(view);

        el.navItems.forEach(item => {

            const itemView =
                item.dataset.view ||
                item.dataset.filter;

            item.classList.toggle(
                "nav-item--active",
                itemView === view
            );

            item.classList.toggle(
                "active",
                itemView === view
            );
        });

        updateFilters();
        renderTasks();
    }

    /* =====================================================
       TASK MODAL
    ===================================================== */

    function openTaskModal(task = null) {

        editingTaskId =
            task ? task.id : null;

        if (el.taskModalTitle) {
            el.taskModalTitle.textContent =
                task
                    ? "Edit Task"
                    : "Create New Task";
        }

        if (el.taskId) {
            el.taskId.value =
                task?.id || "";
        }

        if (el.taskTitle) {
            el.taskTitle.value =
                task?.title || "";
        }

        if (el.taskDescription) {
            el.taskDescription.value =
                task?.description || "";
        }

        if (el.taskPriority) {
            el.taskPriority.value =
                task?.priority || "medium";
        }

        if (el.taskDate) {
            el.taskDate.value =
                task?.dueDate || "";
        }

        if (el.saveTaskButtonText) {
            el.saveTaskButtonText.textContent =
                task
                    ? "Save Changes"
                    : "Create Task";
        }

        if (el.taskModal) {

            el.taskModal.hidden = false;

            el.taskModal.classList.add(
                "is-open"
            );

            el.taskModal.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        document.body.classList.add(
            "modal-open"
        );

        setTimeout(() => {
            el.taskTitle?.focus();
        }, 80);
    }

    function closeTaskModal() {

        if (!el.taskModal) return;

        if (
            document.activeElement &&
            el.taskModal.contains(
                document.activeElement
            )
        ) {
            el.addTaskButton?.focus();
        }

        el.taskModal.classList.remove(
            "is-open"
        );

        el.taskModal.setAttribute(
            "aria-hidden",
            "true"
        );

        setTimeout(() => {

            if (
                !el.taskModal.classList.contains(
                    "is-open"
                )
            ) {
                el.taskModal.hidden = true;
            }

        }, 250);

        document.body.classList.remove(
            "modal-open"
        );

        editingTaskId = null;

        if (el.taskForm) {
            el.taskForm.reset();
        }
    }

    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    function handleSubmit(event) {

        event.preventDefault();

        const title =
            el.taskTitle?.value.trim() || "";

        if (!title) {

            showToast(
                "Please enter a task title.",
                "warning"
            );

            el.taskTitle?.focus();

            return;
        }

        const data = {
            title,

            description:
                el.taskDescription?.value.trim() || "",

            priority:
                el.taskPriority?.value || "medium",

            dueDate:
                el.taskDate?.value || ""
        };

        const wasEditing =
            Boolean(editingTaskId);

        let result;

        if (wasEditing) {

            result = tasks.update(
                editingTaskId,
                data
            );

        } else {

            result = tasks.create(data);
        }

        console.log(
            "[TaskFlow] Task operation:",
            result
        );

        if (!isSuccessful(result)) {

            showToast(
                "Unable to save task.",
                "warning"
            );

            return;
        }

        closeTaskModal();

        renderAll();

        showToast(
            wasEditing
                ? "Task updated successfully."
                : "Task created successfully.",
            "success"
        );
    }

    /* =====================================================
       DELETE MODAL
    ===================================================== */

    function openDeleteModal(id) {

        deletingTaskId = id;

        if (!el.confirmModal) return;

        el.confirmModal.hidden = false;

        el.confirmModal.classList.add(
            "is-open"
        );

        el.confirmModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }

    function closeDeleteModal() {

        if (!el.confirmModal) return;

        if (
            document.activeElement &&
            el.confirmModal.contains(
                document.activeElement
            )
        ) {
            el.addTaskButton?.focus();
        }

        el.confirmModal.classList.remove(
            "is-open"
        );

        el.confirmModal.setAttribute(
            "aria-hidden",
            "true"
        );

        setTimeout(() => {

            if (
                !el.confirmModal.classList.contains(
                    "is-open"
                )
            ) {
                el.confirmModal.hidden = true;
            }

        }, 250);

        document.body.classList.remove(
            "modal-open"
        );

        deletingTaskId = null;
    }

    function deleteTask() {

        if (!deletingTaskId) return;

        const result =
            tasks.remove(deletingTaskId);

        if (!isSuccessful(result)) {

            showToast(
                "Unable to delete task.",
                "warning"
            );

            return;
        }

        closeDeleteModal();

        renderAll();

        showToast(
            "Task deleted.",
            "success"
        );
    }

    /* =====================================================
       TASK ACTIONS
    ===================================================== */

    function handleTaskAction(event) {

        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) return;

        const card =
            button.closest(".task-card");

        if (!card) return;

        const id = card.dataset.taskId;

        if (!id) return;

        const action =
            button.dataset.action;

        if (action === "toggle") {

            const result =
                tasks.toggleComplete(id);

            if (isSuccessful(result)) {

                renderAll();

                const updated =
                    getResultTask(result);

                showToast(
                    updated?.completed
                        ? "Task completed 🎉"
                        : "Task marked as active.",
                    "success"
                );
            }

            return;
        }

        if (action === "edit") {

            const task =
                tasks.getById(id);

            if (task) {
                openTaskModal(task);
            }

            return;
        }

        if (action === "delete") {

            openDeleteModal(id);

            return;
        }

        if (action === "duplicate") {

            const result =
                tasks.duplicate(id);

            if (isSuccessful(result)) {

                renderAll();

                showToast(
                    "Task duplicated.",
                    "success"
                );
            }
        }
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    function handleSearch() {

        const value =
            el.searchInput?.value || "";

        tasks.setSearch(value);

        if (el.clearSearchButton) {

            el.clearSearchButton.hidden =
                value.length === 0;
        }

        renderTasks();
    }

    function clearSearch() {

        if (el.searchInput) {
            el.searchInput.value = "";
        }

        tasks.setSearch("");

        if (el.clearSearchButton) {
            el.clearSearchButton.hidden = true;
        }

        renderTasks();
    }

    /* =====================================================
       SORT
    ===================================================== */

    function closeSortMenu() {

        if (!el.sortMenu) return;

        el.sortMenu.classList.remove(
            "is-open"
        );

        el.sortMenu.hidden = true;
    }

    function toggleSortMenu(event) {

        event?.stopPropagation();

        if (!el.sortMenu) return;

        const isOpen =
            el.sortMenu.classList.contains(
                "is-open"
            );

        if (isOpen) {

            closeSortMenu();

        } else {

            el.sortMenu.hidden = false;

            requestAnimationFrame(() => {

                el.sortMenu.classList.add(
                    "is-open"
                );
            });
        }
    }

    function selectSort(value) {

        const map = {

            newest: "created-desc",

            oldest: "created-asc",

            priority: "priority-desc",

            dueDate: "due-asc",

            "created-desc": "created-desc",

            "created-asc": "created-asc",

            "priority-desc": "priority-desc",

            "priority-asc": "priority-asc",

            "due-asc": "due-asc",

            "due-desc": "due-desc",

            "title-asc": "title-asc",

            "title-desc": "title-desc"
        };

        const sort =
            map[value] || "created-desc";

        tasks.setSort(sort);

        renderTasks();

        closeSortMenu();
    }

    /* =====================================================
       THEME
    ===================================================== */

    function applyTheme(theme) {

        const selected =
            theme === "light"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme =
            selected;

        document.documentElement.classList.toggle(
            "light-theme",
            selected === "light"
        );

        document.body.classList.toggle(
            "light-theme",
            selected === "light"
        );

        if (el.themeButton) {

            el.themeButton.setAttribute(
                "aria-label",
                selected === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }

        const settingsToggle =
            document.getElementById(
                "taskflowSettingsTheme"
            );

        if (settingsToggle) {
            settingsToggle.checked =
                selected === "light";
        }
    }

    function toggleTheme() {

        const current =
            storage.getSetting(
                "theme",
                "dark"
            );

        const next =
            current === "dark"
                ? "light"
                : "dark";

        storage.updateSetting(
            "theme",
            next
        );

        applyTheme(next);

        showToast(
            next === "light"
                ? "Light mode enabled."
                : "Dark mode enabled.",
            "success"
        );
    }

    /* =====================================================
       SETTINGS MODAL
    ===================================================== */

    function createSettingsModal() {

        if (
            document.getElementById(
                "taskflowSettingsModal"
            )
        ) {
            return;
        }

        const currentTheme =
            storage.getSetting(
                "theme",
                "dark"
            );

        const modal =
            document.createElement("div");

        modal.id =
            "taskflowSettingsModal";

        modal.className =
            "taskflow-settings-modal";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        modal.innerHTML = `

            <div
                class="taskflow-settings-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="taskflowSettingsTitle"
            >

                <div class="taskflow-settings-header">

                    <div>
                        <h2
                            id="taskflowSettingsTitle"
                            class="taskflow-settings-title"
                        >
                            Settings
                        </h2>

                        <p class="taskflow-settings-subtitle">
                            Customize your TaskFlow experience.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="taskflow-settings-close"
                        id="taskflowSettingsClose"
                        aria-label="Close settings"
                    >
                        ${icons.close}
                    </button>

                </div>

                <div class="taskflow-settings-body">

                    <section class="taskflow-settings-section">

                        <div class="taskflow-settings-row">

                            <div>
                                <div class="taskflow-settings-label">
                                    Appearance
                                </div>

                                <div class="taskflow-settings-description">
                                    Switch between dark and light mode.
                                </div>
                            </div>

                            <label
                                class="taskflow-theme-switch"
                                title="Toggle theme"
                            >
                                <input
                                    type="checkbox"
                                    id="taskflowSettingsTheme"
                                    ${
                                        currentTheme === "light"
                                            ? "checked"
                                            : ""
                                    }
                                >

                                <span
                                    class="taskflow-theme-slider"
                                ></span>
                            </label>

                        </div>

                    </section>

                    <section class="taskflow-settings-section">

                        <div class="taskflow-settings-label">
                            Clear completed tasks
                        </div>

                        <div class="taskflow-settings-description">
                            Remove every task that has already been completed.
                        </div>

                        <button
                            type="button"
                            class="taskflow-settings-button"
                            id="taskflowClearCompleted"
                        >
                            Clear Completed
                        </button>

                    </section>

                    <section class="taskflow-settings-section">

                        <div class="taskflow-settings-label">
                            Reset TaskFlow
                        </div>

                        <div class="taskflow-settings-description">
                            Delete all tasks and start fresh.
                        </div>

                        <button
                            type="button"
                            class="taskflow-settings-button danger"
                            id="taskflowResetApp"
                        >
                            Reset All Tasks
                        </button>

                    </section>

                    <div class="taskflow-settings-footer">
                        TaskFlow — Smart To-Do
                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const closeButton =
            document.getElementById(
                "taskflowSettingsClose"
            );

        const themeToggle =
            document.getElementById(
                "taskflowSettingsTheme"
            );

        const clearCompleted =
            document.getElementById(
                "taskflowClearCompleted"
            );

        const resetApp =
            document.getElementById(
                "taskflowResetApp"
            );

        closeButton?.addEventListener(
            "click",
            closeSettings
        );

        themeToggle?.addEventListener(
            "change",
            () => {

                const theme =
                    themeToggle.checked
                        ? "light"
                        : "dark";

                storage.updateSetting(
                    "theme",
                    theme
                );

                applyTheme(theme);

                showToast(
                    theme === "light"
                        ? "Light mode enabled."
                        : "Dark mode enabled.",
                    "success"
                );
            }
        );

        clearCompleted?.addEventListener(
            "click",
            () => {

                const result =
                    tasks.clearCompleted();

                if (isSuccessful(result)) {

                    renderAll();

                    showToast(
                        "Completed tasks cleared.",
                        "success"
                    );
                }
            }
        );

        resetApp?.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to delete ALL tasks?"
                    );

                if (!confirmed) {
                    return;
                }

                tasks.reset();

                renderAll();

                closeSettings();

                showToast(
                    "TaskFlow has been reset.",
                    "success"
                );
            }
        );

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeSettings();
                }
            }
        );
    }

    function openSettings() {

        createSettingsModal();

        const modal =
            document.getElementById(
                "taskflowSettingsModal"
            );

        if (!modal) return;

        modal.classList.add(
            "is-open"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }

    function closeSettings() {

        const modal =
            document.getElementById(
                "taskflowSettingsModal"
            );

        if (!modal) return;

        modal.classList.remove(
            "is-open"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }

    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        if (!el.toastContainer) {
            console.log(
                `[TaskFlow] ${message}`
            );
            return;
        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast toast--${type}`;

        toast.innerHTML = `

            <span class="toast__message">
                ${utils.escapeHTML(message)}
            </span>

            <button
                type="button"
                class="toast__close"
                aria-label="Close notification"
            >
                ${icons.close}
            </button>

        `;

        el.toastContainer.appendChild(
            toast
        );

        const close =
            () => {

                if (
                    !toast.isConnected
                ) {
                    return;
                }

                toast.classList.add(
                    "is-removing"
                );

                setTimeout(
                    () => toast.remove(),
                    250
                );
            };

        toast
            .querySelector(".toast__close")
            ?.addEventListener(
                "click",
                close
            );

        setTimeout(
            close,
            3000
        );
    }

    /* =====================================================
       RENDER ALL
    ===================================================== */

    function renderAll() {

        renderTasks();

        renderStats();

        updateFilters();
    }

    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (!el.sidebar) return;

        /* Mobile */

        if (
            window.innerWidth <= 820
        ) {

            el.sidebar.classList.add(
                "sidebar--open"
            );

            el.sidebarOverlay?.classList.add(
                "sidebar-overlay--visible"
            );

        } else {

            /* Desktop */

            document.body.classList.remove(
                "taskflow-sidebar-collapsed"
            );
        }

        if (el.menuButton) {

            el.menuButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }

    function closeSidebar() {

        if (!el.sidebar) return;

        /* Mobile */

        if (
            window.innerWidth <= 820
        ) {

            el.sidebar.classList.remove(
                "sidebar--open"
            );

            el.sidebarOverlay?.classList.remove(
                "sidebar-overlay--visible"
            );

        } else {

            /* Desktop */

            document.body.classList.add(
                "taskflow-sidebar-collapsed"
            );
        }

        if (el.menuButton) {

            el.menuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }

    function toggleSidebar() {

        if (!el.sidebar) return;

        if (
            window.innerWidth <= 820
        ) {

            const open =
                el.sidebar.classList.contains(
                    "sidebar--open"
                );

            if (open) {
                closeSidebar();
            } else {
                openSidebar();
            }

            return;
        }

        const collapsed =
            document.body.classList.contains(
                "taskflow-sidebar-collapsed"
            );

        if (collapsed) {
            openSidebar();
        } else {
            closeSidebar();
        }
    }

    /* =====================================================
       EVENTS
    ===================================================== */

    function bindEvents() {

        /* Add task */

        el.addTaskButton?.addEventListener(
            "click",
            () => openTaskModal()
        );

        el.emptyAddTaskButton?.addEventListener(
            "click",
            () => openTaskModal()
        );

        /* Form */

        el.taskForm?.addEventListener(
            "submit",
            handleSubmit
        );

        /* Task modal */

        el.closeTaskModal?.addEventListener(
            "click",
            closeTaskModal
        );

        el.cancelTaskButton?.addEventListener(
            "click",
            closeTaskModal
        );

        el.taskModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "modal__backdrop"
                    )
                ) {
                    closeTaskModal();
                }
            }
        );

        /* Tasks */

        el.taskList?.addEventListener(
            "click",
            handleTaskAction
        );

        /* Search */

        el.searchInput?.addEventListener(
            "input",
            utils.debounce(
                handleSearch,
                100
            )
        );

        el.clearSearchButton?.addEventListener(
            "click",
            clearSearch
        );

        el.focusSearchButton?.addEventListener(
            "click",
            () => {

                el.searchInput?.focus();

                el.searchInput?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        );

        /* Filters */

        el.filterButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const filter =
                            button.dataset.filter;

                        if (!filter) return;

                        tasks.setFilter(filter);

                        updateFilters();

                        renderTasks();

                        el.navItems.forEach(item => {

                            const itemView =
                                item.dataset.view ||
                                item.dataset.filter;

                            item.classList.toggle(
                                "nav-item--active",
                                itemView === filter
                            );

                            item.classList.toggle(
                                "active",
                                itemView === filter
                            );
                        });
                    }
                );
            }
        );

        /* Sidebar navigation */

        el.navItems.forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        const view =
                            item.dataset.view ||
                            item.dataset.filter;

                        const action =
                            item.dataset.action;

                        if (
                            action === "settings"
                        ) {

                            event.preventDefault();

                            openSettings();

                            closeSidebar();

                            return;
                        }

                        if (
                            view &&
                            [
                                "all",
                                "today",
                                "upcoming",
                                "completed"
                            ].includes(view)
                        ) {

                            event.preventDefault();

                            setView(view);

                            closeSidebar();
                        }
                    }
                );
            }
        );

        /* Settings direct button */

        el.settingsButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openSettings();

                closeSidebar();
            }
        );

        /* Hamburger */

        el.menuButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                toggleSidebar();
            }
        );

        /* Sidebar close */

        el.sidebarClose?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeSidebar();
            }
        );

        /* Overlay */

        el.sidebarOverlay?.addEventListener(
            "click",
            closeSidebar
        );

        /* Sort */

        el.sortButton?.addEventListener(
            "click",
            toggleSortMenu
        );

        el.sortMenu?.addEventListener(
            "click",
            event => {

                const option =
                    event.target.closest(
                        "[data-sort]"
                    );

                if (!option) return;

                selectSort(
                    option.dataset.sort
                );
            }
        );

        /* Theme top button */

        el.themeButton?.addEventListener(
            "click",
            toggleTheme
        );

        /* Delete */

        el.cancelDeleteButton?.addEventListener(
            "click",
            closeDeleteModal
        );

        el.confirmDeleteButton?.addEventListener(
            "click",
            deleteTask
        );

        el.confirmModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "modal__backdrop"
                    )
                ) {
                    closeDeleteModal();
                }
            }
        );

        /* Global keyboard */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !== "Escape"
                ) {
                    return;
                }

                closeTaskModal();

                closeDeleteModal();

                closeSettings();

                closeSortMenu();

                closeSidebar();
            }
        );

        /* Outside sort */

        document.addEventListener(
            "click",
            event => {

                if (
                    !el.sortMenu ||
                    !el.sortButton
                ) {
                    return;
                }

                if (
                    !el.sortMenu.contains(
                        event.target
                    ) &&
                    !el.sortButton.contains(
                        event.target
                    )
                ) {

                    closeSortMenu();
                }
            }
        );

        /* Window resize */

        window.addEventListener(
            "resize",
            utils.debounce(
                () => {

                    if (
                        window.innerWidth > 820
                    ) {

                        el.sidebar?.classList.remove(
                            "sidebar--open"
                        );

                        el.sidebarOverlay?.classList.remove(
                            "sidebar-overlay--visible"
                        );
                    }
                },
                150
            )
        );
    }

    /* =====================================================
       INIT
    ===================================================== */

    function initialize() {

        injectUIStyles();

        applyTheme(
            storage.getSetting(
                "theme",
                "dark"
            )
        );

        bindEvents();

        renderAll();

        console.log(
            "[TaskFlow] UI initialized successfully."
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.TaskFlowUI = Object.freeze({

        initialize,

        renderAll,

        renderTasks,

        renderStats,

        openTaskModal,

        closeTaskModal,

        openSettings,

        closeSettings,

        showToast,

        openSidebar,

        closeSidebar,

        toggleSidebar
    });

})();