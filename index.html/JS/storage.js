/* =========================================================
   TASKFLOW — LOCAL STORAGE
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "taskflow_tasks_v1";
    const SETTINGS_KEY = "taskflow_settings_v1";

    const {
        safeJsonParse,
        cloneData,
        canUseLocalStorage,
        handleError
    } = window.TaskFlowUtils;


    /* =====================================================
       01. DEFAULT DATA
       ===================================================== */

    const DEFAULT_TASKS = [];

    const DEFAULT_SETTINGS = {
        theme: "dark",
        filter: "all",
        sort: "created-desc"
    };


    /* =====================================================
       02. STORAGE AVAILABILITY
       ===================================================== */

    function isAvailable() {
        return canUseLocalStorage();
    }


    /* =====================================================
       03. INTERNAL READ
       ===================================================== */

    function read(key, fallback) {
        if (!isAvailable()) {
            return cloneData(fallback);
        }

        try {
            const raw = localStorage.getItem(key);

            if (!raw) {
                return cloneData(fallback);
            }

            const parsed = safeJsonParse(raw, null);

            if (parsed === null) {
                return cloneData(fallback);
            }

            return parsed;
        } catch (error) {
            handleError(error, "Storage Read");

            return cloneData(fallback);
        }
    }


    /* =====================================================
       04. INTERNAL WRITE
       ===================================================== */

    function write(key, value) {
        if (!isAvailable()) {
            return false;
        }

        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;
        } catch (error) {
            handleError(error, "Storage Write");

            return false;
        }
    }


    /* =====================================================
       05. INTERNAL REMOVE
       ===================================================== */

    function remove(key) {
        if (!isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(key);

            return true;
        } catch (error) {
            handleError(error, "Storage Remove");

            return false;
        }
    }


    /* =====================================================
       06. TASKS — LOAD
       ===================================================== */

    function loadTasks() {
        const tasks = read(
            STORAGE_KEY,
            DEFAULT_TASKS
        );

        if (!Array.isArray(tasks)) {
            return [];
        }

        return cloneData(tasks);
    }


    /* =====================================================
       07. TASKS — SAVE
       ===================================================== */

    function saveTasks(tasks) {
        if (!Array.isArray(tasks)) {
            return false;
        }

        return write(
            STORAGE_KEY,
            cloneData(tasks)
        );
    }


    /* =====================================================
       08. TASKS — CLEAR
       ===================================================== */

    function clearTasks() {
        return remove(STORAGE_KEY);
    }


    /* =====================================================
       09. SETTINGS — LOAD
       ===================================================== */

    function loadSettings() {
        const settings = read(
            SETTINGS_KEY,
            DEFAULT_SETTINGS
        );

        if (
            !settings ||
            typeof settings !== "object" ||
            Array.isArray(settings)
        ) {
            return cloneData(DEFAULT_SETTINGS);
        }

        return {
            ...cloneData(DEFAULT_SETTINGS),
            ...settings
        };
    }


    /* =====================================================
       10. SETTINGS — SAVE
       ===================================================== */

    function saveSettings(settings) {
        if (
            !settings ||
            typeof settings !== "object" ||
            Array.isArray(settings)
        ) {
            return false;
        }

        const currentSettings = loadSettings();

        const mergedSettings = {
            ...currentSettings,
            ...settings
        };

        return write(
            SETTINGS_KEY,
            mergedSettings
        );
    }


    /* =====================================================
       11. SETTINGS — UPDATE ONE VALUE
       ===================================================== */

    function updateSetting(key, value) {
        if (!key) {
            return false;
        }

        const settings = loadSettings();

        settings[key] = value;

        return saveSettings(settings);
    }


    /* =====================================================
       12. SETTINGS — GET ONE VALUE
       ===================================================== */

    function getSetting(key, fallback = null) {
        const settings = loadSettings();

        if (
            Object.prototype.hasOwnProperty.call(
                settings,
                key
            )
        ) {
            return settings[key];
        }

        return fallback;
    }


    /* =====================================================
       13. SETTINGS — RESET
       ===================================================== */

    function resetSettings() {
        return write(
            SETTINGS_KEY,
            cloneData(DEFAULT_SETTINGS)
        );
    }


    /* =====================================================
       14. ALL APP DATA — EXPORT
       ===================================================== */

    function exportData() {
        return {
            version: 1,

            exportedAt:
                new Date().toISOString(),

            tasks: loadTasks(),

            settings: loadSettings()
        };
    }


    /* =====================================================
       15. ALL APP DATA — IMPORT
       ===================================================== */

    function importData(data) {
        if (
            !data ||
            typeof data !== "object"
        ) {
            return {
                success: false,
                reason: "invalid-data"
            };
        }

        let tasksImported = false;
        let settingsImported = false;

        if (Array.isArray(data.tasks)) {
            tasksImported = saveTasks(data.tasks);
        }

        if (
            data.settings &&
            typeof data.settings === "object" &&
            !Array.isArray(data.settings)
        ) {
            settingsImported =
                saveSettings(data.settings);
        }

        return {
            success:
                tasksImported ||
                settingsImported,

            tasksImported,
            settingsImported
        };
    }


    /* =====================================================
       16. CLEAR EVERYTHING
       ===================================================== */

    function clearAll() {
        const tasksCleared = clearTasks();
        const settingsCleared =
            remove(SETTINGS_KEY);

        return (
            tasksCleared &&
            settingsCleared
        );
    }


    /* =====================================================
       17. STORAGE SIZE
       ===================================================== */

    function getStorageSize() {
        if (!isAvailable()) {
            return 0;
        }

        try {
            let totalSize = 0;

            for (
                let index = 0;
                index < localStorage.length;
                index++
            ) {
                const key =
                    localStorage.key(index);

                if (!key) {
                    continue;
                }

                const value =
                    localStorage.getItem(key);

                totalSize +=
                    key.length +
                    (value ? value.length : 0);
            }

            return totalSize;
        } catch (error) {
            handleError(
                error,
                "Storage Size"
            );

            return 0;
        }
    }


    /* =====================================================
       18. STORAGE STATUS
       ===================================================== */

    function getStatus() {
        return {
            available: isAvailable(),
            taskCount: loadTasks().length,
            storageSize: getStorageSize()
        };
    }


    /* =====================================================
       19. PUBLIC API
       ===================================================== */

    window.TaskFlowStorage = Object.freeze({

        STORAGE_KEY,
        SETTINGS_KEY,

        DEFAULT_TASKS,
        DEFAULT_SETTINGS,

        isAvailable,

        loadTasks,
        saveTasks,
        clearTasks,

        loadSettings,
        saveSettings,
        updateSetting,
        getSetting,
        resetSettings,

        exportData,
        importData,

        clearAll,

        getStorageSize,
        getStatus
    });

})();