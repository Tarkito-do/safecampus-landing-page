'use strict';
/* Las pruebas de contrato comprueban referencias y eventos en el código; NO sustituyen pruebas E2E. */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'plataforma.html'),'utf8');const client=fs.readFileSync(path.join(root,'js/plataforma.js'),'utf8');const api=fs.readFileSync(path.join(root,'server.js'),'utf8');const css=fs.readFileSync(path.join(root,'css/plataforma.css'),'utf8');
const cases=[
['HU01 Mapa GPS',html,/id="risk-map"/],
['HU02 Detalle de marcador',client,/bindPopup\(popup\)/],
['HU03 Filtro por categoría',client,/filter-category/],
['HU04 Filtro por antigüedad',client,/filter-age/],
['HU05 Búsqueda distritos',client,/async function searchLocation/],
['HU06 Capa de calor',client,/heat-dot/],
['HU07 Sincronización',client,/new EventSource/],
['HU08 Reiniciar filtros',client,/reset-map/],
['HU09 Rutas habituales',client,/function renderRoutes/],
['HU10 Horario personalizado',client,/function timeAllowed/],
['HU11 Registrar incidentes',api,/if\(p==='\/api\/reports'&&method==='POST'\)/],
['HU12 Evidencia y vista previa',client,/function previewPhoto/],
['HU13 Selección manual',client,/confirm-point/],
['HU14 Edición exclusiva',api,/Solo puedes editar reportes propios pendientes/],
['HU15 GPS de reporte',client,/report-gps/],
['HU16 Confirmación única',api,/INSERT OR IGNORE INTO confirmations/],
['HU17 Descarte por seguridad',api,/verification==='descartado'/],
['HU18 Etiquetas de estado',client,/badge \$\{state\}/],
['HU19 Historial',client,/table-wrap/],
['HU20 Aviso de descarte al creador',api,/Tu reporte \$\{id\} cambió/],
['HU21 Confianza inicial',api,/Pendiente; 0 confirmaciones/],
['HU22 Radio configurable',api,/radius<100\|\|radius>5000/],
['HU23 Alertas cercanas',client,/function checkProximity/],
['HU24 Comunicados oficiales',api,/if\(p==='\/api\/notices'&&method==='POST'\)/],
['HU25 Silenciar temporalmente',client,/quick-mute-duration/],
['HU26 Panel de incidentes',api,/\/api\/security\/reports/],
['HU27 Asignar responsable',client,/elements\.assignee/],
['HU28 Actualizar atención',api,/attention=\?/],
['HU29 Historial propio',client,/my-reports/],
['HU30 Retirar pendientes',api,/withdrawn=1/]
];
for(const [title,src,re] of cases)test('Contrato estructural '+title,()=>assert.match(src,re));
test('Diseño responsive de pantallas móviles',()=>{assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/@media\(max-width:370px\)/)});
test('Sin credenciales de seguridad incluidas en la UI',()=>assert.doesNotMatch(html,/SECURITY_PASSWORD|long-password-for-security/));
