/* =========================================================
   TASKFLOW — TASK ENGINE
   ========================================================= */

(function () {
    "use strict";

    const {
        generateId,
        cloneData,
        normalizeText,
        normalizePriority,
        getTodayISO,
        getPriorityWeight,
        compareStrings,
        compareDates
    } = window.TaskFlowUtils;

    const storage = window.TaskFlowStorage;


    /* =====================================================
       01. TASK MANAGER STATE
       ===================================================== */

    let tasks = storage.loadTasks();

    let state = {
        search: "",
        filter: "all",
        sort: storage.getSetting(
            "sort",
            "created-desc"
        )
    };


    /* =====================================================
       02. TASK NORMALIZER
       ===================================================== */

    function normalizeTask(task) {
        const now = new Date().toISOString();

        return {
            id: task.id || generateId(),

            title:
                typeof task.title === "string"
                    ? task.title.trim()
                    : "",

            description:
                typeof task.description === "string"
                    ? task.description.trim()
                    : "",

            priority:
                normalizePriority(task.priority),

            dueDate:
                typeof task.dueDate === "string"
                    ? task.dueDate
                    : "",

            completed:
                Boolean(task.completed),

            createdAt:
                task.createdAt || now,

            updatedAt:
                task.updatedAt || now,

            completedAt:
                task.completedAt || null
        };
    }


    /* =====================================================
       03. NORMALIZE ALL TASKS
       ===================================================== */

    function normalizeAllTasks() {
        tasks = tasks
            .filter(Boolean)
            .map(normalizeTask);

        persist();
    }


    /* =====================================================
       04. PERSIST
       ===================================================== */

    function persist() {
        storage.saveTasks(tasks);
    }


    /* =====================================================
       05. GET ALL TASKS
       ===================================================== */

    function getAll() {
        return cloneData(tasks);
    }


    /* =====================================================
       06. GET TASK
       ===================================================== */

    function getById(id) {
        return tasks.find(
            task => task.id === id
        ) || null;
    }


    /* =====================================================
       07. CREATE TASK
       ===================================================== */

    function create(data = {}) {
        const title =
            typeof data.title === "string"
                ? data.title.trim()
                : "";

        if (!title) {
            return {
                success: false,
                task: null,
                reason: "title-required"
            };
        }

        const now = new Date().toISOString();

        const task = normalizeTask({

            id: generateId(),

            title,

            description:
                typeof data.description === "string"
                    ? data.description.trim()
                    : "",

            priority:
                normalizePriority(data.priority),

            dueDate:
                typeof data.dueDate === "string"
                    ? data.dueDate
                    : "",

            completed: false,

            createdAt: now,

            updatedAt: now,

            completedAt: null
        });

        tasks.unshift(task);

        persist();

        return {
            success: true,
            task: cloneData(task)
        };
    }


    /* =====================================================
       08. UPDATE TASK
       ===================================================== */

    function update(id, changes = {}) {
        const index = tasks.findIndex(
            task => task.id === id
        );

        if (index === -1) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        const currentTask = tasks[index];

        const nextTitle =
            changes.title !== undefined
                ? String(changes.title).trim()
                : currentTask.title;

        if (!nextTitle) {
            return {
                success: false,
                task: null,
                reason: "title-required"
            };
        }

        const updatedTask = {
            ...currentTask,

            title: nextTitle,

            description:
                changes.description !== undefined
                    ? String(changes.description).trim()
                    : currentTask.description,

            priority:
                changes.priority !== undefined
                    ? normalizePriority(
                        changes.priority
                    )
                    : currentTask.priority,

            dueDate:
                changes.dueDate !== undefined
                    ? String(changes.dueDate)
                    : currentTask.dueDate,

            updatedAt:
                new Date().toISOString()
        };

        tasks[index] =
            normalizeTask(updatedTask);

        persist();

        return {
            success: true,
            task: cloneData(tasks[index])
        };
    }


    /* =====================================================
       09. DELETE TASK
       ===================================================== */

    function remove(id) {
        const index = tasks.findIndex(
            task => task.id === id
        );

        if (index === -1) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        const deletedTask =
            tasks[index];

        tasks.splice(index, 1);

        persist();

        return {
            success: true,
            task: cloneData(deletedTask)
        };
    }


    /* =====================================================
       10. TOGGLE COMPLETE
       ===================================================== */

    function toggleComplete(id) {
        const task = getById(id);

        if (!task) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        task.completed =
            !task.completed;

        task.updatedAt =
            new Date().toISOString();

        task.completedAt =
            task.completed
                ? task.updatedAt
                : null;

        persist();

        return {
            success: true,
            task: cloneData(task)
        };
    }


    /* =====================================================
       11. COMPLETE TASK
       ===================================================== */

    function complete(id) {
        const task = getById(id);

        if (!task) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        if (!task.completed) {
            task.completed = true;

            task.completedAt =
                new Date().toISOString();

            task.updatedAt =
                task.completedAt;

            persist();
        }

        return {
            success: true,
            task: cloneData(task)
        };
    }


    /* =====================================================
       12. UNCOMPLETE TASK
       ===================================================== */

    function uncomplete(id) {
        const task = getById(id);

        if (!task) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        task.completed = false;

        task.completedAt = null;

        task.updatedAt =
            new Date().toISOString();

        persist();

        return {
            success: true,
            task: cloneData(task)
        };
    }


    /* =====================================================
       13. SEARCH
       ===================================================== */

    function setSearch(value = "") {
        state.search =
            normalizeText(value);
    }


    /* =====================================================
       14. FILTER
       ===================================================== */

    function setFilter(filter = "all") {

        const allowedFilters = [
            "all",
            "active",
            "completed",
            "today",
            "upcoming"
        ];

        state.filter =
            allowedFilters.includes(filter)
                ? filter
                : "all";

        storage.updateSetting(
            "filter",
            state.filter
        );
    }


    /* =====================================================
       15. SORT
       ===================================================== */

    function setSort(sort = "created-desc") {

        const allowedSorts = [
            "created-desc",
            "created-asc",
            "title-asc",
            "title-desc",
            "priority-desc",
            "priority-asc",
            "due-asc",
            "due-desc"
        ];

        state.sort =
            allowedSorts.includes(sort)
                ? sort
                : "created-desc";

        storage.updateSetting(
            "sort",
            state.sort
        );
    }


    /* =====================================================
       16. SEARCH MATCH
       ===================================================== */

    function matchesSearch(task) {

        if (!state.search) {
            return true;
        }

        const searchableText = normalizeText(
            [
                task.title,
                task.description,
                task.priority,
                task.dueDate
            ].join(" ")
        );

        return searchableText.includes(
            state.search
        );
    }


    /* =====================================================
       17. FILTER MATCH
       ===================================================== */

    function matchesFilter(task) {

        switch (state.filter) {

            case "active":
                return !task.completed;

            case "completed":
                return task.completed;

            case "today":
                return (
                    task.dueDate ===
                    getTodayISO()
                );

            case "upcoming":
                return (
                    !task.completed &&
                    task.dueDate &&
                    task.dueDate >
                    getTodayISO()
                );

            case "all":
            default:
                return true;
        }
    }


    /* =====================================================
       18. SORT TASKS
       ===================================================== */

    function sortTasks(taskList) {

        const sorted =
            [...taskList];

        switch (state.sort) {

            case "created-asc":

                sorted.sort(
                    (a, b) =>
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                );

                break;


            case "created-desc":

                sorted.sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );

                break;


            case "title-asc":

                sorted.sort(
                    (a, b) =>
                        compareStrings(
                            a.title,
                            b.title
                        )
                );

                break;


            case "title-desc":

                sorted.sort(
                    (a, b) =>
                        compareStrings(
                            b.title,
                            a.title
                        )
                );

                break;


            case "priority-desc":

                sorted.sort(
                    (a, b) =>
                        getPriorityWeight(
                            b.priority
                        ) -
                        getPriorityWeight(
                            a.priority
                        )
                );

                break;


            case "priority-asc":

                sorted.sort(
                    (a, b) =>
                        getPriorityWeight(
                            a.priority
                        ) -
                        getPriorityWeight(
                            b.priority
                        )
                );

                break;


            case "due-asc":

                sorted.sort(
                    (a, b) =>
                        compareDates(
                            a.dueDate,
                            b.dueDate
                        )
                );

                break;


            case "due-desc":

                sorted.sort(
                    (a, b) =>
                        compareDates(
                            b.dueDate,
                            a.dueDate
                        )
                );

                break;
        }

        return sorted;
    }


    /* =====================================================
       19. GET VISIBLE TASKS
       ===================================================== */

    function getVisibleTasks() {

        const filtered =
            tasks.filter(task => {

                return (
                    matchesSearch(task) &&
                    matchesFilter(task)
                );

            });

        return sortTasks(filtered);
    }


    /* =====================================================
       20. STATISTICS
       ===================================================== */

    function getStats() {

        const total =
            tasks.length;

        const completed =
            tasks.filter(
                task => task.completed
            ).length;

        const pending =
            total - completed;

        const today =
            tasks.filter(
                task =>
                    task.dueDate ===
                    getTodayISO()
            ).length;

        const upcoming =
            tasks.filter(
                task =>
                    !task.completed &&
                    task.dueDate &&
                    task.dueDate >
                    getTodayISO()
            ).length;

        const overdue =
            tasks.filter(
                task =>
                    !task.completed &&
                    task.dueDate &&
                    task.dueDate <
                    getTodayISO()
            ).length;

        const progress =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                );

        return {
            total,
            completed,
            pending,
            today,
            upcoming,
            overdue,
            progress
        };
    }


    /* =====================================================
       21. CLEAR COMPLETED
       ===================================================== */

    function clearCompleted() {

        const previousCount =
            tasks.length;

        tasks =
            tasks.filter(
                task => !task.completed
            );

        const removed =
            previousCount -
            tasks.length;

        if (removed > 0) {
            persist();
        }

        return {
            success: true,
            removed
        };
    }


    /* =====================================================
       22. DUPLICATE TASK
       ===================================================== */

    function duplicate(id) {

        const original =
            getById(id);

        if (!original) {
            return {
                success: false,
                task: null,
                reason: "task-not-found"
            };
        }

        const now =
            new Date().toISOString();

        const duplicateTask =
            normalizeTask({

                ...cloneData(original),

                id: generateId(),

                title:
                    `${original.title} (Copy)`,

                completed: false,

                completedAt: null,

                createdAt: now,

                updatedAt: now
            });

        tasks.unshift(
            duplicateTask
        );

        persist();

        return {
            success: true,
            task:
                cloneData(duplicateTask)
        };
    }


    /* =====================================================
       23. REPLACE ALL TASKS
       ===================================================== */

    function replaceAll(nextTasks) {

        if (!Array.isArray(nextTasks)) {
            return false;
        }

        tasks =
            nextTasks
                .filter(Boolean)
                .map(normalizeTask);

        persist();

        return true;
    }


    /* =====================================================
       24. RESET
       ===================================================== */

    function reset() {

        tasks = [];

        persist();

        state.search = "";

        state.filter = "all";

        state.sort = "created-desc";

        storage.saveSettings({
            filter: "all",
            sort: "created-desc"
        });
    }


    /* =====================================================
       25. CURRENT STATE
       ===================================================== */

    function getState() {

        return {
            search: state.search,
            filter: state.filter,
            sort: state.sort
        };
    }


    /* =====================================================
       26. INITIALIZE
       ===================================================== */

    function initialize() {

        normalizeAllTasks();

        state.filter =
            storage.getSetting(
                "filter",
                "all"
            );

        state.sort =
            storage.getSetting(
                "sort",
                "created-desc"
            );
    }


    /* =====================================================
       27. PUBLIC API
       ===================================================== */

    window.TaskFlowTasks = Object.freeze({

        initialize,

        getAll,
        getById,

        create,
        update,
        remove,

        toggleComplete,
        complete,
        uncomplete,

        setSearch,
        setFilter,
        setSort,

        getVisibleTasks,
        getStats,
        getState,

        clearCompleted,
        duplicate,

        replaceAll,
        reset
    });


    /* =====================================================
       28. AUTO INITIALIZE
       ===================================================== */

    initialize();

})();