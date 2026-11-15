# SafeCampus — Landing Page y plataforma de demostración (Aegis Labs)

Aplicación web académica desarrollada para **IHC y Tecnologías Móviles (UPC)**. Conserva el Landing Page original y agrega una plataforma multiusuario para recorrer las **30 historias de usuario** documentadas en el informe de Aegis Labs, agrupadas en seis épicas. La interfaz utiliza la identidad de SafeCampus, el escudo azul con pin rojo y Manrope; se contrastó con mock-ups Android Core y Security del material del curso.

> **Advertencia:** es un prototipo académico. Los reportes introducidos no están corroborados por las autoridades y no deben usarse para determinar si un lugar es seguro. No registrar incidentes reales ni datos personales sensibles. El funcionamiento técnico de un escenario no equivale a su validación institucional.

## Requisitos

- **Node.js 22.13 o posterior** (incluye `node:sqlite`); no hay paquetes npm externos que instalar.
- Navegador moderno. Para el mapa en línea se necesita Internet; Leaflet y OpenStreetMap son servicios externos.
- Dos navegadores/perfiles para probar reportes compartidos y sincronización.

## Inicio en Windows (PowerShell de VS Code)

Abre **la carpeta completa** `safecampus-landing-page` en VS Code (Archivo > Abrir carpeta). Luego ejecuta lo siguiente en su terminal:

```powershell
node --version
$env:SECURITY_EMAIL="seguridad@ejemplo.edu.pe"
$env:SECURITY_PASSWORD="COLOCA_AQUI_UNA_CLAVE_PRIVADA_LARGA"
npm test
npm start
```

Abre `http://127.0.0.1:3000` para el Landing Page o `http://127.0.0.1:3000/plataforma.html` para la plataforma.

**No ejecutes `plataforma.html` haciendo doble clic ni mediante Live Server 5500**: las nuevas funciones de reportes compartidos requieren el servidor `server.js` (puerto 3000 por defecto). Crea al menos dos cuentas de estudiante desde la página y usa las credenciales del entorno para entrar como seguridad. Las contraseñas no se muestran en el sitio ni se incluyen en el repositorio.

La base de datos SQLite se crea automáticamente en `.datos/safecampus.sqlite`. Esta carpeta está ignorada por Git; **no la borres** si quieres conservar cuentas y reportes de prueba. Para un servidor accesible desde otros equipos debes configurar `HOST=0.0.0.0`, HTTPS, controles de seguridad adicionales y un despliegue apropiado; esta versión no está certificada para producción.

## Arquitectura

- `index.html`, `css/estilos.css`, `js/menu.js`, `js/mapa.js`, `imágenes/`: Landing Page original preservado.
- `plataforma.html`, `css/plataforma.css`, `js/plataforma.js`: vistas responsive y lógica del cliente.
- `server.js`: API HTTP con sesiones mediante cookie HttpOnly/SameSite, contraseñas con `scrypt`, roles, eventos SSE, reportes, confirmaciones, evidencia de imagen y auditoría.
- `tests/api.test.js`: pruebas automatizadas de endpoints, permisos, reportes, sincronización SSE y validaciones.
- `tests/contracts.test.js`: presencia estructural de controles vinculados a HU01–HU30. **No son pruebas de aceptación completas ni de navegador**.

## Las 30 HU: ubicación de cada flujo

| HU | Flujo principal |
|---|---|
| 01–02 | Mapa con geolocalización y detalles de incidentes |
| 03–04 | Filtros de categoría y antigüedad |
| 05–06 | Búsqueda por zona y densidad visual |
| 07–08 | Eventos SSE entre sesiones y restablecer mapa/filtros |
| 09–10 | Perfil: zonas habituales y horario de alertas |
| 11–15 | Reportes: crear, evidencia, elección manual, editar, GPS |
| 16–21 | Confirmaciones, descarte, estados, historial, avisos al autor, estado inicial |
| 22–25 | Radio, avisos de cercanía en página abierta, comunicados, silencio |
| 26–28 | Panel seguro: revisar, asignar responsable, actualizar gestión |
| 29–30 | Mis reportes y retiro de reportes propios pendientes |

La visualización de mapas requiere Leaflet/OpenStreetMap cargados desde Internet. La búsqueda de distritos comunes en Lima tiene ubicaciones locales y una consulta opcional al servicio de Nominatim para otros lugares. La capa de calor es un **cálculo ilustrativo sobre reportes de la base**, no una medición de criminalidad real.

## Límites técnicos conocidos que deben resolverse antes de un uso real

1. **HU23/24:** los avisos del navegador se muestran mientras el sitio está abierto y con los permisos correspondientes. **No hay Web Push en segundo plano con service worker, VAPID y suscripciones ni SMS externos**. No prometas recibir alertas con el navegador cerrado.
2. **HU09/24:** los destinatarios de comunicados se determinan según **zonas habituales declaradas en el perfil**, no mediante geocercas certificadas. Usuarios sin zona declarada no reciben avisos dirigidos por zona.
3. **HU05:** la búsqueda de geocodificación por Internet depende del proveedor externo y debe respetar sus límites; para uso intensivo se necesita un servicio gestionado adecuado.
4. **HU17/26:** el rol seguridad está protegido por cuenta y sesión del servidor, pero requiere aprobación/administración de personal, recuperación de cuentas, rate limiting, monitoreo y seguridad de producción.
5. **HU12:** las imágenes se limitan a 200 KB y se almacenan dentro de SQLite; no existe escaneo antimalware ni moderación institucional.
6. **HU07:** SSE sincroniza clientes conectados a **una instancia** del servidor. Para un despliegue distribuido se necesita mensajería compartida/pub-sub.
7. Falta ejecutar la validación E2E completa en navegadores reales y comprobar comportamiento móvil con herramientas accesibles; el entorno utilizado para crear esta versión bloqueó navegación automatizada local.

## Pruebas

```powershell
npm test
```

Se incluyen pruebas de API y contratos estructurales. Para validar funcionalidad real entre dos personas se requieren dos sesiones: una persona registra un reporte, otra lo confirma, y una cuenta autorizada lo revisa. Comprueba también los casos de error, las funciones de GPS y el comportamiento responsive en un móvil.

No hay integración con servicios de emergencias, operadores universitarios reales ni una base oficial de zonas de riesgo. Mantén la advertencia de datos no verificados siempre visible.

## Publicación en GitHub

Los cambios están preparados para la rama `feature/hu01-hu30-plataforma` a partir de `develop`; no es necesario sustituir el Landing Page existente. Tras integrar el pull request aprobado:

```powershell
git switch develop
git pull --ff-only origin develop
npm test
npm start
```
