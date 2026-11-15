/* Comprobaciones automáticas del prototipo TB2.
 * Node se usa SOLO en el runner de pruebas de GitHub, no para ejecutar la web. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const text = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const html = text('plataforma.html');
const js = text('js/plataforma.js');
const adapter = text('js/demo-api.js');
const css = text('css/plataforma.css');

function setup() {
  const store = new Map(), session = new Map(), listeners = {};
  const localStorage = {
    getItem: k => store.has(k) ? store.get(k) : null,
    setItem: (k,v) => {store.set(k,String(v));},
    removeItem: k => {store.delete(k);}
  };
  const sessionStorage = {
    getItem: k => session.get(k) || null,
    setItem: (k,v) => session.set(k,String(v))
  };
  const window = {
    addEventListener: (name,cb) => (listeners[name] ||= []).push(cb),
    dispatchEvent: e => (listeners[e.type] || []).forEach(cb=>cb(e))
  };
  const context = {window,localStorage,sessionStorage,location:{origin:'http://localhost:5500'},Event,URL};
  vm.runInNewContext(adapter,context,{filename:'demo-api.js'});
  const api=(route,method='GET',body)=>window.SafeCampusDemo.request(route,{method,body:body===undefined?undefined:JSON.stringify(body)});
  return {window,api,store};
}

test('El sitio web es estático, con landing y sin dependencias de servidor',()=>{
  assert.match(text('index.html'),/href="plataforma\.html"/);
  assert.match(html,/src="js\/demo-api\.js"/);
  assert.match(html,/src="js\/plataforma\.js"/);
  assert.doesNotMatch(js,/new EventSource\(/);
  assert.doesNotMatch(js,/fetch\(['"]\/api/);
  assert.match(html,/Datos ficticios|datos ficticios/);
  assert.match(html,/role="note"/);
});

test('Existen controles visibles para las seis épicas y 30 HU',()=>{
  for(const id of ['risk-map','filter-category','filter-age','filter-place','heat-toggle','reset-map',
    'report-form','report-gps','choose-map','report-photo','report-review','my-reports','report-detail',
    'report-history','alerts-near','simulate-near','quick-mute','settings-form','security-form',
    'security-history','security-report','notice-form','community-notices','community-reports',
    'permission-notifications','reset-demo']){
    assert.ok(html.includes('id="'+id+'"'),'Falta '+id);
  }
  assert.match(js,/id="demo-role"/);
  assert.match(css,/@media\s*\(max-width:\s*700px\)/);
  assert.match(css,/@media\s*\(max-width:\s*370px\)/);
  assert.match(css,/:focus-visible/);
});

test('El navegador recibe datos ficticios de ejemplo y preferencias',async()=>{
  const {api}=setup();
  const all=await api('/reports');
  assert.equal(all.reports.length,3);
  assert.equal(all.reports.find(x=>x.id==='D-021').verification,'pendiente');
  const prefs=await api('/preferences','PATCH',{routes:'Lima',hour_start:'08:00',hour_end:'22:00',radius:500,mute_until:0});
  assert.equal(prefs.radius,500);
  assert.equal(prefs.routes,'Lima');
});

test('Rechaza coordenadas vacías y crea reportes pendientes válidos',async()=>{
  const {api}=setup();
  const example={category:'Acceso',description:'EJEMPLO FICTICIO para pruebas en SafeCampus',risk:'medio',district:'Lima',lat:'',lon:''};
  await assert.rejects(api('/reports','POST',example),/latitud|Coordenadas/i);
  const created=await api('/reports','POST',{...example,lat:-12.0475,lon:-77.0428});
  assert.equal(created.report.verification,'pendiente');
  assert.equal(created.report.confirmations,0);
  assert.ok((await api('/reports?mine=1')).reports.some(x=>x.id===created.report.id));
});

test('Permite editar propios pendientes y conservar evidencia',async()=>{
  const {api}=setup();
  const body={category:'Robo',description:'Incidente completamente ficticio para prueba',risk:'medio',district:'Lima',lat:-12.04,lon:-77.04,photo:'data:image/png;base64,AAAA'};
  const created=await api('/reports','POST',body);
  const updated=await api('/reports/'+created.report.id,'PATCH',{...body,description:'Texto editado del incidente ficticio',photo:null});
  assert.match(updated.report.description,/editado/);
  assert.equal(updated.report.photo,body.photo);
});

test('Impide auto-confirmar y duplicar confirmaciones de otros reportes',async()=>{
  const {api}=setup();
  await assert.rejects(api('/reports/D-021/confirm','POST'),/confirmar/i);
  const once=await api('/reports/D-023/confirm','POST');
  const again=await api('/reports/D-023/confirm','POST');
  assert.equal(once.report.confirmations,1);
  assert.equal(again.report.confirmations,1);
});

test('Panel simulado gestiona reportes y deja historial',async()=>{
  const {api,window}=setup();
  await assert.rejects(api('/security/reports'),/seguridad/);
  window.SafeCampusDemo.setRole('seguridad');
  const managed=await api('/reports/D-021/manage','POST',{verification:'descartado',attention:'En atención',assignee:'Equipo A'});
  assert.equal(managed.report.verification,'descartado');
  assert.equal(managed.report.assignee,'Equipo A');
  assert.ok((await api('/security/history')).history.some(x=>x.report_id==='D-021'));
  window.SafeCampusDemo.setRole('estudiante');
  assert.ok((await api('/alerts')).alerts.some(x=>x.message.includes('descartado')));
  assert.ok(!(await api('/reports')).reports.some(x=>x.id==='D-021'));
});

test('Comunicados ficticios, preferencias por zona y lectura de avisos',async()=>{
  const {api,window}=setup();
  await api('/preferences','PATCH',{routes:'Lima',hour_start:'00:00',hour_end:'23:59',radius:500,mute_until:0});
  window.SafeCampusDemo.setRole('seguridad');
  const response=await api('/notices','POST',{district:'Lima',message:'Comunicado académico para prueba local'});
  assert.equal(response.recipients,1);
  window.SafeCampusDemo.setRole('estudiante');
  assert.equal((await api('/notices')).notices.length,1);
  assert.equal((await api('/alerts')).alerts.length,1);
  await api('/alerts/read','POST');
  assert.equal((await api('/alerts')).alerts[0].read,1);
});

test('Retiro de reportes propios y restablecimiento de la demo',async()=>{
  const {api,window,store}=setup();
  const report=await api('/reports','POST',{category:'Acceso',description:'Reporte ficticio de prueba que se retirará',district:'Lima',risk:'bajo',lat:-12,lon:-77});
  await api('/reports/'+report.report.id+'/withdraw','POST');
  assert.ok(!(await api('/reports')).reports.some(x=>x.id===report.report.id));
  assert.ok((await api('/reports?mine=1')).reports.find(x=>x.id===report.report.id).withdrawn);
  assert.ok(store.size>0);
  window.SafeCampusDemo.reset();
  assert.equal((await api('/reports')).reports.length,3);
});
