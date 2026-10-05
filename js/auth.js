// ==========================================
// YOUR RATION — AUTHENTICATION
// Firebase Compat build — no ES modules required
// ==========================================

(function () {
    "use strict";

    let auth = null;
    let firebaseReady = false;

    function initFirebase() {
        if (firebaseReady) return true;

        if (typeof firebase === "undefined") {
            console.error("Your Ration: Firebase SDK did not load.");
            return false;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.yourRationFirebaseConfig);
            }

            auth = firebase.auth();
            firebaseReady = true;

            auth.onAuthStateChanged(updateAccountUI);
            return true;
        } catch (error) {
            console.error("Your Ration Firebase error:", error);
            return false;
        }
    }

    function openAuth() {
        let modal = document.getElementById("authModal");

        if (!modal) {
            createAuthModal();
            modal = document.getElementById("authModal");
        }

        modal.classList.add("open");
        showLoginMode();
    }

    function closeAuth() {
        const modal = document.getElementById("authModal");
        if (modal) modal.classList.remove("open");
    }

    function createAuthModal() {
        const modal = document.createElement("div");
        modal.id = "authModal";
        modal.className = "auth-overlay";

        modal.innerHTML = `
            <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
                <button class="auth-close" id="authClose" type="button" aria-label="Close">×</button>

                <div class="auth-logo">YR</div>

                <h2 id="authTitle">Welcome back</h2>
                <p class="auth-subtitle" id="authSubtitle">
                    Sign in to continue shopping.
                </p>

                <form id="loginForm">
                    <label for="loginEmail">Email</label>
                    <input id="loginEmail" type="email"
                        placeholder="Enter your email"
                        autocomplete="email" required>

                    <label for="loginPassword">Password</label>
                    <input id="loginPassword" type="password"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        minlength="6" required>

                    <button class="auth-main-button" type="submit">Sign In</button>

                    <button class="auth-forgot" id="forgotPassword" type="button">
                        Forgot password?
                    </button>
                </form>

                <form id="signupForm" class="hidden">
                    <label for="signupName">Name</label>
                    <input id="signupName" type="text"
                        placeholder="Your name"
                        autocomplete="name"
                        maxlength="80" required>

                    <label for="signupEmail">Email</label>
                    <input id="signupEmail" type="email"
                        placeholder="Enter your email"
                        autocomplete="email" required>

                    <label for="signupPassword">Password</label>
                    <input id="signupPassword" type="password"
                        placeholder="Create a password"
                        autocomplete="new-password"
                        minlength="6" required>

                    <button class="auth-main-button" type="submit">Create Account</button>
                </form>

                <div class="auth-divider"><span>OR</span></div>

                <button class="google-button" id="googleLogin" type="button">
                    <span>G</span>
                    Continue with Google
                </button>

                <p class="auth-message" id="authMessage" aria-live="polite"></p>

                <button class="auth-switch" id="authSwitch" type="button">
                    Create a new account
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("authClose").onclick = closeAuth;

        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeAuth();
        });

        document.getElementById("loginForm").onsubmit = handleLogin;
        document.getElementById("signupForm").onsubmit = handleSignup;
        document.getElementById("googleLogin").onclick = handleGoogleLogin;
        document.getElementById("forgotPassword").onclick = handleForgotPassword;
        document.getElementById("authSwitch").onclick = toggleAuthMode;
    }

    function requireFirebase() {
        if (initFirebase()) return true;

        setAuthMessage(
            "Authentication service could not load. Please refresh the page.",
            "error"
        );

        return false;
    }

    async function handleLogin(event) {
        event.preventDefault();

        if (!requireFirebase()) return;

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        setAuthMessage("Signing in...", "normal");

        try {
            const result = await auth.signInWithEmailAndPassword(email, password);

            if (!result.user.emailVerified) {
                setAuthMessage(
                    "Please verify your email first. A new verification email was sent.",
                    "error"
                );

                try {
                    await result.user.sendEmailVerification();
                } catch (_) {}

                return;
            }

            setAuthMessage("Login successful.", "success");
            setTimeout(closeAuth, 700);
        } catch (error) {
            setAuthMessage(getFirebaseError(error), "error");
        }
    }

    async function handleSignup(event) {
        event.preventDefault();

        if (!requireFirebase()) return;

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        setAuthMessage("Creating your account...", "normal");

        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);

            localStorage.setItem("yourRationUserName", name);

            if (name) {
                await result.user.updateProfile({ displayName: name });
            }

            await result.user.sendEmailVerification();

            setAuthMessage(
                "Account created. Check your email and verify it before signing in.",
                "success"
            );

            document.getElementById("signupForm").reset();
        } catch (error) {
            setAuthMessage(getFirebaseError(error), "error");
        }
    }

    async function handleGoogleLogin() {
        if (!requireFirebase()) return;

        setAuthMessage("Opening Google sign-in...", "normal");

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);

            if (result.user) {
                setAuthMessage("Google sign-in successful.", "success");
                setTimeout(closeAuth, 700);
            }
        } catch (error) {
            setAuthMessage(getFirebaseError(error), "error");
        }
    }

    async function handleForgotPassword() {
        if (!requireFirebase()) return;

        const email = document.getElementById("loginEmail").value.trim();

        if (!email) {
            setAuthMessage("Enter your email first.", "error");
            document.getElementById("loginEmail").focus();
            return;
        }

        setAuthMessage("Sending reset email...", "normal");

        try {
            await auth.sendPasswordResetEmail(email);
            setAuthMessage("Password reset email sent.", "success");
        } catch (error) {
            setAuthMessage(getFirebaseError(error), "error");
        }
    }

    async function logoutUser() {
        if (!requireFirebase()) return;

        try {
            await auth.signOut();
            updateAccountUI(null);

            if (typeof window.showToast === "function") {
                window.showToast("You have been signed out.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    function updateAccountUI(user) {
        const button = document.querySelector(".header-action");
        if (!button) return;

        button.type = "button";
        button.style.cursor = "pointer";

        if (user) {
            button.textContent = "✓";
            button.title = user.displayName || user.email || "Account";
            button.setAttribute("aria-label", "Your account");

            button.onclick = function () {
                const name =
                    user.displayName ||
                    localStorage.getItem("yourRationUserName") ||
                    "Your Account";

                if (confirm(
                    name +
                    "\n\nSigned in as:\n" +
                    user.email +
                    "\n\nPress OK to sign out."
                )) {
                    logoutUser();
                }
            };
        } else {
            button.textContent = "👤";
            button.title = "Sign in";
            button.setAttribute("aria-label", "Sign in");
            button.onclick = openAuth;
        }
    }

    function toggleAuthMode() {
        const login = document.getElementById("loginForm");
        const signup = document.getElementById("signupForm");
        const title = document.getElementById("authTitle");
        const subtitle = document.getElementById("authSubtitle");
        const switchButton = document.getElementById("authSwitch");

        const signupVisible = !signup.classList.contains("hidden");

        if (signupVisible) {
            signup.classList.add("hidden");
            login.classList.remove("hidden");
            title.textContent = "Welcome back";
            subtitle.textContent = "Sign in to continue shopping.";
            switchButton.textContent = "Create a new account";
        } else {
            login.classList.add("hidden");
            signup.classList.remove("hidden");
            title.textContent = "Create your account";
            subtitle.textContent = "Join Your Ration and start shopping.";
            switchButton.textContent = "Already have an account? Sign in";
        }

        setAuthMessage("", "normal");
    }

    function showLoginMode() {
        const login = document.getElementById("loginForm");
        const signup = document.getElementById("signupForm");

        if (!login || !signup) return;

        login.classList.remove("hidden");
        signup.classList.add("hidden");

        document.getElementById("authTitle").textContent = "Welcome back";
        document.getElementById("authSubtitle").textContent =
            "Sign in to continue shopping.";
        document.getElementById("authSwitch").textContent =
            "Create a new account";

        setAuthMessage("", "normal");
    }

    function setAuthMessage(message, type) {
        const element = document.getElementById("authMessage");
        if (!element) return;

        element.textContent = message;
        element.className = "auth-message " + (type || "normal");
    }

    function getFirebaseError(error) {
        const code = error && error.code ? error.code : "";

        const messages = {
            "auth/invalid-credential": "Email or password is incorrect.",
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/email-already-in-use": "An account with this email already exists.",
            "auth/weak-password": "Password should be at least 6 characters.",
            "auth/user-disabled": "This account has been disabled.",
            "auth/too-many-requests": "Too many attempts. Please wait and try again.",
            "auth/popup-closed-by-user": "Google sign-in was cancelled.",
            "auth/popup-blocked": "Your browser blocked the Google sign-in window.",
            "auth/unauthorized-domain":
                "This website domain is not authorized in Firebase.",
            "auth/network-request-failed":
                "Network error. Check your internet connection.",
            "auth/operation-not-allowed":
                "This sign-in method is not enabled in Firebase."
        };

        return messages[code] ||
            (error && error.message) ||
            "Something went wrong. Please try again.";
    }

    // Bind the account button as soon as this file executes.
    function bootAuth() {
        updateAccountUI(null);
        initFirebase();
    }

    window.openAuth = openAuth;
    window.closeAuth = closeAuth;
    window.logoutUser = logoutUser;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootAuth);
    } else {
        bootAuth();
    }
})();
