function closestScope(input) {
    const section = input.closest("section");
    return section ? section.querySelector("[data-search-scope]") : document.querySelector("[data-search-scope]");
}

function runFilter(root) {
    const input = root.querySelector("[data-search]");
    const scope = input ? closestScope(input) : root.querySelector("[data-search-scope]");
    const empty = root.querySelector("[data-empty-state]");
    const activeChip = root.querySelector(".filter-chip.is-active");
    const query = input ? input.value.trim().toLowerCase() : "";
    const chipValue = activeChip ? activeChip.dataset.filter : "all";

    if (!scope) {
        return;
    }

    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    let visible = 0;

    cards.forEach((card) => {
        const haystack = (card.dataset.searchText || card.textContent || "").toLowerCase();
        const filterText = card.dataset.filterText || card.textContent || "";
        const matchQuery = !query || haystack.includes(query);
        const matchChip = chipValue === "all" || filterText.includes(chipValue);
        const show = matchQuery && matchChip;

        card.style.display = show ? "" : "none";
        if (show) {
            visible += 1;
        }
    });

    if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
    }
}

function setupSearch() {
    document.querySelectorAll("[data-search]").forEach((input) => {
        const root = input.closest("section") || document;
        input.addEventListener("input", () => runFilter(root));
    });

    document.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            const root = chip.closest("section") || document;
            root.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("is-active"));
            chip.classList.add("is-active");
            runFilter(root);
        });
    });
}

function setupMenu() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-mobile-nav]");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function setupHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
        dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            show(index + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupHero();
    setupSearch();
});
