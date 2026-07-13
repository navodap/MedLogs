document.addEventListener("DOMContentLoaded", () => {

    // Render Lucide icons
    lucide.createIcons();

    const loginForm = document.getElementById("loginForm");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMeInput = document.getElementById("rememberMe");

    const passwordToggle = document.getElementById("passwordToggle");
    const forgotPassword = document.getElementById("forgotPassword");
    const loginButton = document.getElementById("loginButton");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const formStatus = document.getElementById("formStatus");


    /* =============================
       LOAD REMEMBERED LOGIN DETAILS
    ============================= */

    const savedUsername = localStorage.getItem("forensicUsername");

    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberMeInput.checked = true;
    }

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    passwordToggle.addEventListener("click", () => {

        const passwordIsVisible =
            passwordInput.type === "text";

        passwordInput.type =
            passwordIsVisible ? "password" : "text";

        passwordToggle.innerHTML = passwordIsVisible
            ? '<i data-lucide="eye"></i>'
            : '<i data-lucide="eye-off"></i>';

        passwordToggle.setAttribute(
            "aria-label",
            passwordIsVisible
                ? "Show password"
                : "Hide password"
        );

        lucide.createIcons();

    });


    /* =============================
       CLEAR ERRORS WHILE TYPING
    ============================= */

    usernameInput.addEventListener("input", () => {
        clearInputError(usernameInput, usernameError);
    });

    passwordInput.addEventListener("input", () => {
        clearInputError(passwordInput, passwordError);
    });


    /* =============================
       FORGOT PASSWORD
    ============================= */

    forgotPassword.addEventListener("click", (event) => {
        event.preventDefault();

        showStatus(
            "Please contact the system administrator to reset your password.",
            "success"
        );
    });


    /* =============================
       FORM SUBMISSION
    ============================= */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearAllErrors();
        hideStatus();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput.checked;

        let isValid = true;


        // Username validation
        if (!username) {
            showInputError(
                usernameInput,
                usernameError,
                "Username is required."
            );

            isValid = false;
        } else if (username.length < 3) {
            showInputError(
                usernameInput,
                usernameError,
                "Username must contain at least 3 characters."
            );

            isValid = false;
        }


        // Password validation
        if (!password) {
            showInputError(
                passwordInput,
                passwordError,
                "Password is required."
            );

            isValid = false;
        } else if (password.length < 6) {
            showInputError(
                passwordInput,
                passwordError,
                "Password must contain at least 6 characters."
            );

            isValid = false;
        }


        // Role validation
        if (!isValid) {
            showStatus(
                "Please correct the highlighted fields.",
                "error"
            );

            return;
        }


        // Save login details when Remember Me is selected
        if (rememberMe) {
            localStorage.setItem("forensicUsername", username);
        } else {
            localStorage.removeItem("forensicUsername");
        }

        setLoadingState(true);

        try {

            /*
             * Replace this simulated request with your backend API.
             *
             * Example:
             *
             * const response = await fetch(
             *     "http://localhost:5000/api/auth/login",
             *     {
             *         method: "POST",
             *         headers: {
             *             "Content-Type": "application/json"
             *         },
             *         body: JSON.stringify({
             *             username,
             *             password,
             *             role
             *         })
             *     }
             * );
             *
             * const result = await response.json();
             *
             * if (!response.ok) {
             *     throw new Error(
             *         result.message || "Login failed."
             *     );
             * }
             *
             * localStorage.setItem("token", result.token);
             * window.location.href = result.redirectUrl;
             */


            // Simulated server delay
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });

            showStatus(
                `Login successful. Signing in as ${role}.`,
                "success"
            );

            console.log("Login information:", {
                username,
                role,
                rememberMe
            });

            /*
             * Example redirects based on role:
             *
             * const redirectPages = {
             *     "Consultant JMO": "jmo-dashboard.html",
             *     "Clerk": "clerk-dashboard.html",
             *     "Lab Staff": "lab-dashboard.html",
             *     "Police Officer": "police-dashboard.html",
             *     "Admin": "admin-dashboard.html"
             * };
             *
             * window.location.href = redirectPages[role];
             */

        } catch (error) {

            showStatus(
                error.message ||
                "Unable to sign in. Please try again.",
                "error"
            );

        } finally {
            setLoadingState(false);
        }

    });


    /* =============================
       HELPER FUNCTIONS
    ============================= */

    function showInputError(input, errorElement, message) {

        input.closest(".input-container")
            .classList.add("invalid");

        errorElement.textContent = message;
    }

    function clearInputError(input, errorElement) {

        input.closest(".input-container")
            .classList.remove("invalid");

        errorElement.textContent = "";
    }

    function clearAllErrors() {
        clearInputError(usernameInput, usernameError);
        clearInputError(passwordInput, passwordError);
    }

    function showStatus(message, type) {

        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
    }

    function hideStatus() {

        formStatus.textContent = "";
        formStatus.className = "form-status";
    }

    function setLoadingState(isLoading) {

        loginButton.disabled = isLoading;

        if (isLoading) {

            loginButton.innerHTML = `
                <span class="loading-spinner"></span>
                <span>Logging in...</span>
            `;

        } else {

            loginButton.innerHTML = `
                <i data-lucide="log-in"></i>
                <span>Login</span>
            `;

            lucide.createIcons();
        }
    }

});