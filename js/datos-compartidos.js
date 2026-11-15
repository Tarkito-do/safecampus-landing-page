/*
  SafeCampus | Aegis Labs
  Fuente única de datos ficticios para la vista previa y la plataforma.
  No son reportes reales; se muestran solo para demostrar los flujos.
*/
(function () {
  'use strict';
  const clave = 'safecampus-demo-reportes-v1';
  const centro = [-12.0464, -77.0428];

  function iniciales() {
    const ahora = Date.now();
    return [
      { id: 'D-021', categoria: 'Robo', descripcion: 'EJEMPLO FICTICIO: reporte de prueba para explorar la interfaz.', lugar: 'Centro de Lima (simulado)', lat: -12.0475, lon: -77.0403, nivel: 'alto', fecha: ahora - 35 * 60000, estado: 'pendiente', propietario: 'demo@universidad.edu', confirmaciones: 0, gestion: 'Pendiente', responsable: '', evidencia: '' },
      { id: 'D-022', categoria: 'Iluminación', descripcion: 'EJEMPLO FICTICIO: iluminación insuficiente descrita con fines académicos.', lugar: 'Cercado de Lima (simulado)', lat: -12.0524, lon: -77.0346, nivel: 'medio', fecha: ahora - 3 * 3600000, estado: 'confirmado', propietario: 'otra-cuenta@universidad.edu', confirmaciones: 2, gestion: 'En atención', responsable: 'Equipo A', evidencia: '' },
      { id: 'D-023', categoria: 'Acoso', descripcion: 'EJEMPLO FICTICIO: ubicación y descripción no corresponden a un suceso real.', lugar: 'Pueblo Libre (simulado)', lat: -12.0762, lon: -77.0622, nivel: 'bajo', fecha: ahora - 2 * 86400000, estado: 'pendiente', propietario: 'otra-cuenta@universidad.edu', confirmaciones: 0, gestion: 'Pendiente', responsable: '', evidencia: '' }
    ];
  }

  function leer() {
    try {
      const datos = JSON.parse(localStorage.getItem(clave));
      return Array.isArray(datos) ? datos : iniciales();
    } catch (error) {
      return iniciales();
    }
  }

  window.SafeCampusDatos = Object.freeze({
    clave: clave,
    centro: centro,
    iniciales: iniciales,
    leer: leer
  });
}());
