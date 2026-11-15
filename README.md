# SafeCampus — entrega web TB2 | Aegis Labs

SafeCampus es una **demostración académica** para IHC y Tecnologías Móviles (UPC). La entrega web está construida con **HTML5, CSS3 y JavaScript del navegador**, sin framework, servidor de aplicación, Node.js, SQLite, instalación de dependencias ni cuentas reales.

## Cómo abrir

1. Abre la carpeta completa del repositorio en Visual Studio Code.
2. Abre `index.html` con **Open with Live Server** (o usa cualquier servidor estático sencillo).
3. En la página de inicio pulsa **Probar SafeCampus** o **Abrir SafeCampus**.
4. En `plataforma.html` elige **Estudiante** o **Personal de seguridad** usando el selector de demostración de la cabecera. No hay autenticación real.
5. Para restablecer las pruebas, ve a **Perfil → Restablecer datos ficticios**.

Dirección de ejemplo con Live Server: `http://127.0.0.1:5500/index.html`. **No ejecutes `npm start` ni instales Node.js**: el proyecto funciona desde un servidor estático.

## Alcance funcional

Se proponen interacciones de las 30 HU core indicadas en el informe de Aegis Labs. La implementación está adaptada a un prototipo, no a un sistema de seguridad real. Consulta [PRUEBAS-TB2.md](PRUEBAS-TB2.md) para las pruebas de cada HU.

- **HU01–HU08:** mapa de riesgos de demostración, detalles, filtros de categoría y antigüedad, búsqueda por distrito, capa ilustrativa de calor, cambios locales visibles en otras pestañas del mismo origen y restablecimiento de vista.
- **HU09–HU10:** configuración de zonas habituales y horarios de aviso.
- **HU11–HU15:** creación de reportes ficticios, imagen opcional, selección manual en mapa, edición de reportes propios pendientes y obtención de coordenadas por GPS cuando exista permiso.
- **HU16–HU21:** confirmación comunitaria simulada, gestión de verificación, distintivos, historial de acciones, notificaciones al creador y estado inicial pendiente.
- **HU22–HU25:** distancia de alerta, prueba de cercanía y notificaciones locales con la página abierta, comunicados ficticios y silenciamiento temporal.
- **HU26–HU28:** vista ficticia del personal de seguridad para revisar, asignar responsables y actualizar atención/verificación.
- **HU29–HU30:** historial de reportes propios y retiro de reportes pendientes.

## Datos, transparencia y seguridad

- Se precargan **tres incidentes inventados** (`D-021`, `D-022`, `D-023`) para poder probar los flujos sin datos personales.
- Los cambios se conservan en el **almacenamiento local del navegador** y pueden observarse desde otras pestañas del mismo origen. No se sincronizan entre teléfonos ni equipos.
- El selector de roles es solo una **simulación de interfaces**: no concede permisos reales, y la aplicación no contiene autenticación.
- No existe backend, base de datos institucional ni confirmación de incidentes reales. Las alertas no son push remotas y no funcionan con la página cerrada.
- No se debe publicar información personal o incidentes reales. **No utilices esta página para decidir que una zona es segura.**
- Para dibujar calles, el mapa utiliza Leaflet y teselas OpenStreetMap desde Internet. Cuando no cargan, la lista de reportes continúa disponible. Las fuentes tipográficas de Manrope también se descargan desde Google Fonts al tener conexión.
- La ubicación GPS depende del permiso del navegador y de la precisión del dispositivo; no supone una alerta de emergencia.
- Las imágenes de prueba se almacenan localmente y pueden ocupar espacio del navegador. El formulario limita cada evidencia a 200 KB.

## Estructura

- `index.html` + `css/estilos.css` + `js/mapa.js` + `js/menu.js`: Landing Page responsive.
- `plataforma.html` + `css/plataforma.css` + `js/plataforma.js`: plataforma responsive y flujos de interacción.
- `js/demo-api.js`: estados de la demostración, validaciones, persistencia local y acciones de perfiles ficticios. No envía solicitudes a un servidor de SafeCampus.
- `imágenes/`: logotipo, favicon e iconos.
- `PRUEBAS-TB2.md`: guía de verificación de las 30 historias core en escritorio y móvil.

## Validación

Se revisó la sintaxis de los dos archivos JavaScript principales y se ejecutaron 12 pruebas programáticas de la lógica de datos: creación, edición, evidencia, confirmación, estados, avisos, gestión, permisos simulados, retiro, validaciones y restablecimiento. **Esto no equivale a haber completado una prueba E2E visual en Brave ni a validar pixel por pixel contra Figma**. Las verificaciones manuales del archivo `PRUEBAS-TB2.md` deben marcarse con evidencia antes de sustentar.

## Git y actualización local

Luego de aprobar e integrar el pull request a `develop`, actualiza tu copia de VS Code con:

```powershell
git switch develop
git pull --ff-only origin develop
```

Abre `index.html` con Live Server. No se requiere `npm install`.

## Entrega

Este repositorio contiene únicamente un prototipo web de aprendizaje; **no** una aplicación real de reporte o vigilancia. Para la sustentación, diferenciar claramente la visualización interactiva, los efectos simulados de cada HU y las limitaciones sin backend.
