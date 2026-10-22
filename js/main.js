/* =========================================================
   MAIN.JS — Interacciones del portafolio
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initNav();
    initActiveLink();
    initHeaderScroll();
    initToTop();
    initReveal();
    initTyped();
    initProjectFilter();
    initContactForm();
    initCopyButtons();
    initYear();
});

/* ---------- Preloader ---------- */

function initPreloader() {
    const pre = document.getElementById("preloader");
    if (!pre) return;

    const hide = () => pre.classList.add("is-done");

    window.addEventListener("load", () => setTimeout(hide, 500));
    // Fallback por si load ya se disparó
    setTimeout(hide, 2600);
}

/* ---------- Navegación móvil ---------- */

function initNav() {
    const toggle = document.getElementById("burger");
    const list = document.getElementById("navLinks");
    if (!toggle || !list) return;

    const close = () => {
        list.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const open = list.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    });

    list.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) close();
    });
}

/* ---------- Enlace activo según la página ---------- */

function initActiveLink() {
    const links = document.querySelectorAll(".nav__link");
    if (!links.length) return;

    const path = window.location.pathname.replace(/\\/g, "/").split("/").pop() || "index.html";

    links.forEach((link) => {
        const target = (link.getAttribute("href") || "").split("/").pop();
        if (target === path) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }
    });
}

/* ---------- Sombra de la cabecera + botón volver arriba ---------- */

function initHeaderScroll() {
    const header = document.getElementById("nav");
    const toTop = document.getElementById("toTop");
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle("is-stuck", window.scrollY > 20);
        if (toTop) toTop.classList.toggle("is-show", window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Volver arriba ---------- */

function initToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Aparición progresiva de secciones ---------- */

function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => entry.target.classList.add("is-visible"), delay);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach((el) => observer.observe(el));
}

/* ---------- Efecto de máquina de escribir ---------- */

function initTyped() {
    const el = document.querySelector("[data-typed]");
    if (!el) return;

    let words;
    try {
        words = JSON.parse(el.dataset.typed);
    } catch {
        words = ["desarrollador de software"];
    }
    if (!Array.isArray(words) || !words.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
        el.textContent = words[0];
        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        el.textContent = word.slice(0, charIndex);

        let delay = deleting ? 55 : 105;

        if (!deleting && charIndex === word.length) {
            delay = 1700;
            deleting = true;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 350;
        }

        setTimeout(tick, delay);
    };

    tick();
}

/* ---------- Filtro de proyectos ---------- */

function initProjectFilter() {
    const buttons = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll("[data-category]");
    const empty = document.querySelector("[data-empty]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");

            const filter = btn.dataset.filter;
            let visible = 0;

            cards.forEach((card) => {
                const match = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("is-hidden", !match);
                if (match) visible++;
            });

            if (empty) empty.hidden = visible !== 0;
        });
    });
}

/* ---------- Validación del formulario de contacto ---------- */

function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const fields = {
        name: form.querySelector("#name"),
        email: form.querySelector("#email"),
        phone: form.querySelector("#phone"),
        message: form.querySelector("#message"),
    };

    const setError = (input, message) => {
        const error = form.querySelector(`[data-error-for="${input.id}"]`);
        const wrapper = input.closest(".field");
        if (error) error.textContent = message || "";
        if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
        input.setAttribute("aria-invalid", message ? "true" : "false");
        return !message;
    };

    const validate = () => {
        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const phone = fields.phone ? fields.phone.value.trim() : "";
        const message = fields.message.value.trim();

        const validName = setError(fields.name, name.length < 2 ? "Escribe tu nombre completo." : "");

        const validEmail = setError(
            fields.email,
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Ingresa un correo electrónico válido."
        );

        let validPhone = true;
        if (fields.phone && phone) {
            const digits = phone.replace(/\D/g, "");
            validPhone = setError(
                fields.phone,
                digits.length >= 7 ? "" : "El número debe tener al menos 7 dígitos."
            );
        } else if (fields.phone) {
            validPhone = setError(fields.phone, "");
        }

        const validMessage = setError(
            fields.message,
            message.length < 10 ? "Cuéntame un poco más (mínimo 10 caracteres)." : ""
        );

        return validName && validEmail && validPhone && validMessage;
    };

    Object.values(fields).forEach((input) => {
        if (!input) return;
        input.addEventListener("input", () => {
            const wrapper = input.closest(".field");
            if (wrapper && wrapper.classList.contains("has-error")) validate();
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validate()) {
            const firstError = form.querySelector(".has-error input, .has-error textarea");
            if (firstError) firstError.focus();
            return;
        }

        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const phone = fields.phone ? fields.phone.value.trim() : "";
        const message = fields.message.value.trim();

        const body = [
            `Nombre: ${name}`,
            `Correo: ${email}`,
            phone ? `Teléfono: ${phone}` : "",
            "",
            message,
        ]
            .filter(Boolean)
            .join("\n");

        const mailto = `mailto:yimmy120alexander@hotmail.com?subject=${encodeURIComponent(
            `Mensaje de ${name} — Portafolio`
        )}&body=${encodeURIComponent(body)}`;

        const success = form.querySelector("[data-form-success]");
        if (success) {
            success.hidden = false;
            success.querySelector("[data-mailto]")?.setAttribute("href", mailto);
            success.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        showToast("Mensaje preparado ✔");
    });
}

/* ---------- Copiar correo ---------- */

function initCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(btn.dataset.copy);
                showToast("Correo copiado al portapapeles");
            } catch {
                showToast("No se pudo copiar: " + btn.dataset.copy);
            }
        });
    });
}

/* ---------- Aviso flotante ---------- */

let toastTimer;
function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

/* ---------- Año actual en el pie de página ---------- */

function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
}
