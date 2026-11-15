// PASO 1. Inicializar un mapa geográfico auténtico con Leaflet y OpenStreetMap.
// Se usa un mapa de referencia de Lima: NO se presentan incidentes reales.
const contenedorMapa = document.querySelector('#mapa-real');
const estadoMapa = document.querySelector('#estado-mapa');
const botonLima = document.querySelector('#mapa-lima');
const botonUbicacion = document.querySelector('#mapa-ubicacion');
const vistaMapa = document.querySelector('.mapa-ilustrativo');
const coordenadasLima = [-12.0464, -77.0428]; // Latitud y longitud del centro de Lima.

// PASO 2. El dibujo de Figma funciona como respaldo si no hay Internet.
if (typeof L === 'undefined') {
  estadoMapa.textContent = 'No se pudo cargar Leaflet. Se muestra el mapa ilustrativo. Verifica tu conexión a Internet.';
} else {
  contenedorMapa.hidden = false;
  const mapa = L.map('mapa-real', { scrollWheelZoom: false }).setView(coordenadasLima, 12);

  // PASO 3. Descargar únicamente las imágenes del área visible del mapa.
  // © OpenStreetMap contributors; su atribución debe permanecer visible.
  const calles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(mapa);

  let hayMapaReal = false;
  let marcadorSeleccionado = null;
  let marcadorUbicacion = null;

  calles.once('tileload', function () {
    hayMapaReal = true;
    vistaMapa.classList.add('mapa-interactivo-activo');
    botonLima.disabled = false;
    botonUbicacion.disabled = false;
    estadoMapa.textContent = 'Calles reales de Lima, Perú. Arrastra, utiliza +/− o selecciona un punto. No hay reportes de riesgo reales.';
    mapa.invalidateSize();
  });

  // PASO 4. Si falla el servicio, conservar el mapa ilustrativo como respaldo.
  window.setTimeout(function () {
    if (!hayMapaReal) {
      contenedorMapa.hidden = true;
      estadoMapa.textContent = 'No fue posible cargar las calles reales. Se muestra el dibujo ilustrativo. Comprueba Internet y abre el sitio con un servidor local.';
    }
  }, 12000);

  // PASO 5. Al tocar el mapa, mostrar las coordenadas geográficas elegidas.
  mapa.on('click', function (evento) {
    const latitud = evento.latlng.lat.toFixed(5);
    const longitud = evento.latlng.lng.toFixed(5);
    if (marcadorSeleccionado) mapa.removeLayer(marcadorSeleccionado);
    marcadorSeleccionado = L.circleMarker(evento.latlng, {
      radius: 8, color: '#173b55', fillColor: '#3e7091', fillOpacity: 0.9, weight: 2
    }).addTo(mapa);
    marcadorSeleccionado.bindPopup(
      '<strong>Punto seleccionado</strong><br>Latitud: ' + latitud +
      '<br>Longitud: ' + longitud + '<br>No existe un reporte verificado para este punto.'
    ).openPopup();
  });

  // PASO 6. Regresar a la vista de referencia de Lima.
  botonLima.addEventListener('click', function () {
    mapa.setView(coordenadasLima, 12);
  });

  // PASO 7. Solicitar ubicación solo cuando la persona pulsa el botón.
  // No se guardan ni envían coordenadas de ubicación a una base de datos.
  botonUbicacion.addEventListener('click', function () {
    if (!navigator.geolocation) {
      estadoMapa.textContent = 'Este navegador no permite consultar tu ubicación.';
      return;
    }
    estadoMapa.textContent = 'Solicitando permiso para mostrar tu ubicación...';
    navigator.geolocation.getCurrentPosition(function (posicion) {
      const ubicacion = [posicion.coords.latitude, posicion.coords.longitude];
      if (marcadorUbicacion) mapa.removeLayer(marcadorUbicacion);
      marcadorUbicacion = L.circleMarker(ubicacion, {
        radius: 9, color: '#ffffff', fillColor: '#3e7091', fillOpacity: 1, weight: 3
      }).addTo(mapa);
      marcadorUbicacion.bindPopup('Tu ubicación aproximada (no es un reporte de riesgo).').openPopup();
      mapa.setView(ubicacion, 15);
      estadoMapa.textContent = 'Ubicación aproximada mostrada. La precisión depende del dispositivo.';
    }, function () {
      estadoMapa.textContent = 'No se pudo acceder a tu ubicación. Puedes explorar el mapa manualmente.';
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  });
}
