// PASO 1. DOM: identificar los elementos del menú.
const botonMenu = document.querySelector('#boton-menu');
const navegacion = document.querySelector('#navegacion');
const textoMenu = document.querySelector('#texto-menu');
const pantallaMovil = window.matchMedia('(max-width: 780px)');

// PASO 2. Abrir o cerrar el menú móvil con un mismo procedimiento.
function cambiarMenu(abrir) {
  const abrirEnMovil = pantallaMovil.matches && abrir;
  navegacion.classList.toggle('abierta', abrirEnMovil);
  botonMenu.setAttribute('aria-expanded', String(abrirEnMovil));
  botonMenu.setAttribute('aria-label', abrirEnMovil ? 'Cerrar menú' : 'Abrir menú');
  textoMenu.textContent = abrirEnMovil ? 'Cerrar' : 'Menú';
}

// PASO 3. Alternar el menú al pulsar el botón hamburguesa.
botonMenu.addEventListener('click', function () {
  cambiarMenu(botonMenu.getAttribute('aria-expanded') !== 'true');
});

// PASO 4. Cerrar el menú después de navegar a una sección.
navegacion.addEventListener('click', function (evento) {
  if (!evento.target.closest('a')) return;
  cambiarMenu(false);
});

// PASO 5. Escape cierra la navegación y devuelve el foco al botón.
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && botonMenu.getAttribute('aria-expanded') === 'true') {
    cambiarMenu(false);
    botonMenu.focus();
  }
});

// PASO 6. Ajustar el menú cuando cambia el tamaño de pantalla.
pantallaMovil.addEventListener('change', function () { cambiarMenu(false); });
cambiarMenu(false);

// PASO 7. Los marcadores del mapa de respaldo son solamente ejemplos.
// Al cargar el mapa real se ocultan; NO representan incidentes reales.
const mensajeMapa = document.querySelector('#mensaje-mapa');
document.querySelectorAll('.marcador').forEach(function (marcador) {
  marcador.addEventListener('click', function () {
    const nivel = marcador.dataset.nivel;
    mensajeMapa.textContent = 'Nivel ' + nivel + ' — ejemplo ilustrativo, no corresponde a un reporte real.';
    mensajeMapa.hidden = false;
  });
});
