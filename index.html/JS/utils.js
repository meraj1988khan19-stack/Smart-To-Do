/* =========================================================
   TASKFLOW — UTILITY FUNCTIONS
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       01. DOM HELPERS
       ===================================================== */

    function $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }


    /* =====================================================
       02. ID GENERATOR
       ===================================================== */

    function generateId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 10)
        );
    }


    /* =====================================================
       03. DEBOUNCE
       ===================================================== */

    function debounce(callback, delay = 300) {
        let timeoutId;

        return function (...args) {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        };
    }


    /* =====================================================
       04. THROTTLE
       ===================================================== */

    function throttle(callback, limit = 100) {
        let waiting = false;

        return function (...args) {
            if (waiting) {
                return;
            }

            callback.apply(this, args);

            waiting = true;

            setTimeout(() => {
                waiting = false;
            }, limit);
        };
    }


    /* =====================================================
       05. SAFE JSON PARSE
       ===================================================== */

    function safeJsonParse(value, fallback = null) {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }


    /* =====================================================
       06. CLONE DATA
       ===================================================== */

    function cloneData(data) {
        if (typeof structuredClone === "function") {
            return structuredClone(data);
        }

        return JSON.parse(JSON.stringify(data));
    }


    /* =====================================================
       07. DATE HELPERS
       ===================================================== */

    function padNumber(number) {
        return String(number).padStart(2, "0");
    }


    function getTodayISO() {
        const date = new Date();

        const year = date.getFullYear();
        const month = padNumber(date.getMonth() + 1);
        const day = padNumber(date.getDate());

        return `${year}-${month}-${day}`;
    }


    function parseDate(dateString) {
        if (!dateString) {
            return null;
        }

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }


    function formatDate(dateString, options = {}) {
        const date = parseDate(dateString);

        if (!date) {
            return "";
        }

        const defaultOptions = {
            day: "numeric",
            month: "short",
            year: "numeric"
        };

        return new Intl.DateTimeFormat(
            options.locale || undefined,
            {
                ...defaultOptions,
                ...options
            }
        ).format(date);
    }


    function formatShortDate(dateString) {
        const date = parseDate(dateString);

        if (!date) {
            return "";
        }

        return new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short"
        }).format(date);
    }


    function isToday(dateString) {
        return dateString === getTodayISO();
    }


    function isPastDate(dateString) {
        const date = parseDate(dateString);

        if (!date) {
            return false;
        }

        const today = parseDate(getTodayISO());

        return date < today;
    }


    function isFutureDate(dateString) {
        const date = parseDate(dateString);

        if (!date) {
            return false;
        }

        const today = parseDate(getTodayISO());

        return date > today;
    }


    /* =====================================================
       08. DATE LABEL
       ===================================================== */

    function getDateLabel(dateString) {
        if (!dateString) {
            return "";
        }

        if (isToday(dateString)) {
            return "Today";
        }

        if (isPastDate(dateString)) {
            return formatShortDate(dateString);
        }

        return formatShortDate(dateString);
    }


    /* =====================================================
       09. TASK DATE STATUS
       ===================================================== */

    function getDateStatus(dateString, completed = false) {
        if (!dateString) {
            return "none";
        }

        if (completed) {
            return "completed";
        }

        if (isToday(dateString)) {
            return "today";
        }

        if (isPastDate(dateString)) {
            return "overdue";
        }

        return "upcoming";
    }


    /* =====================================================
       10. TEXT HELPERS
       ===================================================== */

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        const element = document.createElement("div");

        element.textContent = String(value);

        return element.innerHTML;
    }


    function truncateText(value, maxLength = 100) {
        if (!value) {
            return "";
        }

        const text = String(value);

        if (text.length <= maxLength) {
            return text;
        }

        return text.slice(0, maxLength).trimEnd() + "…";
    }


    function capitalize(value) {
        if (!value) {
            return "";
        }

        return (
            String(value).charAt(0).toUpperCase() +
            String(value).slice(1)
        );
    }


    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    }


    /* =====================================================
       11. PRIORITY HELPERS
       ===================================================== */

    const PRIORITY_ORDER = {
        high: 3,
        medium: 2,
        low: 1
    };


    function getPriorityWeight(priority) {
        return PRIORITY_ORDER[priority] || 0;
    }


    function normalizePriority(priority) {
        const allowed = ["low", "medium", "high"];

        return allowed.includes(priority)
            ? priority
            : "medium";
    }


    /* =====================================================
       12. SORT HELPERS
       ===================================================== */

    function compareStrings(a, b) {
        return String(a || "").localeCompare(
            String(b || ""),
            undefined,
            {
                sensitivity: "base"
            }
        );
    }


    function compareDates(a, b) {
        const dateA = parseDate(a);
        const dateB = parseDate(b);

        if (!dateA && !dateB) {
            return 0;
        }

        if (!dateA) {
            return 1;
        }

        if (!dateB) {
            return -1;
        }

        return dateA.getTime() - dateB.getTime();
    }


    /* =====================================================
       13. RANDOM HELPERS
       ===================================================== */

    function randomNumber(min, max) {
        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    }


    /* =====================================================
       14. VIEWPORT HELPERS
       ===================================================== */

    function isMobile() {
        return window.matchMedia(
            "(max-width: 820px)"
        ).matches;
    }


    function isTouchDevice() {
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        );
    }


    /* =====================================================
       15. ANIMATION FRAME
       ===================================================== */

    function nextFrame(callback) {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback);
        });
    }


    /* =====================================================
       16. SAFE CALLBACK
       ===================================================== */

    function noop() {}


    /* =====================================================
       17. STORAGE AVAILABILITY
       ===================================================== */

    function canUseLocalStorage() {
        try {
            const testKey = "__taskflow_storage_test__";

            localStorage.setItem(testKey, "1");
            localStorage.removeItem(testKey);

            return true;
        } catch {
            return false;
        }
    }


    /* =====================================================
       18. ERROR HANDLER
       ===================================================== */

    function handleError(error, context = "TaskFlow") {
        console.error(`[${context}]`, error);
    }


    /* =====================================================
       19. EXPOSE PUBLIC API
       ===================================================== */

    window.TaskFlowUtils = Object.freeze({

        // DOM
        $,
        $$,

        // IDs
        generateId,

        // Functions
        debounce,
        throttle,

        // JSON / data
        safeJsonParse,
        cloneData,

        // Dates
        padNumber,
        getTodayISO,
        parseDate,
        formatDate,
        formatShortDate,
        isToday,
        isPastDate,
        isFutureDate,
        getDateLabel,
        getDateStatus,

        // Text
        escapeHTML,
        truncateText,
        capitalize,
        normalizeText,

        // Priority
        PRIORITY_ORDER,
        getPriorityWeight,
        normalizePriority,

        // Sorting
        compareStrings,
        compareDates,

        // Random
        randomNumber,

        // Device
        isMobile,
        isTouchDevice,

        // Animation
        nextFrame,

        // Misc
        noop,
        canUseLocalStorage,
        handleError
    });

})();