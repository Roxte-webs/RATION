// YOUR RATION — FIREBASE AUTH
(function(){
  "use strict";
  let auth=null;

  function init(){
    if(auth) return true;
    if(typeof firebase==="undefined" || !window.yourRationFirebaseConfig) return false;
    try{
      if(!firebase.apps.length) firebase.initializeApp(window.yourRationFirebaseConfig);
      auth=firebase.auth();
      auth.onAuthStateChanged(user=>{
        window.yourRationCurrentUser=user||null;
        updateAccountButton(user);
        const status=document.getElementById("accountStatus");
        const button=document.getElementById("accountAuthButton");
        if(status) status.textContent=user ? `Signed in as ${user.email||user.displayName||"your account"}.` : "You are shopping as a guest.";
        if(button) button.textContent=user ? "Sign out" : "Sign in / Create account";
      });
      return true;
    }catch(e){console.error("Your Ration Firebase:",e);return false}
  }

  function updateAccountButton(user){
    const b=document.getElementById("accountButton");
    if(!b) return;
    b.textContent=user?"✓":"♙";
    b.title=user?(user.displayName||user.email||"Account"):"Account";
    b.setAttribute("aria-label",user?"Your account":"Account");
  }

  function openAuth(){
    let modal=document.getElementById("authModal");
    if(!modal) createModal();
    document.getElementById("authModal").classList.add("open");
    showLogin();
  }

  function closeAuth(){document.getElementById("authModal")?.remove()}

  function createModal(){
    const m=document.createElement("div");
    m.id="authModal";m.className="auth-overlay";
    m.innerHTML=`
      <div class="auth-modal">
        <button class="auth-close" id="authClose" type="button">×</button>
        <div class="auth-logo">YR</div>
        <h2 id="authTitle">Welcome back</h2>
        <p class="auth-subtitle" id="authSubtitle">Sign in to continue shopping.</p>
        <form id="loginForm">
          <label>Email</label><input id="loginEmail" type="email" autocomplete="email" placeholder="Enter your email" required>
          <label>Password</label><input id="loginPassword" type="password" autocomplete="current-password" placeholder="Password" minlength="6" required>
          <button class="auth-main-button" type="submit">Sign in</button>
          <button class="auth-forgot" id="forgotPassword" type="button">Forgot password?</button>
        </form>
        <form id="signupForm" class="hidden">
          <label>Name</label><input id="signupName" type="text" autocomplete="name" placeholder="Your name" maxlength="80" required>
          <label>Email</label><input id="signupEmail" type="email" autocomplete="email" placeholder="Enter your email" required>
          <label>Password</label><input id="signupPassword" type="password" autocomplete="new-password" placeholder="Create a password" minlength="6" required>
          <button class="auth-main-button" type="submit">Create account</button>
        </form>
        <div class="auth-divider"><span>OR</span></div>
        <button class="google-button" id="googleLogin" type="button"><span>G</span> Continue with Google</button>
        <p class="auth-message" id="authMessage"></p>
        <button class="auth-switch" id="authSwitch" type="button">Create a new account</button>
      </div>`;
    document.body.appendChild(m);
    $("#authClose").onclick=closeAuth;
    $("#loginForm").onsubmit=login;
    $("#signupForm").onsubmit=signup;
    $("#googleLogin").onclick=google;
    $("#forgotPassword").onclick=forgot;
    $("#authSwitch").onclick=toggle;
    m.onclick=e=>{if(e.target===m)closeAuth()};
  }

  function showLogin(){
    const l=$("#loginForm"),s=$("#signupForm");
    if(!l||!s)return;
    l.classList.remove("hidden");s.classList.add("hidden");
    $("#authTitle").textContent="Welcome back";
    $("#authSubtitle").textContent="Sign in to continue shopping.";
    $("#authSwitch").textContent="Create a new account";
    setMessage("");
  }

  function toggle(){
    const l=$("#loginForm"),s=$("#signupForm");
    const signupVisible=!s.classList.contains("hidden");
    if(signupVisible){s.classList.add("hidden");l.classList.remove("hidden");$("#authTitle").textContent="Welcome back";$("#authSubtitle").textContent="Sign in to continue shopping." ;$("#authSwitch").textContent="Create a new account"}
    else{l.classList.add("hidden");s.classList.remove("hidden");$("#authTitle").textContent="Create your account";$("#authSubtitle").textContent="Join Your Ration and shop faster.";$("#authSwitch").textContent="Already have an account? Sign in"}
    setMessage("");
  }

  async function login(e){
    e.preventDefault();
    if(!init()){setMessage("Authentication service is not available right now.","error");return}
    setMessage("Signing in…");
    try{
      const r=await auth.signInWithEmailAndPassword($("#loginEmail").value.trim(),$("#loginPassword").value);
      if(!r.user.emailVerified){setMessage("Please verify your email first. A new verification email was sent.","error");try{await r.user.sendEmailVerification()}catch(_){}return}
      setMessage("Signed in successfully.","success");setTimeout(closeAuth,600);
    }catch(err){setMessage(errorText(err),"error")}
  }

  async function signup(e){
    e.preventDefault();
    if(!init()){setMessage("Authentication service is not available right now.","error");return}
    setMessage("Creating your account…");
    try{
      const name=$("#signupName").value.trim(),email=$("#signupEmail").value.trim(),password=$("#signupPassword").value;
      const r=await auth.createUserWithEmailAndPassword(email,password);
      if(name) await r.user.updateProfile({displayName:name});
      localStorage.setItem("yourRationUserName",name);
      await r.user.sendEmailVerification();
      setMessage("Account created. Check your email to verify it.","success");
      $("#signupForm").reset();
    }catch(err){setMessage(errorText(err),"error")}
  }

  async function google(){
    if(!init()){setMessage("Authentication service is not available right now.","error");return}
    setMessage("Opening Google sign-in…");
    try{
      await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      setMessage("Signed in successfully.","success");setTimeout(closeAuth,600);
    }catch(err){setMessage(errorText(err),"error")}
  }

  async function forgot(){
    if(!init()){setMessage("Authentication service is not available right now.","error");return}
    const email=$("#loginEmail").value.trim();
    if(!email){setMessage("Enter your email first.","error");$("#loginEmail").focus();return}
    try{await auth.sendPasswordResetEmail(email);setMessage("Password reset email sent.","success")}
    catch(err){setMessage(errorText(err),"error")}
  }

  async function logoutUser(){
    if(!init())return;
    await auth.signOut();
    document.getElementById("accountModal")?.classList.remove("open");
    if(window.showToast)window.showToast("You have been signed out.");
  }

  function setMessage(t,type){const e=$("#authMessage");if(e){e.textContent=t;e.className="auth-message "+(type||"")}}
  function errorText(e){
    const m={
      "auth/invalid-credential":"Email or password is incorrect.",
      "auth/invalid-email":"Please enter a valid email address.",
      "auth/email-already-in-use":"An account with this email already exists.",
      "auth/weak-password":"Use a stronger password.",
      "auth/popup-closed-by-user":"Google sign-in was cancelled.",
      "auth/popup-blocked":"Your browser blocked the Google sign-in window.",
      "auth/unauthorized-domain":"This website is not authorized in Firebase.",
      "auth/operation-not-allowed":"This sign-in method is not enabled in Firebase.",
      "auth/network-request-failed":"Network error. Check your connection."
    };
    return m[e.code]||e.message||"Something went wrong.";
  }

  function $(s){return document.querySelector(s)}
  window.openAuth=openAuth;
  window.closeAuth=closeAuth;
  window.logoutUser=logoutUser;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>init());
  else init();
})();