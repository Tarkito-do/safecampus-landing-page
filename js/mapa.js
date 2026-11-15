/*
  SafeCampus | Aegis Labs
  Mapa de vista previa del Landing Page.
  Utiliza los mismos reportes ficticios que plataforma.html.
  No recopila ni representa incidentes de seguridad reales.
*/
const contenedorMapa = document.querySelector('#mapa-real');
const estadoMapa = document.querySelector('#estado-mapa');
const botonLima = document.querySelector('#mapa-lima');
const botonUbicacion = document.querySelector('#mapa-ubicacion');
const vistaMapa = document.querySelector('.mapa-ilustrativo');
const fuente = window.SafeCampusDatos;
const coordenadasLima = fuente ? fuente.centro : [-12.0464, -77.0428];

if (typeof L === 'undefined') {
  estadoMapa.textContent = 'Vista ilustrativa: el mapa real no se pudo cargar. Para consultar los reportes de demostración, entra a la plataforma.';
} else {
  contenedorMapa.hidden = false;
  const mapa = L.map('mapa-real', {scrollWheelZoom: false}).setView(coordenadasLima, 12);
  const calles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(mapa);
  const capaReportes = L.layerGroup().addTo(mapa);
  let hayMapaReal = false;
  let marcadorUbicacion = null;

  function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }

  function dibujarReportes() {
    capaReportes.clearLayers();
    const reportes = fuente ? fuente.leer() : [];
    const validos = reportes.filter(function (r) {
      return r && r.estado !== 'descartado' &&
        Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lon)) &&
        Math.abs(Number(r.lat)) <= 90 && Math.abs(Number(r.lon)) <= 180;
    });
    validos.forEach(function (r) {
      const nivel = ['alto', 'medio', 'bajo'].includes(r.nivel) ? r.nivel : 'medio';
      const color = {alto:'#874b4b', medio:'#b36b6b', bajo:'#d6a5a5'}[nivel];
      const marcador = L.circleMarker([Number(r.lat), Number(r.lon)], {
        radius: 8, color: '#fff', fillColor: color, fillOpacity: 1, weight: 2
      }).addTo(capaReportes);
      const enlace = 'plataforma.html?reporte=' + encodeURIComponent(String(r.id));
      marcador.bindPopup(
        '<strong>' + escapar(r.categoria) + ' · reporte ficticio</strong>' +
        '<br>Nivel ' + escapar(nivel) +
        '<br>Estado: ' + escapar(r.estado) +
        '<br><a href="' + enlace + '">Ver detalle en SafeCampus</a>'
      );
    });
    if (hayMapaReal) {
      estadoMapa.textContent = 'Vista previa de ' + validos.length +
        ' reportes ficticios de SafeCampus. Selecciona un marcador para ver su detalle en la plataforma.';
    }
  }

  calles.once('tileload', function () {
    hayMapaReal = true;
    vistaMapa.classList.add('mapa-interactivo-activo');
    botonLima.disabled = false;
    botonUbicacion.disabled = false;
    dibujarReportes();
    mapa.invalidateSize();
  });

  window.setTimeout(function () {
    if (!hayMapaReal) {
      contenedorMapa.hidden = true;
      estadoMapa.textContent = 'No se pudieron cargar las calles reales. Se muestra la ilustración de Figma como respaldo.';
    }
  }, 12000);

  botonLima.addEventListener('click', function () {
    mapa.setView(coordenadasLima, 12);
  });

  botonUbicacion.addEventListener('click', function () {
    if (!navigator.geolocation) {
      estadoMapa.textContent = 'Este navegador no permite consultar tu ubicación.';
      return;
    }
    estadoMapa.textContent = 'Solicitando permiso para mostrar tu ubicación aproximada...';
    navigator.geolocation.getCurrentPosition(function (posicion) {
      const posicionMapa = [posicion.coords.latitude, posicion.coords.longitude];
      if (marcadorUbicacion) mapa.removeLayer(marcadorUbicacion);
      marcadorUbicacion = L.circleMarker(posicionMapa, {
        radius: 9, color: '#ffffff', fillColor: '#3e7091', fillOpacity: 1, weight: 3
      }).addTo(mapa);
      marcadorUbicacion.bindPopup('Tu ubicación aproximada (no representa un reporte).').openPopup();
      mapa.setView(posicionMapa, 15);
      estadoMapa.textContent = 'Ubicación aproximada mostrada. No representa un riesgo verificado.';
    }, function () {
      estadoMapa.textContent = 'No se pudo obtener tu ubicación. Puedes explorar el mapa sin compartirla.';
    }, {enableHighAccuracy:false, timeout:10000, maximumAge:60000});
  });

  window.addEventListener('storage', function (evento) {
    if (fuente && evento.key === fuente.clave) dibujarReportes();
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) dibujarReportes();
  });
}
