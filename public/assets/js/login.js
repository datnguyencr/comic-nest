import { auth } from "./auth.f737c5cb.js";
import {
    signInWithPopup,
    GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const loginBtn = document.getElementById("google-login");
const backBtn = document.getElementById("back");

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect") || "/index.html";

if (backBtn) {
    backBtn.addEventListener("click", (e) => {
        e.preventDefault(); // prevent default link behavior
        window.location.href = redirect;
    });
}

// Login handler
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = redirect;
    } catch (err) {
        console.error("Login failed:", err);
        alert("Login failed. Please try again.");
    }
});
