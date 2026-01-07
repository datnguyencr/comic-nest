let comicData = null;

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
        loadVolume(Number(select.value));
    };
}
async function loadVolume(volumeNumber) {
    const reader = document.getElementById("reader");
    reader.innerHTML = "";

    const volume = comicData.volumes.find((v) => v.volume === volumeNumber);
    if (!volume) return;

    const volFolder = `vol${String(volumeNumber).padStart(2, "0")}`;

    for (let i = 0; i < volume.pageCount; i++) {
        const page = String(i).padStart(3, "0");
        const url = `${comicData.path}/${volFolder}/${page}.avif.enc`;

        // Decrypt to ArrayBuffer
        const blobUrl = await fetchAndDecrypt(url, "image/avif");
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

        // Optionally, revoke the blob immediately
        URL.revokeObjectURL(blobUrl);

        // Add canvas to reader instead of <img>
        reader.appendChild(canvas);
    }

    window.scrollTo({ top: 0, behavior: "instant" });
}

loadComic().catch((err) => {
    console.error(err);
    document.getElementById(
        "reader"
    ).innerHTML = `<p class="text-center text-red-400">Failed to load comic.</p>`;
});

const reader = document.getElementById("reader");

function getPages() {
    return Array.from(reader.querySelectorAll("img"));
}

function getCurrentPageIndex() {
    const pages = getPages();
    const scrollTop = window.scrollY;
    for (let i = pages.length - 1; i >= 0; i--) {
        const rect = pages[i].getBoundingClientRect();
        const pageTop = rect.top + window.scrollY; // absolute top
        if (scrollTop >= pageTop - 10) return i; // tolerance
    }
    return 0;
}

document.addEventListener("keydown", (e) => {
    const pages = getPages();
    if (!pages.length) return;

    // ignore inputs/selects
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

    let currentPage = getCurrentPageIndex();

    switch (e.key) {
        case "ArrowLeft": // previous page
            e.preventDefault();
            currentPage = Math.max(0, currentPage - 1);
            pages[currentPage].scrollIntoView({ behavior: "smooth" });
            break;

        case "ArrowRight": // next page
            e.preventDefault();
            currentPage = Math.min(pages.length - 1, currentPage + 1);
            pages[currentPage].scrollIntoView({ behavior: "smooth" });
            break;

        case "ArrowUp": // small scroll up
            e.preventDefault();
            window.scrollBy({ top: -300, behavior: "smooth" });
            break;

        case "ArrowDown": // small scroll down
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
