import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAZLTmex2JqItkYIYjoyv3H_4zlOXAj1bY",
    authDomain: "comics-nest-852f5.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

export function verifyAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user || null);
    });
}

verifyAuth((user) => {
    const accountEl = document.getElementById("account");
    if (accountEl) {
        if (user) {
            // Logged-in user: show avatar
            accountEl.innerHTML = `
            <img 
                src="${user.photoURL}" 
                alt="${user.email}" 
                title="${user.email}" 
                class="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-default"
            />
        `;
        } else {
            // No user: show placeholder circle, clickable
            accountEl.innerHTML = `
            <div 
                class="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0 cursor-pointer"
                title="Sign in"
            ></div>
        `;

            // Add click event to redirect
            accountEl.querySelector("div").addEventListener("click", () => {
                // Save current URL so user can return after login
                const redirectUrl = encodeURIComponent(window.location.href);
                window.location.href = `/login.html?redirect=${redirectUrl}`;
            });
        }
    }
});
