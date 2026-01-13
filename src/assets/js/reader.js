import * as Auth from "./auth.js";
import * as Utils from "./utils.js";

let comicData = null;
let isVolumeChange = false;
let loadToken = 0;

async function loadComic() {
    const params = new URLSearchParams(window.location.search);
    const comicId = params.get("id");

    if (!comicId) {
        throw new Error("Missing comic id in URL");
    }

    const res = await fetch("assets/data/comics.json");
    if (!res.ok) throw new Error("Failed to load comics.json");

    const comics = await res.json();

    comicData = comics.find((c) => c.id === comicId);
    if (!comicData) {
        throw new Error(`Comic not found: ${comicId}`);
    }

    document.getElementById("title").innerText = comicData.title;

    setupVolumeSelector();
    loadVolume(comicData.volumes[0].volume);
}

function setupVolumeSelector() {
    const select = document.getElementById("volumeSelect");
    select.innerHTML = "";

    comicData.volumes.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.volume;
        opt.textContent = `Volume ${v.volume}`;
        select.appendChild(opt);
    });

    select.onchange = () => {
        isVolumeChange = true;
        loadVolume(Number(select.value));
    };
}
async function loadVolume(volumeNumber) {
    const myToken = ++loadToken; // invalidate all previous loads
    const reader = document.getElementById("reader");
    reader.replaceChildren();

    const volume = comicData.volumes.find((v) => v.volume === volumeNumber);
    if (!volume) return;

    const volFolder = `vol${String(volumeNumber).padStart(2, "0")}`;

    for (let i = 0; i < volume.pageCount; i++) {
        if (myToken !== loadToken) return; // ❗ STOP OLD LOAD
        const page = String(i).padStart(3, "0");
        const url = `${comicData.path}/${volFolder}/${page}.avif.enc`;

        // Decrypt to ArrayBuffer
        const blobUrl = await Utils.fetchAndDecrypt(url, "image/avif");
        if (myToken !== loadToken) {
            URL.revokeObjectURL(blobUrl);
            return;
        }
        const img = new Image();

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = blobUrl;
        });

        // Draw to canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        if (myToken !== loadToken) {
            URL.revokeObjectURL(blobUrl);
            return;
        }
        reader.appendChild(canvas);
    }
}
function getPages() {
    const reader = document.getElementById("reader");
    return Array.from(reader.querySelectorAll("canvas"));
}
function getCurrentPageIndex() {
    const pages = getPages();
    const scrollTop = window.scrollY;
    for (let i = pages.length - 1; i >= 0; i--) {
        const rect = pages[i].getBoundingClientRect();
        const pageTop = rect.top + window.scrollY;
        if (scrollTop >= pageTop - 10) return i;
    }
    return 0;
}

document.addEventListener("DOMContentLoaded", async () => {
    loadComic().catch((err) => {
        console.error(err);
        document.getElementById(
            "reader"
        ).innerHTML = `<p class="text-center text-red-400">Failed to load comic.</p>`;
    });
    document.addEventListener("keydown", (e) => {
        const pages = getPages();
        if (!pages.length) return;

        // ignore inputs/selects
        if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

        let currentPage = getCurrentPageIndex();

        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                currentPage = Math.max(0, currentPage - 1);
                pages[currentPage].scrollIntoView({ behavior: "smooth" });
                break;

            case "ArrowRight":
                e.preventDefault();
                currentPage = Math.min(pages.length - 1, currentPage + 1);
                pages[currentPage].scrollIntoView({ behavior: "smooth" });
                break;

            case "ArrowUp":
                e.preventDefault();
                window.scrollBy({ top: -300, behavior: "smooth" });
                break;

            case "ArrowDown":
                e.preventDefault();
                window.scrollBy({ top: 300, behavior: "smooth" });
                break;

            case "Home":
                e.preventDefault();
                pages[0].scrollIntoView({ behavior: "smooth" });
                break;

            case "End":
                e.preventDefault();
                pages[pages.length - 1].scrollIntoView({ behavior: "smooth" });
                break;
        }
    });
    const scrollBtn = document.getElementById("scrollTopBtn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.remove("hidden");
        } else {
            scrollBtn.classList.add("hidden");
        }
    });

    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    await Utils.loadDialog(
        "templates/confirm-sign-out-dialog.html",
        "confirmSignOutDialog"
    );

    await Auth.verifyAuth((user) => {
        const accountEl = document.getElementById("account");
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
                accountEl.addEventListener("click", () => {
                    Utils.setupDialog({
                        dialogId: "confirmSignOutDialog",
                        openBtn: accountEl,
                        onNegativePressed: () => {},
                        onPositivePressed: async () => {
                            await Auth.logout();
                        },
                    });
                });
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
    }); //Utils.enableContentProtection();
});
