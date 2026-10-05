// ==========================================
// YOUR RATION — FIREBASE AUTHENTICATION
// ==========================================

const FIREBASE_SDK = "12.19.0";

let auth = null;
let firebaseReady = false;
let firebaseLoadError = null;
let firebaseModules = null;

// ------------------------------------------
// PUBLIC UI ENTRY
// ------------------------------------------

function openAuth() {
    let modal = document.getElementById("authModal");

    if (!modal) {
        createAuthModal();
        modal = document.getElementById("authModal");
    }

    modal.classList.add("open");
    showLoginMode();

    if (firebaseLoadError) {
        setAuthMessage(
            "Authentication could not start. Please refresh the page and try again.",
            "error"
        );
    }
}

function closeAuth() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.remove("open");
}

// ------------------------------------------
// AUTH MODAL
// ------------------------------------------

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
                <input
                    type="email"
                    id="loginEmail"
                    placeholder="Enter your email"
                    autocomplete="email"
                    required
                >

                <label for="loginPassword">Password</label>
                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    minlength="6"
                    required
                >

                <button class="auth-main-button" type="submit">
                    Sign In
                </button>

                <button class="auth-forgot" id="forgotPassword" type="button">
                    Forgot password?
                </button>
            </form>

            <form id="signupForm" class="hidden">
                <label for="signupName">Name</label>
                <input
                    type="text"
                    id="signupName"
                    placeholder="Your name"
                    autocomplete="name"
                    maxlength="80"
                    required
                >

                <label for="signupEmail">Email</label>
                <input
                    type="email"
                    id="signupEmail"
                    placeholder="Enter your email"
                    autocomplete="email"
                    required
                >

                <label for="signupPassword">Password</label>
                <input
                    type="password"
                    id="signupPassword"
                    placeholder="Create a password"
                    autocomplete="new-password"
                    minlength="6"
                    required
                >

                <button class="auth-main-button" type="submit">
                    Create Account
                </button>
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

    document.getElementById("authClose").addEventListener("click", closeAuth);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeAuth();
    });

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("signupForm").addEventListener("submit", handleSignup);
    document.getElementById("googleLogin").addEventListener("click", handleGoogleLogin);
    document.getElementById("forgotPassword").addEventListener("click", handleForgotPassword);
    document.getElementById("authSwitch").addEventListener("click", toggleAuthMode);
}

// ------------------------------------------
// FIREBASE LOADING
// ------------------------------------------

async function loadFirebase() {
    if (firebaseReady) return true;

    try {
        const appModule = await import(
            `https://www.gstatic.com/firebasejs/${FIREBASE_SDK}/firebase-app.js`
        );

        const authModule = await import(
            `https://www.gstatic.com/firebasejs/${FIREBASE_SDK}/firebase-auth.js`
        );

        const configModule = await import("./firebase.js");

        const firebaseApp = appModule.initializeApp(configModule.firebaseConfig);

        auth = authModule.getAuth(firebaseApp);
        firebaseModules = authModule;
        firebaseReady = true;

        authModule.onAuthStateChanged(auth, updateAccountUI);

        return true;
    } catch (error) {
        firebaseLoadError = error;
        console.error("Your Ration Firebase initialization failed:", error);
        setAuthMessage(
            "Firebase could not be loaded. Check the browser console for the exact error.",
            "error"
        );
        return false;
    }
}

// ------------------------------------------
// LOGIN
// ------------------------------------------

async function handleLogin(event) {
    event.preventDefault();

    if (!(await loadFirebase())) return;

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    setAuthMessage("Signing in...", "normal");

    try {
        const result = await firebaseModules.signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = result.user;

        if (!user.emailVerified) {
            setAuthMessage(
                "Your email is not verified yet. We sent another verification email.",
                "error"
            );

            try {
                await firebaseModules.sendEmailVerification(user);
            } catch (_) {}

            return;
        }

        setAuthMessage("Login successful.", "success");

        setTimeout(closeAuth, 700);
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

// ------------------------------------------
// SIGN UP
// ------------------------------------------

async function handleSignup(event) {
    event.preventDefault();

    if (!(await loadFirebase())) return;

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    setAuthMessage("Creating your account...", "normal");

    try {
        const result = await firebaseModules.createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = result.user;

        localStorage.setItem("yourRationUserName", name);

        if (name) {
            await firebaseModules.updateProfile(user, {
                displayName: name
            });
        }

        await firebaseModules.sendEmailVerification(user);

        setAuthMessage(
            "Account created. Check your email and verify your address before signing in.",
            "success"
        );

        document.getElementById("signupForm").reset();
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

// ------------------------------------------
// GOOGLE LOGIN
// ------------------------------------------

async function handleGoogleLogin() {
    if (!(await loadFirebase())) return;

    setAuthMessage("Opening Google sign-in...", "normal");

    try {
        const provider = new firebaseModules.GoogleAuthProvider();
        const result = await firebaseModules.signInWithPopup(auth, provider);

        if (result.user) {
            setAuthMessage("Google sign-in successful.", "success");
            setTimeout(closeAuth, 700);
        }
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

// ------------------------------------------
// PASSWORD RESET
// ------------------------------------------

async function handleForgotPassword() {
    if (!(await loadFirebase())) return;

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {
        setAuthMessage("Enter your email first, then choose Forgot password.", "error");
        document.getElementById("loginEmail").focus();
        return;
    }

    setAuthMessage("Sending password reset email...", "normal");

    try {
        await firebaseModules.sendPasswordResetEmail(auth, email);
        setAuthMessage(
            "Password reset email sent. Check your inbox.",
            "success"
        );
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

// ------------------------------------------
// LOGOUT
// ------------------------------------------

async function logoutUser() {
    if (!(await loadFirebase())) return;

    try {
        await firebaseModules.signOut(auth);
        showToastSafe("You have been signed out.");
        updateAccountUI(null);
    } catch (error) {
        console.error(error);
    }
}

// ------------------------------------------
// ACCOUNT BUTTON
// ------------------------------------------

function updateAccountUI(user) {
    const accountButton = document.querySelector(".header-action");
    if (!accountButton) return;

    if (user) {
        accountButton.textContent = "✓";
        accountButton.title = user.displayName || user.email || "Your Account";
        accountButton.setAttribute("aria-label", "Your account");

        accountButton.onclick = () => {
            const name =
                user.displayName ||
                localStorage.getItem("yourRationUserName") ||
                "Your Account";

            const shouldLogout = confirm(
                `${name}\n\nSigned in as:\n${user.email}\n\nPress OK to sign out.`
            );

            if (shouldLogout) logoutUser();
        };
    } else {
        accountButton.textContent = "👤";
        accountButton.title = "Sign in";
        accountButton.setAttribute("aria-label", "Sign in");
        accountButton.onclick = openAuth;
    }
}

// ------------------------------------------
// LOGIN / SIGNUP SWITCH
// ------------------------------------------

function toggleAuthMode() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const title = document.getElementById("authTitle");
    const subtitle = document.getElementById("authSubtitle");
    const switchButton = document.getElementById("authSwitch");

    const signupVisible = !signupForm.classList.contains("hidden");

    if (signupVisible) {
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        title.textContent = "Welcome back";
        subtitle.textContent = "Sign in to continue shopping.";
        switchButton.textContent = "Create a new account";
    } else {
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        title.textContent = "Create your account";
        subtitle.textContent = "Join Your Ration and start shopping.";
        switchButton.textContent = "Already have an account? Sign in";
    }

    setAuthMessage("", "normal");
}

function showLoginMode() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (!loginForm || !signupForm) return;

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    document.getElementById("authTitle").textContent = "Welcome back";
    document.getElementById("authSubtitle").textContent =
        "Sign in to continue shopping.";
    document.getElementById("authSwitch").textContent =
        "Create a new account";

    setAuthMessage("", "normal");
}

// ------------------------------------------
// HELPERS
// ------------------------------------------

function setAuthMessage(message, type) {
    const element = document.getElementById("authMessage");
    if (!element) return;

    element.textContent = message;
    element.className = `auth-message ${type || "normal"}`;
}

function showToastSafe(message) {
    if (typeof window.showToast === "function") {
        window.showToast(message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = "ration-toast show";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
}

function getFirebaseError(error) {
    const code = error?.code || "";

    const messages = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/popup-blocked": "Your browser blocked the Google sign-in window.",
        "auth/popup-operation-not-supported-in-this-environment":
            "Google popup sign-in is not supported here. Try another browser.",
        "auth/unauthorized-domain":
            "This website domain is not authorized in Firebase Authentication.",
        "auth/network-request-failed":
            "Network error. Check your internet connection.",
        "auth/operation-not-allowed":
            "This sign-in method is not enabled in Firebase Authentication.",
        "auth/invalid-api-key":
            "The Firebase API key is invalid. Check Firebase project configuration."
    };

    return messages[code] || error?.message || "Something went wrong. Please try again.";
}

// ------------------------------------------
// STARTUP
// ------------------------------------------

// Attach the account button immediately so it works even while Firebase loads.
document.addEventListener("DOMContentLoaded", () => {
    updateAccountUI(null);

    // Load Firebase in the background.
    loadFirebase().catch(error => {
        console.error("Your Ration authentication startup error:", error);
    });
});

// Also expose these for the page and future checkout/account features.
window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.logoutUser = logoutUser;
