// AES-GCM 32-byte key (same as Python)
const KEY_BYTES = new TextEncoder().encode("692b0630a29e5454545444fa2ee5f630");

/**
 * Decrypts an encrypted .enc file (AES-GCM) and returns a Blob URL
 * @param {string} url - path to the .enc file
 * @param {string} mimeType - MIME type of the original file (e.g., "image/avif")
 * @returns {Promise<string>} - Blob URL to assign to img.src
 */
export async function fetchAndDecrypt(url, mimeType = "image/avif") {
    if (hostile) {
        throw new Error("Access revoked");
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const buffer = await res.arrayBuffer();

    const nonce = buffer.slice(0, 12);
    const data = buffer.slice(12);

    const key = await crypto.subtle.importKey(
        "raw",
        KEY_BYTES,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce },
        key,
        data
    );

    return URL.createObjectURL(new Blob([decrypted], { type: mimeType }));
}
const scrollBtn = document.getElementById("scrollTopBtn");

// Show button after scrolling down 300px
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollBtn.classList.remove("hidden");
    } else {
        scrollBtn.classList.add("hidden");
    }
});

// Smooth scroll to top on click
scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
}
export function hasAccess() {
    return localStorage.getItem("accessKey") === getTodayKey();
}
export function setAccess(key) {
    localStorage.setItem("accessKey", key);
}
// ================= Right-Click Block =================
document.addEventListener("contextmenu", (e) => e.preventDefault());
// ================= DevTools Warning =================
async function loadDevToolsWarningAndDetect() {
    try {
        // 1️⃣ Load external HTML
        const response = await fetch("devtools-warning.html");
        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);
    } catch (err) {
        console.error(
            "Failed to load DevTools warning or start detection:",
            err
        );
    }
}

loadDevToolsWarningAndDetect();
let devToolsOpen = false;
// ================= Detection Loop =================
let hostile = false;

function onHostile(reason) {
    if (hostile) return;
    hostile = true;

    console.warn("Hostile detected:", reason);

    wipeContent();
}

function wipeContent() {
    const reader = document.getElementById("reader");
    if (!reader) return;

    reader.innerHTML = `
        <div class="w-full min-h-[80vh] flex items-center justify-center
                    bg-zinc-900 text-zinc-400 select-none">
            <div class="text-center">
                <p class="text-xl font-semibold">Content unavailable</p>
                <p class="text-sm opacity-60 mt-2">
                    Please refresh the page
                </p>
            </div>
        </div>
    `;
}

setInterval(() => {
    const before = new Date();
    debugger;

    const after = new Date();
    if (after - before > 100) {
        onHostile("debugger timing");
        if (!devToolsOpen) {
            devToolsOpen = true;
            showWarning();
        }
    } else {
        if (devToolsOpen) {
            devToolsOpen = false;
            hideWarning();
        }
    }
}, 1000);

function showWarning() {
    const banner = document.getElementById("devtools-warning");
    banner.classList.remove("hidden");
    banner.classList.add("animate-bounce");
}

function hideWarning() {
    const banner = document.getElementById("devtools-warning");
    banner.classList.add("hidden");
    banner.classList.remove("animate-bounce");
}
//  ================= Optional Keyboard Block =================
// Prevent F12 / Ctrl+Shift+I / Ctrl+Shift+C
document.addEventListener("keydown", (e) => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
    )
        e.preventDefault();
});
