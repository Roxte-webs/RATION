// ==========================================
// YOUR RATION — AUTHENTICATION
// ==========================================

const FIREBASE_VERSION = "12.5.0";
let auth = null;
let firebaseAuth = null;
let firebaseStarted = false;
let firebaseError = null;

function openAuth() {
    let modal = document.getElementById("authModal");

    if (!modal) {
        createAuthModal();
        modal = document.getElementById("authModal");
    }

    modal.classList.add("open");
    showLoginMode();

    if (firebaseError) {
        setAuthMessage(
            "Authentication could not start. Please refresh the page.",
            "error"
        );
    }
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
        <div class="auth-modal" role="dialog" aria-modal="true">
            <button class="auth-close" id="authClose" type="button">×</button>
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

                <button class="auth-main-button" type="submit">
                    Sign In
                </button>

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

    document.getElementById("authClose").onclick = closeAuth;

    modal.addEventListener("click", event => {
        if (event.target === modal) closeAuth();
    });

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("signupForm").addEventListener("submit", handleSignup);
    document.getElementById("googleLogin").onclick = handleGoogleLogin;
    document.getElementById("forgotPassword").onclick = handleForgotPassword;
    document.getElementById("authSwitch").onclick = toggleAuthMode;
}

async function startFirebase() {
    if (firebaseStarted) return true;

    try {
        const appModule = await import(
            "https://www.gstatic.com/firebasejs/" +
            FIREBASE_VERSION +
            "/firebase-app.js"
        );

        const authModule = await import(
            "https://www.gstatic.com/firebasejs/" +
            FIREBASE_VERSION +
            "/firebase-auth.js"
        );

        const configModule = await import("./firebase.js");

        const app = appModule.initializeApp(configModule.firebaseConfig);

        auth = authModule.getAuth(app);
        firebaseAuth = authModule;
        firebaseStarted = true;

        authModule.onAuthStateChanged(auth, updateAccountUI);

        return true;
    } catch (error) {
        firebaseError = error;
        console.error("YOUR RATION FIREBASE ERROR:", error);
        return false;
    }
}

async function handleLogin(event) {
    event.preventDefault();

    if (!(await startFirebase())) {
        setAuthMessage("Firebase could not be loaded. Check Console.", "error");
        return;
    }

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    setAuthMessage("Signing in...", "normal");

    try {
        const result = await firebaseAuth.signInWithEmailAndPassword(
            auth, email, password
        );

        if (!result.user.emailVerified) {
            setAuthMessage(
                "Please verify your email first. A new verification email was sent.",
                "error"
            );

            try {
                await firebaseAuth.sendEmailVerification(result.user);
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

    if (!(await startFirebase())) {
        setAuthMessage("Firebase could not be loaded. Check Console.", "error");
        return;
    }

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    setAuthMessage("Creating your account...", "normal");

    try {
        const result = await firebaseAuth.createUserWithEmailAndPassword(
            auth, email, password
        );

        localStorage.setItem("yourRationUserName", name);

        if (name) {
            try {
                await firebaseAuth.updateProfile(result.user, {
                    displayName: name
                });
            } catch (_) {}
        }

        await firebaseAuth.sendEmailVerification(result.user);

        setAuthMessage(
            "Account created. Check your email and verify it.",
            "success"
        );

        document.getElementById("signupForm").reset();
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

async function handleGoogleLogin() {
    if (!(await startFirebase())) {
        setAuthMessage("Firebase could not be loaded. Check Console.", "error");
        return;
    }

    setAuthMessage("Opening Google sign-in...", "normal");

    try {
        const provider = new firebaseAuth.GoogleAuthProvider();
        const result = await firebaseAuth.signInWithPopup(auth, provider);

        if (result.user) {
            setAuthMessage("Google sign-in successful.", "success");
            setTimeout(closeAuth, 700);
        }
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

async function handleForgotPassword() {
    if (!(await startFirebase())) {
        setAuthMessage("Firebase could not be loaded. Check Console.", "error");
        return;
    }

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {
        setAuthMessage("Enter your email first.", "error");
        document.getElementById("loginEmail").focus();
        return;
    }

    setAuthMessage("Sending reset email...", "normal");

    try {
        await firebaseAuth.sendPasswordResetEmail(auth, email);
        setAuthMessage("Password reset email sent.", "success");
    } catch (error) {
        setAuthMessage(getFirebaseError(error), "error");
    }
}

async function logoutUser() {
    if (!(await startFirebase())) return;

    try {
        await firebaseAuth.signOut(auth);
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

    if (user) {
        button.textContent = "✓";
        button.title = user.displayName || user.email || "Account";
        button.onclick = () => {
            const name =
                user.displayName ||
                localStorage.getItem("yourRationUserName") ||
                "Your Account";

            if (confirm(
                name + "\n\nSigned in as:\n" +
                user.email + "\n\nPress OK to sign out."
            )) {
                logoutUser();
            }
        };
    } else {
        button.textContent = "👤";
        button.title = "Sign in";
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

// Attach the button immediately.
// This means the account icon still works even if Firebase is temporarily unavailable.
document.addEventListener("DOMContentLoaded", () => {
    updateAccountUI(null);

    startFirebase().catch(error => {
        console.error("YOUR RATION AUTH STARTUP ERROR:", error);
    });
});

window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.logoutUser = logoutUser;
