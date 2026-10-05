// ==========================================
// YOUR RATION — AUTHENTICATION
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    firebaseConfig
} from "./firebase.js";


// ------------------------------------------
// FIREBASE INITIALIZATION
// ------------------------------------------

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();


// ------------------------------------------
// AUTH UI
// ------------------------------------------

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

    if (modal) {
        modal.classList.remove("open");
    }
}


// ------------------------------------------
// CREATE AUTH MODAL
// ------------------------------------------

function createAuthModal() {

    const modal = document.createElement("div");

    modal.id = "authModal";

    modal.className = "auth-overlay";

    modal.innerHTML = `

        <div class="auth-modal">

            <button
                class="auth-close"
                id="authClose"
                type="button"
            >
                ×
            </button>


            <div class="auth-logo">
                YR
            </div>


            <h2 id="authTitle">
                Welcome back
            </h2>

            <p
                class="auth-subtitle"
                id="authSubtitle"
            >
                Sign in to continue shopping.
            </p>


            <!-- LOGIN -->

            <form id="loginForm">

                <label>Email</label>

                <input
                    type="email"
                    id="loginEmail"
                    placeholder="Enter your email"
                    required
                >


                <label>Password</label>

                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Enter your password"
                    minlength="6"
                    required
                >


                <button
                    class="auth-main-button"
                    type="submit"
                >
                    Sign In
                </button>

            </form>


            <!-- SIGNUP -->

            <form
                id="signupForm"
                class="hidden"
            >

                <label>Name</label>

                <input
                    type="text"
                    id="signupName"
                    placeholder="Your name"
                    required
                >


                <label>Email</label>

                <input
                    type="email"
                    id="signupEmail"
                    placeholder="Enter your email"
                    required
                >


                <label>Password</label>

                <input
                    type="password"
                    id="signupPassword"
                    placeholder="Create a password"
                    minlength="6"
                    required
                >


                <button
                    class="auth-main-button"
                    type="submit"
                >
                    Create Account
                </button>

            </form>


            <div class="auth-divider">
                <span>OR</span>
            </div>


            <button
                class="google-button"
                id="googleLogin"
                type="button"
            >
                <span>G</span>
                Continue with Google
            </button>


            <p
                class="auth-message"
                id="authMessage"
            ></p>


            <button
                class="auth-switch"
                id="authSwitch"
                type="button"
            >
                Create a new account
            </button>

        </div>
    `;

    document.body.appendChild(modal);


    // Close
    document
        .getElementById("authClose")
        .addEventListener("click", closeAuth);


    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeAuth();
        }

    });


    // Login
    document
        .getElementById("loginForm")
        .addEventListener("submit", handleLogin);


    // Signup
    document
        .getElementById("signupForm")
        .addEventListener("submit", handleSignup);


    // Google
    document
        .getElementById("googleLogin")
        .addEventListener("click", handleGoogleLogin);


    // Login ↔ Signup
    document
        .getElementById("authSwitch")
        .addEventListener("click", toggleAuthMode);
}


// ------------------------------------------
// LOGIN
// ------------------------------------------

async function handleLogin(event) {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    setAuthMessage("Signing in...", "normal");

    try {

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = result.user;


        if (!user.emailVerified) {

            setAuthMessage(
                "Please verify your email before continuing.",
                "error"
            );

            await sendEmailVerification(user);

            return;
        }


        setAuthMessage(
            "Login successful.",
            "success"
        );

        setTimeout(() => {
            closeAuth();
        }, 700);

    } catch (error) {

        setAuthMessage(
            getFirebaseError(error),
            "error"
        );

    }
}


// ------------------------------------------
// SIGN UP
// ------------------------------------------

async function handleSignup(event) {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    setAuthMessage("Creating your account...", "normal");

    try {

        const result =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = result.user;


        // Save name locally for the first version
        localStorage.setItem(
            "yourRationUserName",
            name
        );


        // Send verification email
        await sendEmailVerification(user);


        setAuthMessage(
            "Account created. Check your email to verify your account.",
            "success"
        );


        document
            .getElementById("signupForm")
            .reset();

    } catch (error) {

        setAuthMessage(
            getFirebaseError(error),
            "error"
        );

    }
}


// ------------------------------------------
// GOOGLE LOGIN
// ------------------------------------------

async function handleGoogleLogin() {

    setAuthMessage(
        "Opening Google sign-in...",
        "normal"
    );

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        if (result.user) {

            setAuthMessage(
                "Google sign-in successful.",
                "success"
            );

            setTimeout(() => {
                closeAuth();
            }, 700);

        }

    } catch (error) {

        setAuthMessage(
            getFirebaseError(error),
            "error"
        );

    }
}


// ------------------------------------------
// LOGOUT
// ------------------------------------------

async function logoutUser() {

    try {

        await signOut(auth);

        showToast(
            "You have been signed out."
        );

    } catch (error) {

        console.error(error);

    }
}


// ------------------------------------------
// AUTH STATE
// ------------------------------------------

onAuthStateChanged(auth, user => {

    updateAccountUI(user);

});


// ------------------------------------------
// ACCOUNT UI
// ------------------------------------------

function updateAccountUI(user) {

    const accountButton =
        document.querySelector(".header-action");

    if (!accountButton) return;


    if (user) {

        accountButton.textContent = "✓";

        accountButton.title =
            user.displayName ||
            user.email ||
            "Account";

        accountButton.onclick = () => {

            const name =
                user.displayName ||
                localStorage.getItem(
                    "yourRationUserName"
                ) ||
                "Your Account";

            const shouldLogout =
                confirm(
                    `${name}\n\nSigned in as:\n${user.email}\n\nPress OK to sign out.`
                );

            if (shouldLogout) {
                logoutUser();
            }

        };

    } else {

        accountButton.textContent = "👤";

        accountButton.title =
            "Sign in";

        accountButton.onclick =
            openAuth;

    }

}


// ------------------------------------------
// AUTH MODE
// ------------------------------------------

function toggleAuthMode() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const title =
        document.getElementById("authTitle");

    const subtitle =
        document.getElementById("authSubtitle");

    const switchButton =
        document.getElementById("authSwitch");


    const signupVisible =
        !signupForm.classList.contains("hidden");


    if (signupVisible) {

        signupForm.classList.add("hidden");

        loginForm.classList.remove("hidden");

        title.textContent =
            "Welcome back";

        subtitle.textContent =
            "Sign in to continue shopping.";

        switchButton.textContent =
            "Create a new account";

    } else {

        loginForm.classList.add("hidden");

        signupForm.classList.remove("hidden");

        title.textContent =
            "Create your account";

        subtitle.textContent =
            "Join Your Ration and start shopping.";

        switchButton.textContent =
            "Already have an account? Sign in";

    }

    setAuthMessage("", "normal");
}


function showLoginMode() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    if (!loginForm || !signupForm) return;

    loginForm.classList.remove("hidden");

    signupForm.classList.add("hidden");

    document.getElementById("authTitle").textContent =
        "Welcome back";

    document.getElementById("authSubtitle").textContent =
        "Sign in to continue shopping.";

    document.getElementById("authSwitch").textContent =
        "Create a new account";

}


// ------------------------------------------
// MESSAGES
// ------------------------------------------

function setAuthMessage(message, type) {

    const element =
        document.getElementById("authMessage");

    if (!element) return;

    element.textContent = message;

    element.className =
        `auth-message ${type}`;

}


// ------------------------------------------
// FIREBASE ERROR TRANSLATION
// ------------------------------------------

function getFirebaseError(error) {

    const code = error.code || "";

    const messages = {

        "auth/invalid-credential":
            "Email or password is incorrect.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/email-already-in-use":
            "An account with this email already exists.",

        "auth/weak-password":
            "Password should be at least 6 characters.",

        "auth/popup-closed-by-user":
            "Google sign-in was cancelled.",

        "auth/popup-blocked":
            "Your browser blocked the Google sign-in window.",

        "auth/network-request-failed":
            "Network error. Check your internet connection."

    };

    return messages[code] ||
        "Something went wrong. Please try again.";
}


// ------------------------------------------
// GLOBAL FUNCTIONS
// ------------------------------------------

window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.logoutUser = logoutUser;
