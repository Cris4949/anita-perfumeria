// ============================================================
// CARRUSEL DE PROMOCIONES (banner principal)
// ============================================================
// Arreglo de imagenes de promociones para el carrusel del banner principal.
// Para agregar mas promociones, solo agrega otro archivo a /images/promos
// y otra ruta a este arreglo.
const promoImages = [
    "images/promos/promo1.jpg",
    "images/promos/promo2.jpg",
    "images/promos/promo3.jpg",
    "images/promos/promo4.jpg",
    "images/promos/promo5.jpg"
];

(function initPromoCarousel() {
    const track = document.getElementById("promoTrack");
    const dotsContainer = document.getElementById("promoDots");
    if (!track || promoImages.length === 0) return;

    const total = promoImages.length;

    // Ancho explícito del track y de cada slide en porcentaje, para que el
    // desplazamiento funcione de forma predecible sin depender de que el
    // navegador reparta el espacio de los flex-items por sí solo.
    track.style.width = (total * 100) + "%";

    promoImages.forEach((src, i) => {
        const slide = document.createElement("div");
        slide.style.width = (100 / total) + "%";
        slide.className = "h-full flex-shrink-0 bg-violeta-950 flex items-center justify-center";
        // La primera imagen del carrusel es visible de inmediato (above the fold),
        // así que carga en modo "eager"; el resto se carga de forma perezosa.
        const loadingAttr = i === 0 ? "eager" : "lazy";
        const fetchPriorityAttr = i === 0 ? ' fetchpriority="high"' : "";
        slide.innerHTML = `<img src="${src}" alt="Promoción Anita Perfumería ${i + 1}" loading="${loadingAttr}"${fetchPriorityAttr} class="max-w-full max-h-full w-full h-full object-contain">`;
        track.appendChild(slide);
    });

    if (total <= 1) {
        dotsContainer.classList.add("hidden");
        return;
    }

    let current = 0;

    promoImages.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.setAttribute("aria-label", `Ir a la promoción ${i + 1}`);
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    function updateDots() {
        [...dotsContainer.children].forEach((dot, i) => {
            dot.className = i === current
                ? "w-5 h-2 rounded-full bg-dorado-400 transition-all"
                : "w-2 h-2 rounded-full bg-crema-100/60 hover:bg-dorado-400 transition-all";
        });
    }

    function goToSlide(index) {
        current = index;
        // Se desplaza en fracciones de (100/total)% del ancho total del track,
        // así cada paso mueve exactamente un slide sin importar cuántos haya.
        track.style.transform = `translateX(-${current * (100 / total)}%)`;
        updateDots();
    }

    function nextSlide() {
        goToSlide((current + 1) % total);
    }

    updateDots();
    let autoplay = setInterval(nextSlide, 4000);

    const carousel = document.getElementById("promoCarousel");
    carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
    carousel.addEventListener("mouseleave", () => {
        autoplay = setInterval(nextSlide, 4000);
    });
})();
