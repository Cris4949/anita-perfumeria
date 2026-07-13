// ============================================================
// REGISTRO DE CLICKS EN "PEDIR" → Google Sheet
// ============================================================
// 1. Sigue las instrucciones para crear tu Google Sheet + Apps Script.
// 2. Pega aquí abajo la URL que te da Google al implementar el script
//    (algo como "https://script.google.com/macros/s/AKfycb.../exec").
// 3. Mientras esta URL esté vacía, el catálogo funciona igual de bien,
//    simplemente no se registra nada (no rompe ni bloquea el botón).
const URL_REGISTRO_CLICKS = "https://script.google.com/macros/s/AKfycbzLs-TIclFh8xuR3Xm047wXXDIboejoyW0_63MIlkLCXHtFwUBDf4U9atTYnO_nF8c/exec";

function registrarClickPedido(nombre, marca, precio) {
    if (!URL_REGISTRO_CLICKS) return; // Aún no configurado: no hace nada.
    const datos = JSON.stringify({ nombre, marca, precio });
    try {
        if (navigator.sendBeacon) {
            // sendBeacon está hecho justo para esto: mandar datos justo antes
            // de que el navegador abra otra pestaña, sin bloquear ni depender
            // de que la página siga abierta.
            const blob = new Blob([datos], { type: "text/plain;charset=UTF-8" });
            navigator.sendBeacon(URL_REGISTRO_CLICKS, blob);
        } else {
            fetch(URL_REGISTRO_CLICKS, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: datos
            });
        }
    } catch (e) {
        // Si falla el registro, no debe afectar la experiencia de compra.
    }
}
