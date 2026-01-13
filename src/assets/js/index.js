import * as Auth from "./auth.js";
import * as Utils from "./utils.js";
const container = document.getElementById("items");

const searchInput = document.getElementById("searchInput");
const accessInput = document.getElementById("accessInput");
const unlockBar = document.getElementById("unlockBar");

let allComics = [];

async function loadLibrary() {
    const res = await fetch("assets/data/comics.json");
    if (!res.ok) throw new Error("Failed to load comics.json");

    allComics = await res.json();
    renderLibrary();
}

async function renderLibrary() {
    const allowPrivate = Utils.hasAccess();
    const query = (searchInput?.value || "").trim().toLowerCase();

    container.innerHTML = "";
    const template = await Utils.loadTemplate("templates/item-template.html");
    for (const comic of allComics) {
        if (comic.private && !allowPrivate) continue;

        if (query && !comic.title.toLowerCase().includes(query)) continue;
        const node = template.content.cloneNode(true);

        const img = node.querySelector(".item-image");
        const title = node.querySelector(".item-name");
        const card = node.querySelector(".card");

        img.alt = comic.title;
        title.textContent = comic.title;

        img.src = await Utils.fetchAndDecrypt(`${comic.cover}.enc`);

        card.onclick = () => {
            location.href = `reader.html?id=${comic.id}`;
        };

        container.appendChild(node);
    }
}

function isMobileLike() {
    return (
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );
}
const accountEl = document.getElementById("account");
document.addEventListener("DOMContentLoaded", async () => {
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderLibrary();
        });
    }

    accessInput.addEventListener("change", (e) => {
        Utils.setAccess(e.target.value);
        e.target.value = "";
        renderLibrary();
    });

    loadLibrary().catch(console.error);

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
            e.preventDefault();

            unlockBar.classList.toggle("hidden");

            if (!unlockBar.classList.contains("hidden")) {
                accessInput.focus();
            }
        }
    });

    document.addEventListener("click", (e) => {
        if (!unlockBar.contains(e.target)) {
            unlockBar.classList.add("hidden");
        }
    });
    if (isMobileLike()) {
        unlockBar.classList.remove("hidden");
    }
    await Utils.loadDialog(
        "templates/confirm-sign-out-dialog.html",
        "confirmSignOutDialog"
    );
    Utils.setupDialog({
        dialogId: "confirmSignOutDialog",
        openBtn: accountEl,
        onNegativePressed: () => {},
        onPositivePressed: async () => {
            await Auth.logout();
        },
    });
    await Auth.verifyAuth((user) => {
        if (accountEl) {
            if (user) {
                accountEl.innerHTML = `
            <img 
                src="${user.photoURL}" 
                alt="${user.email}" 
                title="${user.email}" 
                class="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-default"
            />
        `;
                accountEl.addEventListener("click", () => {});
            } else {
                accountEl.innerHTML = `
            <div 
                class="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0 cursor-pointer"
                title="Sign in"
            ></div>
        `;

                accountEl.addEventListener("click", () => {
                    const redirectUrl = encodeURIComponent(
                        window.location.href
                    );
                    window.location.href = `/login.html?redirect=${redirectUrl}`;
                });
            }
        }
    });
    //Utils.enableContentProtection();
});
