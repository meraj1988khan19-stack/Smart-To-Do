(function () {
    "use strict";

    const storage = window.TaskFlowStorage;
    const tasks = window.TaskFlowTasks;
    const ui = window.TaskFlowUI;

    /* =====================================================
       APP CONFIG
    ===================================================== */

    const APP_NAME = "TaskFlow";
    const APP_VERSION = "1.0.0";


    /* =====================================================
       LOGGER
    ===================================================== */

    function log(message, data = null) {
        if (data !== null) {
            console.log(`[${APP_NAME}] ${message}`, data);
        } else {
            console.log(`[${APP_NAME}] ${message}`);
        }
    }


    function error(message, err = null) {
        if (err) {
            console.error(`[${APP_NAME}] ${message}`, err);
        } else {
            console.error(`[${APP_NAME}] ${message}`);
        }
    }


    /* =====================================================
       STARTUP CHECK
    ===================================================== */

    function checkDependencies() {

        const missing = [];

        if (!storage) {
            missing.push("TaskFlowStorage");
        }

        if (!tasks) {
            missing.push("TaskFlowTasks");
        }

        if (!ui) {
            missing.push("TaskFlowUI");
        }

        if (missing.length > 0) {

            error(
                "Missing required modules:",
                missing
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       INITIALIZE DATA
    ===================================================== */

    function initializeData() {

        try {

            if (typeof tasks.initialize === "function") {
                tasks.initialize();
            }

            log("Task data initialized successfully.");

            return true;

        } catch (err) {

            error(
                "Failed to initialize task data.",
                err
            );

            return false;
        }
    }


    /* =====================================================
       INITIALIZE UI
    ===================================================== */

    function initializeUI() {

        try {

            if (
                typeof ui.initialize !== "function"
            ) {

                error(
                    "UI initialize() function not found."
                );

                return false;
            }


            ui.initialize();

            log(
                "UI initialized successfully."
            );

            return true;

        } catch (err) {

            error(
                "Failed to initialize UI.",
                err
            );

            return false;
        }
    }


    /* =====================================================
       GLOBAL ERROR HANDLING
    ===================================================== */

    function setupErrorHandling() {

        window.addEventListener(
            "error",
            event => {

                console.error(
                    `[${APP_NAME}] Runtime error:`,
                    event.error || event.message
                );
            }
        );


        window.addEventListener(
            "unhandledrejection",
            event => {

                console.error(
                    `[${APP_NAME}] Promise error:`,
                    event.reason
                );
            }
        );
    }


    /* =====================================================
       PAGE VISIBILITY
    ===================================================== */

    function setupVisibilityHandling() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    try {

                        if (
                            typeof ui.renderAll ===
                            "function"
                        ) {
                            ui.renderAll();
                        }

                    } catch (err) {

                        error(
                            "Failed to refresh UI.",
                            err
                        );
                    }
                }
            }
        );
    }


    /* =====================================================
       STORAGE STATUS
    ===================================================== */

    function checkStorage() {

        try {

            if (
                typeof storage.isAvailable ===
                "function"
            ) {

                const available =
                    storage.isAvailable();


                if (!available) {

                    console.warn(
                        `[${APP_NAME}] localStorage is unavailable.`
                    );

                    return false;
                }
            }

            return true;

        } catch (err) {

            error(
                "Storage check failed.",
                err
            );

            return false;
        }
    }


    /* =====================================================
       APP INITIALIZATION
    ===================================================== */

    function initializeApp() {

        log(
            `${APP_NAME} UI v${APP_VERSION}`
        );


        /* Check modules */

        if (!checkDependencies()) {
            return;
        }


        /* Global errors */

        setupErrorHandling();


        /* Storage */

        checkStorage();


        /* Data */

        const dataReady =
            initializeData();


        if (!dataReady) {

            error(
                "Application stopped because data initialization failed."
            );

            return;
        }


        /* UI */

        const uiReady =
            initializeUI();


        if (!uiReady) {

            error(
                "Application stopped because UI initialization failed."
            );

            return;
        }


        /* Visibility refresh */

        setupVisibilityHandling();


        log(
            "Application initialized successfully."
        );
    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeApp,
            {
                once: true
            }
        );

    } else {

        initializeApp();
    }


    /* =====================================================
       PUBLIC
    ===================================================== */

    window.TaskFlowApp = Object.freeze({

        version: APP_VERSION,

        initialize:
            initializeApp
    });

})();