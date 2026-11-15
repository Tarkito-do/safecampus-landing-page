/*
  SafeCampus | Aegis Labs
  Prototipo académico de 30 HU. Datos locales, sin backend ni cuentas reales.
  Las funciones siguen la organización por PASOS del curso.
*/

// PASO 1. Datos de demostración y almacenamiento local.
const CLAVE_REPORTES = 'safecampus-demo-reportes-v1';
const CLAVE_PERFIL = 'safecampus-demo-perfil-v1';
const CLAVE_COMUNICADOS = 'safecampus-demo-comunicados-v1';
const CLAVE_AVISOS = 'safecampus-demo-avisos-v1';
const CLAVE_BITACORA = 'safecampus-demo-bitacora-v1';
const CENTRO_LIMA = [-12.0464, -77.0428];
const ahora = Date.now();

const reportesIniciales = [
  { id: 'D-021', categoria: 'Robo', descripcion: 'EJEMPLO FICTICIO: reporte de prueba para explorar la interfaz.', lugar: 'Centro de Lima (simulado)', lat: -12.0475, lon: -77.0403, nivel: 'alto', fecha: ahora - 35 * 60000, estado: 'pendiente', propietario: 'demo@universidad.edu', confirmaciones: 0, gestion: 'Pendiente', responsable: '', evidencia: '' },
  { id: 'D-022', categoria: 'Iluminación', descripcion: 'EJEMPLO FICTICIO: iluminación insuficiente descrita con fines académicos.', lugar: 'Cercado de Lima (simulado)', lat: -12.0524, lon: -77.0346, nivel: 'medio', fecha: ahora - 3 * 3600000, estado: 'confirmado', propietario: 'otra-cuenta@universidad.edu', confirmaciones: 2, gestion: 'En atención', responsable: 'Equipo A', evidencia: '' },
  { id: 'D-023', categoria: 'Acoso', descripcion: 'EJEMPLO FICTICIO: ubicación y descripción no corresponden a un suceso real.', lugar: 'Pueblo Libre (simulado)', lat: -12.0762, lon: -77.0622, nivel: 'bajo', fecha: ahora - 2 * 86400000, estado: 'pendiente', propietario: 'otra-cuenta@universidad.edu', confirmaciones: 0, gestion: 'Pendiente', responsable: '', evidencia: '' }
];

const perfilInicial = {
  usuario: 'demo@universidad.edu',
  rutas: 'Centro de Lima',
  radio: 500,
  inicio: '06:00',
  fin: '22:00',
  silenciarHasta: 0
};

function leerLocal(clave, valorInicial) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorInicial;
  } catch (error) {
    return valorInicial;
  }
}
function guardarLocal(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    informar('No se pudo guardar todo en el navegador. Libera espacio o reduce la evidencia adjunta.');
    return false;
  }
}
let reportes = leerLocal(CLAVE_REPORTES, reportesIniciales);
let perfil = leerLocal(CLAVE_PERFIL, perfilInicial);
let comunicados = leerLocal(CLAVE_COMUNICADOS, []);
let avisos = leerLocal(CLAVE_AVISOS, []);
let bitacora = leerLocal(CLAVE_BITACORA, []);
if (!Array.isArray(reportes)) reportes = reportesIniciales;
if (!Array.isArray(comunicados)) comunicados = [];
if (!Array.isArray(avisos)) avisos = [];
if (!Array.isArray(bitacora)) bitacora = [];

// PASO 2. Utilidades seguras: mensajes, fechas y salida HTML.
function elemento(id) { return document.getElementById(id); }
function escapar(valor) {
  return String(valor === undefined || valor === null ? '' : valor).replace(/[&<>"']/g, function (caracter) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter];
  });
}
function fechaCorta(valor) { return new Date(Number(valor)).toLocaleString('es-PE'); }
function informar(mensaje) { elemento('mensaje-global').textContent = mensaje; }
function mostrarVacio(id, texto) { elemento(id).innerHTML = '<p class="vacio">' + escapar(texto) + '</p>'; }
function etiquetaEstado(estado) {
  const permitidos = ['pendiente', 'confirmado', 'descartado'];
  const seguro = permitidos.includes(estado) ? estado : 'pendiente';
  return '<span class="etiqueta-estado estado-' + seguro + '">' + seguro.toUpperCase() + '</span>';
}
function nivelVisible(nivel) {
  const seguro = ['bajo', 'medio', 'alto'].includes(nivel) ? nivel : 'medio';
  return '<span class="nivel nivel-' + seguro + '">Riesgo ' + seguro + '</span>';
}
function obtenerReporte(id) { return reportes.find(function (r) { return r.id === id; }); }
function persistirReportes() {
  guardarLocal(CLAVE_REPORTES, reportes);
  refrescarTodo();
}
function distMetros(aLat, aLon, bLat, bLon) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}
function horarioPermitido() {
  const hora = new Date().toTimeString().slice(0, 5);
  if (!perfil.inicio || !perfil.fin || perfil.inicio === perfil.fin) return true;
  if (perfil.inicio < perfil.fin) return hora >= perfil.inicio && hora <= perfil.fin;
  return hora >= perfil.inicio || hora <= perfil.fin;
}
function permiteAvisar() {
  return Number(perfil.silenciarHasta) <= Date.now() && horarioPermitido();
}
function notificar(texto) {
  const nuevo = { id: 'A-' + Date.now() + '-' + Math.floor(Math.random() * 1000), texto: texto, fecha: Date.now() };
  avisos.unshift(nuevo);
  avisos = avisos.slice(0, 40);
  guardarLocal(CLAVE_AVISOS, avisos);
  mostrarAvisos();
  if (permiteAvisar() && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification('SafeCampus — demostración', { body: texto }); } catch (error) { /* aviso visible en pantalla */ }
  }
}
function registrarBitacora(reporte, accion) {
  bitacora.unshift({ id: reporte.id, texto: accion, fecha: Date.now() });
  bitacora = bitacora.slice(0, 150);
  guardarLocal(CLAVE_BITACORA, bitacora);
}
function avisarRutasFrecuentes(reporte) {
  if (!permiteAvisar() || reporte.estado === 'descartado' || reporte.propietario === perfil.usuario) return;
  const rutas = perfil.rutas.split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
  if (rutas.some(function (ruta) { return reporte.lugar.toLowerCase().includes(ruta); })) {
    notificar('SIMULACIÓN: nuevo reporte de prueba en una de tus rutas frecuentes (' + reporte.lugar + ').');
  }
}
function cambiosEstadoPropio(reporte, antiguo) {
  if (reporte.propietario === perfil.usuario && antiguo !== reporte.estado) {
    notificar('Reporte ' + reporte.id + ': cambió de ' + antiguo + ' a ' + reporte.estado + '.');
  }
}

// PASO 3. Navegación entre pantallas y simulación de roles.
const vistas = Array.from(document.querySelectorAll('.pantalla'));
let vistaAnterior = 'vista-mapa';
let idDetalle = null;
function navegar(id) {
  const destino = elemento(id);
  if (!destino || (id === 'vista-seguridad' && elemento('rol-demo').value !== 'seguridad')) return;
  const actual = vistas.find(function (vista) { return !vista.hidden; });
  if (actual && actual.id !== id) vistaAnterior = actual.id;
  vistas.forEach(function (vista) { vista.hidden = vista !== destino; });
  document.querySelectorAll('[data-ir]').forEach(function (boton) {
    boton.classList.toggle('activo', boton.getAttribute('data-ir') === id);
  });
  if (id === 'vista-mapa' && mapa) window.setTimeout(function () { mapa.invalidateSize(); }, 70);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
document.querySelectorAll('[data-ir]').forEach(function (boton) {
  boton.addEventListener('click', function () {
    if (boton.getAttribute('data-ir') === 'vista-nuevo') prepararNuevo();
    navegar(boton.getAttribute('data-ir'));
  });
});
elemento('abrir-reporte').addEventListener('click', function () { prepararNuevo(); navegar('vista-nuevo'); });
elemento('volver-detalle').addEventListener('click', function () { navegar('vista-mapa'); });
elemento('volver-formulario').addEventListener('click', function () { navegar(vistaAnterior === 'vista-reportes' ? 'vista-reportes' : 'vista-mapa'); });
elemento('rol-demo').addEventListener('change', function () {
  const seguridad = this.value === 'seguridad';
  elemento('pestana-seguridad').hidden = !seguridad;
  informar(seguridad ? 'Modo seguridad simulado activado. No hay control de acceso real.' : 'Modo estudiante de demostración activado.');
  if (!seguridad && !elemento('vista-seguridad').hidden) navegar('vista-mapa');
});

// PASO 4. Mapa con Leaflet: HU01-HU08 y selección manual HU13.
let mapa = null;
let capaMarcadores = null;
let capaCalor = null;
let marcadorUbicacion = null;
let modoSeleccion = false;
let ubicacionActual = null;
let filtroCalor = false;
let seguimientoCercania = null;
let ultimoAvisoCercania = '';
let ultimoMomentoAviso = 0;
if (typeof L !== 'undefined') {
  mapa = L.map('mapa-app', { scrollWheelZoom: false }).setView(CENTRO_LIMA, 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  capaCalor = L.layerGroup().addTo(mapa);
  const leyenda = L.control({ position: 'bottomright' });
  leyenda.onAdd = function () {
    const div = L.DomUtil.create('div', 'mapa-leyenda');
    div.innerHTML = '<strong>Datos ficticios</strong><div><i class="calor-bajo"></i>Bajo</div><div><i class="calor-medio"></i>Medio</div><div><i class="calor-alto"></i>Alto</div>';
    return div;
  };
  leyenda.addTo(mapa);
  mapa.on('click', function (evento) {
    if (!modoSeleccion) return;
    elemento('reporte-lat').value = evento.latlng.lat.toFixed(6);
    elemento('reporte-lon').value = evento.latlng.lng.toFixed(6);
    elemento('reporte-lugar').value = 'Punto seleccionado manualmente';
    modoSeleccion = false;
    informar('Ubicación elegida. Vuelve al formulario para completar el reporte.');
    navegar('vista-nuevo');
  });
} else {
  elemento('mapa-app').textContent = 'No se pudo cargar Leaflet. Comprueba la conexión para usar el mapa; las listas siguen disponibles.';
}
function reportesFiltrados() {
  const categoria = elemento('filtro-categoria').value;
  const horas = elemento('filtro-tiempo').value;
  const texto = elemento('filtro-busqueda').value.trim().toLocaleLowerCase('es-PE');
  return reportes.filter(function (r) {
    if (r.estado === 'descartado') return false;
    if (categoria && r.categoria !== categoria) return false;
    if (horas !== 'todos' && Date.now() - Number(r.fecha) > Number(horas) * 3600000) return false;
    return !texto || (r.lugar + ' ' + r.descripcion + ' ' + r.categoria).toLocaleLowerCase('es-PE').includes(texto);
  }).sort(function (a, b) { return b.fecha - a.fecha; });
}
function dibujarMapa() {
  const lista = reportesFiltrados();
  elemento('contador-mapa').textContent = lista.length + ' reportes de demostración coincidentes';
  if (!mapa) return;
  capaMarcadores.clearLayers();
  capaCalor.clearLayers();
  lista.forEach(function (r) {
    const nivel = ['bajo', 'medio', 'alto'].includes(r.nivel) ? r.nivel : 'medio';
    const icono = L.divIcon({ className: '', html: '<span class="icono-incidente ' + nivel + '"></span>', iconSize: [20, 20], iconAnchor: [10, 10] });
    const marcador = L.marker([Number(r.lat), Number(r.lon)], { icon: icono }).addTo(capaMarcadores);
    marcador.bindPopup('<strong>' + escapar(r.categoria) + ' — FICTICIO</strong><br>' + nivelVisible(nivel) +
      '<br>' + escapar(r.lugar) + '<br>' + etiquetaEstado(r.estado) +
      '<br><button class="boton-secundario ver-popup" type="button">Ver detalle</button>');
    marcador.on('popupopen', function (evento) {
      const boton = evento.popup.getElement().querySelector('.ver-popup');
      if (boton) boton.addEventListener('click', function () { verDetalle(r.id); });
    });
    if (filtroCalor) {
      L.circle([Number(r.lat), Number(r.lon)], {
        radius: 250 + r.confirmaciones * 60,
        stroke: false, fillColor: { bajo: '#d6a5a5', medio: '#b36b6b', alto: '#874b4b' }[nivel], fillOpacity: .28
      }).addTo(capaCalor);
    }
  });
}
function tarjetaReporte(r, acciones) {
  return '<article class="tarjeta-reporte"><header><h3>' + escapar(r.categoria) + ' · ' + escapar(r.id) + '</h3>' + etiquetaEstado(r.estado) +
    '</header><p>' + escapar(r.lugar) + ' · ' + fechaCorta(r.fecha) + ' · ' + nivelVisible(r.nivel) + '</p>' +
    '<p>' + escapar(r.descripcion) + '</p><div class="acciones-cortas">' +
    '<button type="button" class="boton-secundario" data-accion="detalle" data-id="' + escapar(r.id) + '">Ver detalle</button>' +
    (acciones && r.estado === 'pendiente' ? '<button type="button" class="boton-secundario" data-accion="editar" data-id="' + escapar(r.id) + '">Editar</button><button type="button" class="boton-secundario boton-peligro" data-accion="retirar" data-id="' + escapar(r.id) + '">Retirar</button>' : '') +
    '</div></article>';
}
function refrescarMapaListas() {
  const filtrados = reportesFiltrados();
  dibujarMapa();
  elemento('reportes-recientes').innerHTML = filtrados.length ? filtrados.map(function (r) { return tarjetaReporte(r, false); }).join('') : '<p class="vacio">No hay reportes para los filtros seleccionados.</p>';
}
['filtro-categoria', 'filtro-tiempo', 'filtro-busqueda'].forEach(function (id) {
  elemento(id).addEventListener(id === 'filtro-busqueda' ? 'input' : 'change', refrescarMapaListas);
});
elemento('limpiar-filtros').addEventListener('click', function () {
  elemento('filtro-categoria').value = '';
  elemento('filtro-tiempo').value = 'todos';
  elemento('filtro-busqueda').value = '';
  refrescarMapaListas();
});
elemento('mostrar-calor').addEventListener('click', function () {
  filtroCalor = !filtroCalor;
  this.setAttribute('aria-pressed', String(filtroCalor));
  this.textContent = filtroCalor ? 'Ocultar densidad' : 'Capa de densidad';
  dibujarMapa();
  informar('Densidad ilustrativa calculada a partir de los reportes ficticios visibles.');
});
elemento('centrar-lima').addEventListener('click', function () { if (mapa) mapa.setView(CENTRO_LIMA, 12); });

function pedirGps(alRecibir) {
  if (!navigator.geolocation) { informar('El navegador no ofrece geolocalización. Usa la selección manual.'); return; }
  informar('Solicitando permiso de ubicación...');
  navigator.geolocation.getCurrentPosition(function (pos) {
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    ubicacionActual = { lat: lat, lon: lon };
    alRecibir(lat, lon);
    alertasCercanas(lat, lon);
  }, function () { informar('No se obtuvo permiso o ubicación. Puedes elegir la posición manualmente.'); },
  { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
}
elemento('mi-ubicacion').addEventListener('click', function () {
  pedirGps(function (lat, lon) {
    if (!mapa) return;
    if (marcadorUbicacion) mapa.removeLayer(marcadorUbicacion);
    marcadorUbicacion = L.circleMarker([lat, lon], { radius: 9, color: '#ffffff', fillColor: '#3e7091', fillOpacity: 1, weight: 3 }).addTo(mapa);
    marcadorUbicacion.bindPopup('Tu ubicación aproximada (no representa un reporte).').openPopup();
    mapa.setView([lat, lon], 15);
    informar('Se mostró tu ubicación aproximada. La precisión depende del dispositivo.');
  });
});
elemento('vigilar-cercania').addEventListener('click', function () {
  if (seguimientoCercania !== null) {
    navigator.geolocation.clearWatch(seguimientoCercania);
    seguimientoCercania = null;
    this.setAttribute('aria-pressed', 'false');
    this.textContent = 'Activar alertas por cercanía';
    informar('Seguimiento de ubicación detenido.');
    return;
  }
  if (!navigator.geolocation) { informar('El navegador no permite seguimiento de ubicación.'); return; }
  seguimientoCercania = navigator.geolocation.watchPosition(function (pos) {
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    ubicacionActual = { lat: lat, lon: lon };
    alertasCercanas(lat, lon);
  }, function () {
    informar('No se pudo consultar tu ubicación para avisos de cercanía.');
    if (seguimientoCercania !== null) navigator.geolocation.clearWatch(seguimientoCercania);
    seguimientoCercania = null;
    elemento('vigilar-cercania').setAttribute('aria-pressed', 'false');
    elemento('vigilar-cercania').textContent = 'Activar alertas por cercanía';
  }, { enableHighAccuracy: false, maximumAge: 30000, timeout: 12000 });
  this.setAttribute('aria-pressed', 'true');
  this.textContent = 'Detener alertas por cercanía';
  informar('Seguimiento activado solo mientras la página esté abierta. No se guardan coordenadas.');
});
function alertasCercanas(lat, lon) {
  if (!permiteAvisar()) { informar('Alertas en silencio o fuera del horario configurado.'); return; }
  const cerca = reportes.filter(function (r) {
    return r.estado !== 'descartado' && distMetros(lat, lon, Number(r.lat), Number(r.lon)) <= Number(perfil.radio);
  });
  const firma = cerca.map(function (r) { return r.id; }).sort().join(',');
  if (cerca.length && (firma !== ultimoAvisoCercania || Date.now() - ultimoMomentoAviso > 15 * 60000)) {
    ultimoAvisoCercania = firma;
    ultimoMomentoAviso = Date.now();
    notificar('SIMULACIÓN: hay ' + cerca.length + ' reporte(s) de prueba dentro del radio de ' + perfil.radio + ' metros.');
    informar('Aviso simulado de cercanía mostrado. No representa un riesgo verificado.');
  }
}

// PASO 5. Detalle de incidente y validación comunitaria: HU02, HU16, HU18.
function verDetalle(id) {
  const r = obtenerReporte(id);
  if (!r) return;
  idDetalle = id;
  elemento('detalle-categoria').textContent = r.categoria + ' · ' + r.id;
  elemento('detalle-datos').innerHTML = '<p>' + escapar(r.lugar) + ' · ' + fechaCorta(r.fecha) + '</p>' +
    '<p>' + nivelVisible(r.nivel) + ' · ' + etiquetaEstado(r.estado) + '</p>' +
    '<p>Coordenadas: ' + Number(r.lat).toFixed(5) + ', ' + Number(r.lon).toFixed(5) + '</p>' +
    '<p>Confirmaciones comunitarias: ' + Number(r.confirmaciones || 0) + '</p>';
  elemento('detalle-descripcion').textContent = r.descripcion;
  elemento('detalle-imagen').innerHTML = r.evidencia && /^data:image\/(jpeg|png|webp|gif);base64,/.test(r.evidencia) ?
    '<img class="evidencia" alt="Evidencia adjunta en esta demostración" src="' + r.evidencia + '">' : '<p class="texto-tenue">Sin evidencia adjunta.</p>';
  elemento('detalle-validacion').innerHTML = etiquetaEstado(r.estado);
  elemento('confirmar-reporte').disabled = r.estado !== 'pendiente' || r.propietario === perfil.usuario;
  navegar('vista-detalle');
}
elemento('confirmar-reporte').addEventListener('click', function () {
  const r = obtenerReporte(idDetalle);
  if (!r || r.estado !== 'pendiente' || r.propietario === perfil.usuario) return;
  r.confirmaciones = Number(r.confirmaciones || 0) + 1;
  // Simulación de una única validación comunitaria. La verificación oficial pertenece a seguridad.
  const key = 'safecampus-confirmo-' + r.id + '-' + perfil.usuario;
  if (sessionStorage.getItem(key)) { informar('Ya confirmaste este reporte en esta sesión.'); return; }
  sessionStorage.setItem(key, 'si');
  persistirReportes();
  verDetalle(r.id);
  informar('Confirmación comunitaria simulada registrada; no sustituye la verificación de seguridad.');
});

// PASO 6. Nuevo reporte con GPS, ubicación manual y evidencia: HU11-HU15, HU21.
let evidenciaPendiente = '';
let borrador = null;
function prepararNuevo(id) {
  elemento('form-reporte').reset();
  elemento('reporte-id').value = '';
  elemento('reporte-lat').value = '';
  elemento('reporte-lon').value = '';
  elemento('vista-foto').innerHTML = '';
  elemento('revisar-reporte').hidden = true;
  elemento('form-reporte').hidden = false;
  elemento('titulo-nuevo').textContent = 'Nuevo reporte';
  evidenciaPendiente = '';
  borrador = null;
  if (id) {
    const r = obtenerReporte(id);
    if (!r || r.propietario !== perfil.usuario || r.estado !== 'pendiente') return;
    elemento('titulo-nuevo').textContent = 'Editar reporte ' + r.id;
    elemento('reporte-id').value = r.id;
    elemento('reporte-categoria').value = r.categoria;
    elemento('reporte-descripcion').value = r.descripcion;
    elemento('reporte-riesgo').value = r.nivel;
    elemento('reporte-lugar').value = r.lugar;
    elemento('reporte-lat').value = r.lat;
    elemento('reporte-lon').value = r.lon;
    evidenciaPendiente = r.evidencia || '';
  }
}
elemento('ubicacion-formulario').addEventListener('click', function () {
  pedirGps(function (lat, lon) {
    elemento('reporte-lat').value = lat.toFixed(6);
    elemento('reporte-lon').value = lon.toFixed(6);
    elemento('reporte-lugar').value = 'Ubicación actual aproximada (GPS)';
    informar('Ubicación agregada al formulario. Comprueba la precisión antes de continuar.');
  });
});
elemento('elegir-en-mapa').addEventListener('click', function () {
  if (!mapa) { informar('No es posible seleccionar en el mapa sin conexión a Leaflet.'); return; }
  modoSeleccion = true;
  navegar('vista-mapa');
  informar('Pulsa un punto en el mapa para registrar la ubicación del incidente.');
});
elemento('reporte-foto').addEventListener('change', function () {
  const archivo = this.files[0];
  if (!archivo) return;
  if (!/^image\/(png|jpeg|webp|gif)$/.test(archivo.type) || archivo.size > 200 * 1024) {
    this.value = '';
    informar('Selecciona una imagen PNG, JPG, WebP o GIF de máximo 200 KB para la demostración local.');
    return;
  }
  const lector = new FileReader();
  lector.onload = function () {
    evidenciaPendiente = String(lector.result);
    elemento('vista-foto').innerHTML = '<p class="texto-tenue">Imagen lista para revisar.</p>';
  };
  lector.readAsDataURL(archivo);
});
elemento('form-reporte').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.reportValidity()) return;
  const lat = Number(elemento('reporte-lat').value), lon = Number(elemento('reporte-lon').value);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    informar('Las coordenadas no son válidas.'); return;
  }
  borrador = {
    id: elemento('reporte-id').value,
    categoria: elemento('reporte-categoria').value,
    descripcion: elemento('reporte-descripcion').value.trim(),
    lugar: elemento('reporte-lugar').value.trim(),
    nivel: elemento('reporte-riesgo').value,
    lat: lat, lon: lon, evidencia: evidenciaPendiente
  };
  elemento('resumen-reporte').innerHTML = '<p><strong>Categoría:</strong> ' + escapar(borrador.categoria) +
    '</p><p><strong>Descripción:</strong> ' + escapar(borrador.descripcion) +
    '</p><p><strong>Lugar:</strong> ' + escapar(borrador.lugar) +
    '</p><p><strong>Coordenadas:</strong> ' + lat.toFixed(5) + ', ' + lon.toFixed(5) +
    '</p><p><strong>Estado inicial:</strong> Pendiente de verificación</p>';
  this.hidden = true;
  elemento('revisar-reporte').hidden = false;
});
elemento('editar-borrador').addEventListener('click', function () {
  elemento('revisar-reporte').hidden = true;
  elemento('form-reporte').hidden = false;
});
elemento('enviar-reporte').addEventListener('click', function () {
  if (!borrador) return;
  if (!borrador.categoria || borrador.descripcion.length < 10 || !borrador.lugar) { informar('Completa los campos del reporte.'); return; }
  if (borrador.id) {
    const r = obtenerReporte(borrador.id);
    if (!r || r.propietario !== perfil.usuario || r.estado !== 'pendiente') { informar('No puedes editar este reporte.'); return; }
    Object.assign(r, borrador);
    informar('Reporte local ' + r.id + ' editado.');
  } else {
    const id = 'L-' + Date.now().toString(36).toUpperCase();
    reportes.unshift(Object.assign({}, borrador, {
      id: id, propietario: perfil.usuario, fecha: Date.now(),
      estado: 'pendiente', confirmaciones: 0, gestion: 'Pendiente', responsable: ''
    }));
    informar('Reporte ' + id + ' guardado localmente con estado pendiente. No se envió a un servidor.');
  }
  persistirReportes();
  prepararNuevo();
  navegar('vista-reportes');
});

// PASO 7. Historial propio, edición, retiro y lista comunitaria: HU14, HU29-HU30.
function mostrarMisReportes() {
  const propios = reportes.filter(function (r) { return r.propietario === perfil.usuario; }).sort(function (a, b) { return b.fecha - a.fecha; });
  elemento('mis-reportes').innerHTML = propios.length ? propios.map(function (r) { return tarjetaReporte(r, true); }).join('') : '<p class="vacio">No tienes reportes con este identificador de demostración.</p>';
}
function mostrarComunidad() {
  const activos = reportes.filter(function (r) { return r.estado !== 'descartado'; });
  elemento('lista-comunidad').innerHTML = activos.length ? activos.map(function (r) { return tarjetaReporte(r, false); }).join('') : '<p class="vacio">No hay reportes activos.</p>';
  elemento('lista-comunicados').innerHTML = comunicados.length ? comunicados.map(function (c) {
    return '<article class="tarjeta-reporte"><h3>COMUNICADO FICTICIO</h3><p>' + escapar(c.texto) + '</p><p class="texto-tenue">' + fechaCorta(c.fecha) + '</p></article>';
  }).join('') : '<p class="vacio">No hay comunicados en esta demostración.</p>';
}
document.addEventListener('click', function (evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const id = boton.getAttribute('data-id'), accion = boton.getAttribute('data-accion');
  if (accion === 'detalle') verDetalle(id);
  if (accion === 'editar') { prepararNuevo(id); navegar('vista-nuevo'); }
  if (accion === 'retirar') {
    const r = obtenerReporte(id);
    if (!r || r.propietario !== perfil.usuario || r.estado !== 'pendiente') return;
    if (!window.confirm('¿Retirar este reporte pendiente? La operación solo se aplica a esta demostración.')) return;
    reportes = reportes.filter(function (item) { return item.id !== id; });
    persistirReportes();
    informar('Reporte retirado de la demostración local.');
  }
  if (accion === 'seleccionar-seguridad') {
    elemento('seg-reporte').value = id; actualizarFormularioSeguridad();
    navegar('vista-seguridad');
  }
});

// PASO 8. Preferencias: HU09-HU10, HU22, HU25.
function cargarPerfil() {
  elemento('perfil-usuario').value = perfil.usuario;
  elemento('perfil-rutas').value = perfil.rutas;
  elemento('perfil-radio').value = perfil.radio;
  elemento('perfil-hora-inicio').value = perfil.inicio;
  elemento('perfil-hora-fin').value = perfil.fin;
  elemento('perfil-silenciar').checked = Number(perfil.silenciarHasta) > Date.now();
}
elemento('form-perfil').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.reportValidity()) return;
  const nuevoId = elemento('perfil-usuario').value.trim();
  if (!nuevoId) { informar('Indica un identificador de demostración.'); return; }
  perfil = {
    usuario: nuevoId,
    rutas: elemento('perfil-rutas').value.trim(),
    radio: Number(elemento('perfil-radio').value),
    inicio: elemento('perfil-hora-inicio').value,
    fin: elemento('perfil-hora-fin').value,
    silenciarHasta: elemento('perfil-silenciar').checked ? Date.now() + 3600000 : 0
  };
  guardarLocal(CLAVE_PERFIL, perfil);
  refrescarTodo();
  informar('Preferencias de demostración guardadas en este navegador.');
});

// PASO 9. Notificaciones locales: HU20, HU23-HU25.
function mostrarAvisos() {
  elemento('lista-notificaciones').innerHTML = avisos.length ? avisos.map(function (a) {
    return '<article class="tarjeta-reporte"><p>' + escapar(a.texto) + '</p><p class="texto-tenue">' + fechaCorta(a.fecha) + '</p></article>';
  }).join('') : '<p class="vacio">No hay avisos de esta demostración.</p>';
}
elemento('habilitar-avisos').addEventListener('click', function () {
  if (!('Notification' in window)) { informar('Este navegador no permite notificaciones. Los avisos seguirán apareciendo en la página.'); return; }
  Notification.requestPermission().then(function (permiso) {
    informar(permiso === 'granted' ? 'Permiso concedido para notificaciones de esta página abierta.' : 'No se concedió permiso. Los avisos seguirán visibles en Comunidad.');
  }).catch(function () { informar('No se pudo solicitar el permiso de notificaciones.'); });
});

// PASO 10. Panel de personal de seguridad: HU17, HU19, HU24, HU26-HU28.
function mostrarPanelSeguridad() {
  const pendientes = reportes.filter(function (r) { return r.estado === 'pendiente'; });
  elemento('lista-pendientes').innerHTML = pendientes.length ? pendientes.map(function (r) {
    return '<article class="tarjeta-reporte"><h3>' + escapar(r.id) + ' · ' + escapar(r.categoria) +
      '</h3><p>' + escapar(r.lugar) + ' · ' + nivelVisible(r.nivel) +
      '</p><button class="boton-secundario" type="button" data-accion="seleccionar-seguridad" data-id="' + escapar(r.id) + '">Revisar incidente</button></article>';
  }).join('') : '<p class="vacio">No hay reportes pendientes.</p>';
  elemento('historial-seguridad').innerHTML = bitacora.map(function (evento) {
    return '<article class="tarjeta-reporte"><strong>' + escapar(evento.id) + '</strong><p>' +
      escapar(evento.texto) + '</p><p class="texto-tenue">' + fechaCorta(evento.fecha) + '</p></article>';
  }).join('') + reportes.filter(function (r) { return r.estado !== 'pendiente'; }).map(function (r) {
    return '<article class="tarjeta-reporte"><strong>' + escapar(r.id) + ' · ' + escapar(r.categoria) +
      '</strong><p>' + etiquetaEstado(r.estado) + ' · ' + escapar(r.gestion || 'Pendiente') +
      ' · ' + escapar(r.responsable || 'Sin asignar') + '</p></article>';
  }).join('') || '<p class="vacio">No hay verificaciones registradas.</p>';
  const selector = elemento('seg-reporte'), anterior = selector.value;
  selector.innerHTML = reportes.map(function (r) {
    return '<option value="' + escapar(r.id) + '">' + escapar(r.id) + ' · ' + escapar(r.categoria) + '</option>';
  }).join('');
  if (obtenerReporte(anterior)) selector.value = anterior;
  actualizarFormularioSeguridad();
}
function actualizarFormularioSeguridad() {
  const r = obtenerReporte(elemento('seg-reporte').value);
  elemento('seg-responsable').value = r ? (r.responsable || '') : '';
  elemento('seg-gestion').value = r ? (r.gestion || 'Pendiente') : 'Pendiente';
  elemento('seg-validar').disabled = !r || r.estado !== 'pendiente';
  elemento('seg-descartar').disabled = !r || r.estado !== 'pendiente';
}
elemento('seg-reporte').addEventListener('change', actualizarFormularioSeguridad);
elemento('form-seguridad').addEventListener('submit', function (evento) {
  evento.preventDefault();
  if (elemento('rol-demo').value !== 'seguridad') return;
  const r = obtenerReporte(elemento('seg-reporte').value);
  if (!r) return;
  r.responsable = elemento('seg-responsable').value;
  r.gestion = elemento('seg-gestion').value;
  registrarBitacora(r, 'Responsable: ' + (r.responsable || 'Sin asignar') + '. Gestión: ' + r.gestion);
  persistirReportes();
  informar('Gestión interna simulada actualizada para ' + r.id + '.');
});
function verificarComoSeguridad(nuevoEstado) {
  if (elemento('rol-demo').value !== 'seguridad') return;
  const r = obtenerReporte(elemento('seg-reporte').value);
  if (!r || r.estado !== 'pendiente') return;
  const anterior = r.estado;
  r.estado = nuevoEstado;
  registrarBitacora(r, 'Verificación: ' + anterior + ' → ' + nuevoEstado);
  cambiosEstadoPropio(r, anterior);
  persistirReportes();
  informar('Estado de verificación simulado: ' + r.id + ' → ' + nuevoEstado + '.');
}
elemento('seg-validar').addEventListener('click', function () { verificarComoSeguridad('confirmado'); });
elemento('seg-descartar').addEventListener('click', function () { verificarComoSeguridad('descartado'); });
elemento('form-comunicado').addEventListener('submit', function (evento) {
  evento.preventDefault();
  if (elemento('rol-demo').value !== 'seguridad' || !this.reportValidity()) return;
  const texto = elemento('texto-comunicado').value.trim();
  if (texto.length < 10) return;
  comunicados.unshift({ texto: texto, fecha: Date.now() });
  guardarLocal(CLAVE_COMUNICADOS, comunicados);
  notificar('COMUNICADO DE PRUEBA: ' + texto);
  this.reset();
  mostrarComunidad();
  informar('Comunicado de demostración guardado localmente. No se envió a otros usuarios.');
});

// PASO 11. Actualización automática del contenido en esta sesión: HU07.
function refrescarTodo() {
  refrescarMapaListas();
  mostrarMisReportes();
  mostrarComunidad();
  mostrarAvisos();
  mostrarPanelSeguridad();
}
window.addEventListener('storage', function (evento) {
  if (evento.key === CLAVE_REPORTES) {
    const anteriores = new Set(reportes.map(function (r) { return r.id; }));
    reportes = leerLocal(CLAVE_REPORTES, reportesIniciales);
    reportes.forEach(function (r) { if (!anteriores.has(r.id)) avisarRutasFrecuentes(r); });
    refrescarTodo();
    informar('Se actualizaron los reportes desde otra pestaña de este navegador.');
  }
  if (evento.key === CLAVE_BITACORA) {
    bitacora = leerLocal(CLAVE_BITACORA, []);
    mostrarPanelSeguridad();
  }
  if (evento.key === CLAVE_COMUNICADOS) {
    comunicados = leerLocal(CLAVE_COMUNICADOS, []);
    mostrarComunidad();
  }
});
cargarPerfil();
refrescarTodo();
