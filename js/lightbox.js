// ============================================================
// VISOR DE IMÁGENES (estilo Google Imágenes)
// ============================================================
// Se abre al hacer clic sobre la foto de un producto. Permite:
//  - Acercar/alejar haciendo clic o toque sobre la imagen.
//  - Acercar/alejar con la rueda del mouse (computadora).
//  - Arrastrar la imagen para moverla mientras está acercada.
//  - Volver a la vista normal con el botón "Volver", la (X),
//    la tecla Escape, o tocando fuera de la imagen.
(function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const imgWrap = document.getElementById("lightboxImgWrap");
    const btnBack = document.getElementById("lightboxBack");
    const btnClose = document.getElementById("lightboxClose");

    if (!lightbox) return;

    let scale = 1;
    let posX = 0, posY = 0;
    let dragging = false;
    let moved = false;
    let startX = 0, startY = 0;

    function applyTransform() {
        lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }

    function resetZoom() {
        scale = 1;
        posX = 0;
        posY = 0;
        applyTransform();
        imgWrap.classList.remove("cursor-grab");
        imgWrap.classList.add("cursor-zoom-in");
    }

    // Se expone globalmente para que catalog.js pueda abrir el visor
    // al hacer clic en la foto de cualquier tarjeta de producto.
    window.openLightbox = function (src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || "";
        resetZoom();
        lightbox.style.display = "block";
        document.body.style.overflow = "hidden";
    };

    function closeLightbox() {
        lightbox.style.display = "none";
        lightboxImg.src = "";
        document.body.style.overflow = "";
    }

    btnBack.addEventListener("click", closeLightbox);
    btnClose.addEventListener("click", closeLightbox);

    // Tocar/hacer clic fuera de la imagen (en el fondo negro) también cierra.
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target === imgWrap) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.style.display === "block") closeLightbox();
    });

    // Clic/touch sobre la imagen: si está en tamaño normal, acerca; si ya
    // está acercada, un clic más la regresa a su tamaño normal.
    imgWrap.addEventListener("click", (e) => {
        if (moved) { moved = false; return; } // fue un arrastre, no un clic simple
        if (scale === 1) {
            scale = 2.5;
            imgWrap.classList.remove("cursor-zoom-in");
            imgWrap.classList.add("cursor-grab");
            applyTransform();
        } else {
            resetZoom();
        }
    });

    // Rueda del mouse: acercar/alejar de forma gradual (en computadora).
    imgWrap.addEventListener("wheel", (e) => {
        e.preventDefault();
        const nuevaEscala = scale + (e.deltaY < 0 ? 0.2 : -0.2);
        scale = Math.min(Math.max(nuevaEscala, 1), 4);
        if (scale === 1) {
            resetZoom();
        } else {
            imgWrap.classList.remove("cursor-zoom-in");
            imgWrap.classList.add("cursor-grab");
            applyTransform();
        }
    }, { passive: false });

    // Arrastrar para desplazarse por la imagen mientras está acercada
    // (funciona tanto con mouse como con el dedo en celular).
    function dragStart(x, y) {
        if (scale === 1) return;
        dragging = true;
        moved = false;
        startX = x - posX;
        startY = y - posY;
    }
    function dragMove(x, y) {
        if (!dragging) return;
        moved = true;
        posX = x - startX;
        posY = y - startY;
        applyTransform();
    }
    function dragEnd() {
        dragging = false;
    }

    imgWrap.addEventListener("mousedown", (e) => dragStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => dragMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", dragEnd);

    imgWrap.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) dragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    imgWrap.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) dragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    imgWrap.addEventListener("touchend", dragEnd);
})();
