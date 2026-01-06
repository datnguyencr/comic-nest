const container = document.getElementById("items");
const template = document.getElementById("item-template");
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
    const allowPrivate = hasAccess();
    const query = (searchInput?.value || "").trim().toLowerCase();

    container.innerHTML = "";

    for (const comic of allComics) {
        if (comic.private && !allowPrivate) continue;

        if (query && !comic.title.toLowerCase().includes(query)) continue;

        const node = template.content.cloneNode(true);
        const img = node.querySelector(".item-image");
        const title = node.querySelector(".item-name");
        const card = node.querySelector(".card");

        img.alt = comic.title;
        title.textContent = comic.title;

        img.src = await fetchAndDecrypt(`${comic.cover}.enc`);

        card.onclick = () => {
            location.href = `reader.html?id=${comic.id}`;
        };

        container.appendChild(node);
    }
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        renderLibrary();
    });
}

accessInput.addEventListener("change", (e) => {
    setAccess(e.target.value);
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
function isMobileLike() {
    return (
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );
}
if (isMobileLike()) {
    unlockBar.classList.remove("hidden");
}
