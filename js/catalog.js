// ============================================================
// CATÁLOGO INTERACTIVO — carga los productos desde data/productos.json
// ============================================================
// Catálogo con imágenes verificadas contra las fichas oficiales de cada fragancia.
// Todos los productos cuentan con foto oficial verificada. Si en el futuro se agrega
// un producto sin foto confirmada, se puede dejar imagen: null y se mostrará
// automáticamente un ícono elegante en su lugar.

let perfumes = [];

const grid = document.getElementById("catalogGrid");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const brandSelect = document.getElementById("brandSelect");
const priceChipsContainer = document.getElementById("priceChips");
const clearSearchBtn = document.getElementById("clearSearchBtn");

// Rangos de precio para los chips rápidos. [etiqueta, min, max] — max: null = sin tope.
const RANGOS_PRECIO = [
    { id: "all", label: "Todos los precios", min: 0, max: null },
    { id: "low", label: "Menos de Q400", min: 0, max: 399 },
    { id: "mid", label: "Q400 - Q500", min: 400, max: 500 },
    { id: "high", label: "Más de Q500", min: 501, max: null }
];
let rangoActivo = "all";

function fmtQ(n) {
    return "Q" + n.toLocaleString("es-GT");
}

function populateBrandFilter() {
    const marcas = [...new Set(perfumes.map(p => p.marca))].sort((a, b) => a.localeCompare(b, "es"));
    marcas.forEach(marca => {
        const opt = document.createElement("option");
        opt.value = marca;
        opt.textContent = marca;
        brandSelect.appendChild(opt);
    });
}

function renderPriceChips() {
    priceChipsContainer.innerHTML = "";
    RANGOS_PRECIO.forEach(rango => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.textContent = rango.label;
        chip.dataset.rango = rango.id;
        chip.className = estiloChip(rango.id === rangoActivo);
        chip.addEventListener("click", () => {
            rangoActivo = rango.id;
            renderPriceChips();
            renderCatalogo();
        });
        priceChipsContainer.appendChild(chip);
    });
}

function estiloChip(activo) {
    return activo
        ? "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-dorado-500 text-violeta-950 transition-all"
        : "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-violeta-900/60 border border-dorado-500/25 text-crema-100/80 hover:border-dorado-500/60 transition-all";
}

function buildCard(p, index) {
    const card = document.createElement("div");
    card.className = "card-enter group relative bg-violeta-900/60 rounded-xl border border-dorado-500/20 overflow-hidden shadow-lg transition-all duration-300 hover:border-dorado-500/60 hover:shadow-2xl hover:shadow-dorado-500/10 hover:-translate-y-1 flex flex-col justify-between";
    card.style.animationDelay = (index * 40) + "ms";

    const whatsappText = `Hola Anita Perfumería, me interesa adquirir el perfume "${p.nombre}" con el precio de ${fmtQ(p.precio)}. ¿Tienen disponibilidad para coordinar la entrega?`;
    const whatsappUrl = `https://wa.me/50253394448?text=${encodeURIComponent(whatsappText)}`;

    // Carga perezosa (lazy loading): las imágenes solo se piden al navegador
    // cuando la tarjeta está cerca del viewport, así la carga inicial es liviana.
    const imageBlock = p.imagen
        ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" decoding="async"
                class="max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-500 mix-blend-multiply"
                onerror="handleImageError(this)">`
        : `<div class="text-center text-dorado-400">
                <i class="fa-solid fa-droplet text-5xl mb-2 block"></i>
                <span class="text-xs uppercase tracking-wider">Premium Fragrance</span>
           </div>`;

    const imageWrapperClass = p.imagen
        ? "h-64 bg-white relative flex items-center justify-center p-6 overflow-hidden border-b border-dorado-500/10"
        : "h-64 bg-violeta-950/30 relative flex items-center justify-center p-6 overflow-hidden border-b border-dorado-500/10";

    // Badge de OFERTA en la esquina superior derecha, para productos en promoción.
    const ofertaBadge = p.oferta
        ? `<div class="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg animate-pulse">
                Oferta
           </div>`
        : "";

    card.innerHTML = `
        <div>
            <div class="absolute top-4 left-4 z-10 bg-violeta-950/80 border border-dorado-500/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-dorado-400">
                ${p.marca}
            </div>
            ${ofertaBadge}

            <div class="${imageWrapperClass}">
                ${imageBlock}
            </div>

            <div class="p-6 space-y-4">
                <h4 class="font-serif text-xl font-bold text-white group-hover:text-dorado-400 transition-colors">
                    ${p.nombre}
                </h4>

                <div class="space-y-2 text-sm text-crema-100/80 font-light">
                    <p><strong class="font-semibold text-dorado-300">Aroma:</strong> <span>${p.aroma}</span></p>
                    <p><strong class="font-semibold text-dorado-300">Duración:</strong> <span>${p.duracion}</span></p>
                    <p><strong class="font-semibold text-dorado-300">Presentación:</strong> <span>${p.ml}</span></p>
                </div>
            </div>
        </div>

        <div class="px-6 pb-6 pt-2 border-t border-dorado-500/10 flex items-center justify-between">
            <div>
                <span class="text-xs text-crema-100/40 uppercase block tracking-wider">Precio</span>
                ${p.oferta ? `
                <span class="text-sm text-crema-100/50 line-through block leading-tight">
                    ${fmtQ(p.precioOriginal)}
                </span>
                <span class="text-2xl font-serif font-bold text-red-500">
                    ${fmtQ(p.precio)}
                </span>
                ` : `
                <span class="text-2xl font-serif font-bold text-dorado-400">
                    ${fmtQ(p.precio)}
                </span>
                `}
            </div>
            <a href="${whatsappUrl}" target="_blank" data-pedir-id="${p.id}" class="bg-dorado-500 hover:bg-dorado-400 text-violeta-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 uppercase tracking-wide">
                <i class="fa-brands fa-whatsapp text-sm"></i> Pedir
            </a>
        </div>
    `;

    const botonPedir = card.querySelector(`[data-pedir-id="${p.id}"]`);
    if (botonPedir) {
        botonPedir.addEventListener("click", () => {
            registrarClickPedido(p.nombre, p.marca, p.precio);
        });
    }

    return card;
}

function handleImageError(imageElement) {
    const parent = imageElement.parentElement;
    parent.className = "h-64 bg-violeta-950/30 relative flex items-center justify-center p-6 overflow-hidden border-b border-dorado-500/10";
    parent.innerHTML = `
        <div class="text-center text-dorado-400">
            <i class="fa-solid fa-droplet text-5xl mb-2 block"></i>
            <span class="text-xs uppercase tracking-wider">Premium Fragrance</span>
        </div>
    `;
}
// Se expone globalmente porque se invoca desde el atributo onerror del <img>
window.handleImageError = handleImageError;

// Quita tildes/diacríticos para que la búsqueda funcione sin importar si el
// usuario escribe "precieux" o "précieux", "limon" o "limón", etc.
function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function getFilteredSorted() {
    const q = normalizar(searchInput.value.trim());
    const marcaSeleccionada = brandSelect.value;
    const rango = RANGOS_PRECIO.find(r => r.id === rangoActivo);
    let list = perfumes.filter(p => {
        if (marcaSeleccionada !== "all" && p.marca !== marcaSeleccionada) return false;
        if (rango.max !== null && p.precio > rango.max) return false;
        if (p.precio < rango.min) return false;
        if (!q) return true;
        return (
            normalizar(p.nombre).includes(q) ||
            normalizar(p.marca).includes(q) ||
            normalizar(p.aroma).includes(q)
        );
    });

    // Las fragancias en oferta siempre suben al inicio de la lista para llamar
    // más la atención; dentro de cada grupo (ofertas / resto) se ordena alfabético.
    list = [...list].sort((a, b) => {
        const aOferta = a.oferta ? 1 : 0;
        const bOferta = b.oferta ? 1 : 0;
        if (aOferta !== bOferta) return bOferta - aOferta;
        return a.nombre.localeCompare(b.nombre, "es");
    });

    return list;
}

function renderCatalogo() {
    const list = getFilteredSorted();
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.classList.add("hidden");
        emptyState.classList.remove("hidden");
        emptyState.classList.add("flex");
    } else {
        grid.classList.remove("hidden");
        emptyState.classList.add("hidden");
        emptyState.classList.remove("flex");
        list.forEach((p, i) => grid.appendChild(buildCard(p, i)));
    }

    const total = perfumes.length;
    resultsCount.textContent = list.length === total
        ? `Mostrando las ${total} fragancias disponibles`
        : `Mostrando ${list.length} de ${total} fragancias`;
}

searchInput.addEventListener("input", renderCatalogo);
brandSelect.addEventListener("change", renderCatalogo);
clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    brandSelect.value = "all";
    rangoActivo = "all";
    renderPriceChips();
    renderCatalogo();
    searchInput.focus();
});

// ============================================================
// CARGA DE DATOS: data/productos.json
// ============================================================
async function cargarProductos() {
    try {
        const res = await fetch("data/productos.json");
        if (!res.ok) throw new Error("No se pudo cargar productos.json");
        perfumes = await res.json();
    } catch (err) {
        console.error("Error cargando el catálogo:", err);
        resultsCount.textContent = "No se pudo cargar el catálogo. Intenta recargar la página.";
        return;
    }
    populateBrandFilter();
    renderPriceChips();
    renderCatalogo();
}

cargarProductos();
