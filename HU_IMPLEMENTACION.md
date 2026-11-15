# SafeCampus — matriz de implementación de las 30 historias de usuario

**Proyecto:** Aegis Labs — IHC y Tecnologías Móviles (UPC)  
**Alcance:** 30 HU autorizado por el docente según indicación del equipo.  
**Base:** Product Backlog del informe AV1 actualizado en Drive el 13/11/2026 y mock-ups exportados de Figma almacenados en la carpeta TRABAJO.  
**Rama de trabajo:** feature/hu-workflows-demo (parte de develop).

## Acceso

- El Landing Page original permanece en \`index.html\`.
- Desde el menú **Probar funciones** o el botón al final de Beneficios se abre \`plataforma.html\`.
- La demostración contiene pantallas adaptadas a los mock-ups de Android/iOS: mapa, detalle de incidente, nuevo reporte, mis reportes, comunidad, perfil, alertas y panel operativo de seguridad.
- El archivo \`css/plataforma.css\` establece la presentación responsive y \`js/plataforma.js\` las interacciones.

## Trazabilidad de las 30 HU

La columna «Estado» NO significa que exista un servicio real de producción. «Demo» indica una interacción funcional local; «Parcial» significa que aún falta un criterio real importante.

| HU | Funcionalidad | Pantalla | Estado y límites |
|---|---|---|---|
| HU01 | Ver mapa de zonas y reportes | Mapa | Demo: pines geográficos ficticios sobre Leaflet / OpenStreetMap |
| HU02 | Seleccionar un reporte y ver detalles | Mapa / Detalle | Demo: categoría, descripción, fecha, ubicación, estado |
| HU03 | Filtrar por tipo de incidente | Mapa | Demo: Robo, Acoso, Iluminación, Otro |
| HU04 | Filtrar incidentes por antigüedad | Mapa | Demo: 24 horas, 7 o 30 días |
| HU05 | Buscar riesgos por distrito o avenida | Mapa | Parcial: busca texto en lugares de reportes cargados; no es geocodificador |
| HU06 | Capa de densidad histórica | Mapa | Parcial: círculos de densidad demostrativa, no heatmap estadístico histórico |
| HU07 | Actualizar mapa al recibir un nuevo reporte | Mapa | Parcial: actualización inmediata local y entre pestañas del mismo navegador; no sincronización entre dispositivos |
| HU08 | Limpiar filtros | Mapa | Demo: restablece todos los filtros visibles |
| HU09 | Guardar rutas o distritos frecuentes | Perfil / Avisos | Parcial: guarda preferencias y avisa de reportes coincidentes que lleguen desde otra pestaña; no rutas calculadas |
| HU10 | Configurar horarios de alerta | Perfil | Demo: horario inicial/final, incluso franjas que cruzan medianoche |
| HU11 | Registrar incidentes | Nuevo reporte | Demo: formulario validado y almacenamiento local |
| HU12 | Adjuntar fotografías | Nuevo reporte | Demo: archivos de imagen hasta 200 KB; se guardan localmente |
| HU13 | Seleccionar ubicación manual en mapa | Nuevo reporte / Mapa | Demo: pulsar ubicación y volver al formulario |
| HU14 | Editar un reporte propio pendiente | Mis reportes | Demo: modifica solo cuando sigue pendiente |
| HU15 | Capturar GPS al registrar incidente | Nuevo reporte | Demo: geolocalización solicitada con permiso del navegador |
| HU16 | Confirmar información comunitariamente | Detalle | Demo: una confirmación por identificador y sesión; no identidad real |
| HU17 | Descartar reportes falsos (seguridad) | Panel operativo | Demo: rol de seguridad simulado; no autenticación/autorización |
| HU18 | Distinguir verificación pendiente/confirmada | Tarjetas / Detalle | Demo: estados y etiquetas visibles |
| HU19 | Consultar historial de verificaciones | Panel operativo | Parcial: bitácora en este navegador; no auditoría central inmutable |
| HU20 | Aviso sobre validación o descarte propio | Comunidad / Avisos | Parcial: aviso local tras cambio de estado en esta demostración; no push remoto |
| HU21 | Estado inicial de reporte | Nuevo reporte / Mis reportes | Demo: siempre «pendiente» al publicar |
| HU22 | Configurar radio de cercanía | Perfil | Demo: radio 100–5000 m usado en alertas cercanas |
| HU23 | Avisos push al acercarse a incidentes | Mapa / Comunidad | Parcial: seguimiento GPS opcional en página abierta y prueba «Simular cercanía»; sin push de fondo |
| HU24 | Emitir alertas oficiales masivas | Panel operativo / Comunidad | Parcial: comunicados solo locales; no envío masivo real |
| HU25 | Silenciar notificaciones temporalmente | Perfil | Demo: silencio por 1 hora y comprobación de horario |
| HU26 | Panel para revisar incidentes | Panel operativo | Demo: lista de pendientes y acceso a reportes |
| HU27 | Asignar integrante de seguridad | Panel operativo | Demo: equipos A/B/C simulados; sin cuentas reales |
| HU28 | Actualizar estado de atención | Panel operativo | Demo: Pendiente / En atención / Atendido |
| HU29 | Consultar mis reportes | Mis reportes | Demo: filtra por identificador simulado |
| HU30 | Retirar reportes propios pendientes | Mis reportes | Demo: confirma retiro y quita el reporte local |

## Referencias de diseño revisadas

Recursos de la carpeta **TRABAJO**, subcarpeta del Drive del curso:
- \`Android — Core Mobile Mock-ups.png\` (inicio, mapa, detalle, reporte, perfil y alertas).
- \`Android — Security Mobile Mock-ups.png\` (panel, revisión, asignación).
- \`iOS — Comparative Mobile Mock-ups.png\` (mapa y formulario).
- \`Wireflow — Consulta preventiva de riesgos.png\`.
- \`Wireflow — Registro comunitario de incidente.png\`.
- \`Mobile Landing Page Mock-up.png\` y \`Desktop Landing Page Mock-up.png\` como referencia del sitio original.

La URL del **archivo editable de Figma** no estaba localizada en el informe consultado; los PNG son exportaciones de referencia, no una inspección en vivo del archivo Figma.

## Pruebas manuales recomendadas

1. Abrir el proyecto con Live Server y entrar a \`plataforma.html\` desde el Landing.
2. Comprobar que aparecen mapa de Lima y los tres reportes rotulados ficticios.
3. Seleccionar un marcador; abrir su detalle; confirmar un reporte ajeno pendiente una vez.
4. Filtrar por categoría, tiempo, buscar distrito y limpiar filtros.
5. Activar «Capa de densidad» y después desactivarla.
6. Abrir «+ Reportar»; probar formulario vacío (debe impedir el envío).
7. Escribir una categoría y descripción; indicar coordenadas mediante selección manual o GPS.
8. Guardar localmente y comprobar estado «pendiente» en Mis reportes.
9. Editar ese reporte, guardarlo y comprobar los datos.
10. Crear otro y retirarlo; no debe aparecer en los reportes activos.
11. Guardar perfil con radio, rutas y horario; verificar persistencia al recargar.
12. Pulsar «Simular cercanía»; leer aviso, y luego probar silencio de una hora.
13. Cambiar a rol «Personal de seguridad» (solo demonstración); revisar pendientes.
14. Asignar equipo y gestión, validar o descartar un reporte.
15. Revisar la bitácora y los avisos; publicar un comunicado simulado.
16. Abrir una segunda pestaña y crear un reporte: comprobar sincronización local por evento \`storage\`.
17. Revisar las pantallas en DevTools a 390 × 844 px y en escritorio.

## Límites y seguridad

- Los incidentes iniciales **son ficticios**, no son denuncias verificadas.
- Las operaciones se guardan en el almacenamiento local del navegador; no hay backend, usuarios autenticados, autorización real de seguridad, sincronización entre dispositivos, notificaciones push de fondo ni comunicados masivos reales.
- No almacenar información privada real, fotografías personales sensibles ni reportes verdaderos de seguridad en esta demostración.
- Geolocalización solo bajo acción/permiso explícitos. El seguimiento opcional se detiene desde el botón o al cerrar la pestaña.
- Se requieren pruebas manuales del navegador y comparación más detallada con el Figma editable antes de dar por completado el trabajo final.
- \`main\` y \`develop\` permanecen sin alterar. La rama de funcionalidad no se ha fusionado todavía.
