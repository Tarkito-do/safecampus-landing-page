# SafeCampus TB2 — matriz de pruebas de aceptación (30 HU core)

Fuente: informe Aegis Labs en la carpeta **TRABAJO** del curso; 30 historias agrupadas en seis épicas. Esta matriz documenta lo que debe mostrarse y probarse en la versión web estática. **Las pruebas manuales del navegador se encuentran pendientes de ejecutar en el equipo de entrega**, aunque se hicieron 12 verificaciones programáticas de la lógica local.

**Entorno:** VS Code + Live Server; `index.html` → `plataforma.html`; navegador de escritorio y emulación móvil de 390 × 844 px. No instalar Node.js. Todos los datos deben ser ficticios. En **Perfil → Restablecer datos ficticios** se vuelve al estado inicial.

| HU | Historia de usuario | Prueba de aceptación en la demo |
|---|---|---|
| HU01 | Visualización del mapa interactivo de zonas | Mapa de Lima visible, con zoom y marcadores ficticios. Si falla Internet, lista disponible. |
| HU02 | Consulta de detalles de una zona de riesgo | Pulsar marcador o «Ver detalle»: categoría, ubicación, fecha, riesgo y estado visibles. |
| HU03 | Filtrado de zonas de riesgo por categoría | Elegir categoría y comprobar cambio de marcadores y lista. |
| HU04 | Filtrado de zonas de riesgo por antigüedad | Elegir un periodo y comprobar filtrado temporal de incidentes. |
| HU05 | Búsqueda manual de zonas por distrito o avenida | Buscar «Miraflores» y comprobar centrado del mapa; sin resultados muestra aviso. |
| HU06 | Visualización de capas de calor en el mapa | Activar y desactivar capa de densidad ilustrativa construida con reportes ficticios. |
| HU07 | Actualización en tiempo real del mapa de riesgo | Abrir dos pestañas del **mismo origen**, registrar un reporte y ver actualización sin recargar. Simulación local, no sincronización multi-equipo. |
| HU08 | Restablecer vista y filtros predeterminados del mapa | Pulsar «Restablecer vista» y comprobar filtros vacíos, centro Lima y capa desactivada. |
| HU09 | Configuración de preferencias de rutas habituales | Guardar zonas habituales en Perfil y ver coincidencias preventivas en mapa. |
| HU10 | Personalización de alertas preventivas por horario | Cambiar franja horaria y comprobar que «Simular cercanía» respete el horario. |
| HU11 | Registro de incidentes comunitarios | Crear reporte ficticio con campos válidos; aparece en «Mis reportes» como pendiente. |
| HU12 | Adjuntar evidencia fotográfica a un reporte | Adjuntar JPG/PNG/WebP menor a 200 KB y ver su vista previa/detalle. Se rechaza un archivo superior al límite. |
| HU13 | Selección manual de la ubicación de un incidente | «Elegir en mapa» → pulsar mapa → «Confirmar ubicación»: latitud y longitud se completan. |
| HU14 | Edición de reportes comunitarios propios | Editar propio pendiente y observar cambios; los confirmados no permiten edición. |
| HU15 | Registro automático de la ubicación mediante GPS | «Usar GPS» completa coordenadas tras permiso; si se rechaza, aparece error comprensible. |
| HU16 | Verificación y confirmación de reportes comunitarios | Confirmar D-023 desde estudiante: aumenta contador; no permite auto-confirmación ni duplicados. |
| HU17 | Marcado y descarte de reportes falsos por seguridad | Vista seguridad → seleccionar pendiente → verificar como descartado: desaparece del listado activo y se registra historial. |
| HU18 | Visualización de indicadores del estado de validación | Comprobar distintivos pendiente/confirmado/descartado en tarjetas y detalle. |
| HU19 | Registro del historial de verificación de incidentes | Revisar detalle e historial en seguridad; aparecen las acciones y fechas de prueba. |
| HU20 | Notificación de reporte desacreditado a creador | En seguridad descartar D-021; volver a estudiante → Comunidad → Mis avisos: alerta ficticia. |
| HU21 | Asignación automática de confianza inicial a reportes | Al crear un reporte su estado inicial es pendiente y tiene cero confirmaciones. |
| HU22 | Configuración de radio de distancia para alertas preventivas | En Perfil elegir radio permitido y guardar; la simulación usa esa distancia. |
| HU23 | Recepción de alertas y notificaciones push por proximidad | En mapa activar/simular cercanía; con permiso puede aparecer notificación **local con página abierta**. No es push remoto. |
| HU24 | Envío de boletines de alerta institucional por seguridad | En seguridad publicar comunicado ficticio dirigido a una zona; se ve en Comunidad. |
| HU25 | Silenciamiento temporal de notificaciones de seguridad | Silenciar en mapa o Perfil y probar cercanía: se informa que la alerta está silenciada. |
| HU26 | Visualización de incidentes en panel operativo de seguridad | Seleccionar rol ficticio «Personal de seguridad» y revisar incidentes pendientes. |
| HU27 | Asignación de incidentes a responsables de atención | Seleccionar un reporte, introducir «Equipo A» y guardar; aparece en historial. |
| HU28 | Actualización del estado de atención de incidentes | Cambiar Pendiente → En atención y guardar; verificar nuevo estado. |
| HU29 | Consulta del historial de reportes comunitarios propios | Estudiante → Mis reportes: aparecen reportes propios, incluidos los retirados. |
| HU30 | Retiro de reportes comunitarios propios pendientes de verificación | Retirar uno pendiente, confirmar; deja de figurar en mapa y sigue como retirado en mis reportes. |

## Verificaciones transversales

- [ ] **Escritorio:** 1366 × 768 o superior, sin desbordamientos; cabecera, mapa y tarjetas.
- [ ] **Móvil:** 390 × 844 y 320 px de ancho, sin desplazamiento horizontal; formularios y navegación accesibles.
- [ ] **Teclado:** tabulación, foco visible, etiquetas de campos, botones activables con Enter/Espacio.
- [ ] **Estados vacíos y errores:** ausencia de coincidencias, falta de GPS, archivo grande, campo obligatorio.
- [ ] **Accesibilidad a11y:** lectura de mensajes de estado; controles con nombres accesibles.
- [ ] **Persistencia:** recargar mantiene cambios en el mismo navegador; «Restablecer datos ficticios» elimina el estado anterior.
- [ ] **Transparencia:** avisos «Datos ficticios» visibles; nunca presentar incidentes inventados como reales.
- [ ] **Figma:** comparación manual de cada pantalla requerida con la versión vigente del archivo de diseño (no realizada automáticamente).

## Limitaciones que se deben comunicar al evaluador

Esta es una **simulación funcional**. No hay acceso institucional a datos de seguridad ni perfiles reales, comunicación entre equipos distintos, geocercas verificadas o notificaciones push con el navegador cerrado. El mapa muestra geografía real, pero los incidentes son ficticios. El selector de rol no es autenticación; no debe tratarse como una protección de información sensible.

## Evidencias de pruebas automatizadas efectuadas en esta revisión

Se ejecutaron 12 comprobaciones aisladas de lógica local y todas pasaron: estado inicial, preferencias, validación de coordenadas, publicación, edición con conservación de evidencia, confirmación sin duplicados, simulación de rol, gestión de incidentes, comunicados, avisos/leídos, retiro y reinicio de datos. También se verificó la sintaxis JavaScript. **No hay evidencia de ejecución automatizada de navegación real ni de contraste completo con Figma**; los casilleros manuales anteriores no deben marcarse sin inspección.
