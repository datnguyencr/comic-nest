import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    getAuth,
    signOut,
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
export async function logout() {
    await signOut(auth);
}
