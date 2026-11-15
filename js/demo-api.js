/* SafeCampus — motor de simulación local, sin servidor ni dependencias de Node.js.
 * Datos ficticios y operaciones guardadas únicamente en el navegador. */
(function () {
  'use strict';
  const KEY = 'safecampus-tb2-local-v1';
  const ROLE_KEY = 'safecampus-tb2-role';
  const STUDENT = 'demo-estudiante';
  const SECURITY = 'demo-seguridad';
  const categories = ['Robo', 'Acoso', 'Iluminación', 'Acceso', 'Otro'];
  const risks = ['bajo', 'medio', 'alto'];
  const verifications = ['pendiente', 'confirmado', 'descartado'];
  const attentions = ['Pendiente', 'En atención', 'Atendido'];
  const number = x => Number(x);
  const now = () => Date.now();
  const id = () => 'SC-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const prefsDefault = () => ({routes: '', hour_start: '00:00', hour_end: '23:59', radius: 500, mute_until: 0});
  const me = () => role === 'seguridad'
    ? {id: SECURITY, name: 'Personal de seguridad (simulado)', email: 'seguridad@demo.local', role: 'seguridad'}
    : {id: STUDENT, name: 'Estudiante (simulado)', email: 'estudiante@demo.local', role: 'estudiante'};
  const seed = () => {
    const t = now();
    return {
      reports: [
        {id:'D-021',owner_id:STUDENT,author:'Estudiante (simulado)',category:'Robo',
          description:'EJEMPLO FICTICIO: reporte de prueba para explorar la interfaz.',risk:'alto',
          district:'Centro de Lima (simulado)',lat:-12.0475,lon:-77.0403,
          created_at:t-1800000,updated_at:t-1800000,verification:'pendiente',assignee:'',
          attention:'Pendiente',withdrawn:0,photo:null,confirmed_by:[]},
        {id:'D-022',owner_id:'otro-usuario',author:'Comunidad ficticia',category:'Iluminación',
          description:'EJEMPLO FICTICIO: iluminación insuficiente para fines académicos.',risk:'medio',
          district:'Cercado de Lima (simulado)',lat:-12.053,lon:-77.048,
          created_at:t-86400000,updated_at:t-86400000,verification:'confirmado',assignee:'Equipo A',
          attention:'En atención',withdrawn:0,photo:null,confirmed_by:['otro-usuario']},
        {id:'D-023',owner_id:'otro-usuario',author:'Comunidad ficticia',category:'Acoso',
          description:'EJEMPLO FICTICIO: situación inventada para probar las confirmaciones.',risk:'bajo',
          district:'Pueblo Libre (simulado)',lat:-12.0762,lon:-77.0622,
          created_at:t-172800000,updated_at:t-172800000,verification:'pendiente',assignee:'',
          attention:'Pendiente',withdrawn:0,photo:null,confirmed_by:[]}
      ],
      preferences: {[STUDENT]:prefsDefault(), [SECURITY]:prefsDefault()},
      notices: [], alerts: [], history: [
        {id:'H-022',report_id:'D-022',action:'verificación',details:'Pendiente → confirmado (ejemplo ficticio)',
          created_at:t-86000000,actor:'Personal de seguridad (simulado)'}
      ]
    };
  };
  const valid = data => data && Array.isArray(data.reports) && data.preferences &&
    Array.isArray(data.notices) && Array.isArray(data.alerts) && Array.isArray(data.history);
  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      return valid(stored) ? stored : seed();
    } catch (_) { return seed(); }
  }
  let data = read();
  let role = sessionStorage.getItem(ROLE_KEY) === 'seguridad' ? 'seguridad' : 'estudiante';
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (_) { throw Error('No se pudieron guardar datos locales. Libera espacio del navegador.'); }
    window.dispatchEvent(new Event('safecampus:change'));
  }
  window.addEventListener('storage', e => {
    if (e.key === KEY) {
      data = read();
      window.dispatchEvent(new Event('safecampus:change'));
    }
  });
  const reportPublic = r => Object.assign({}, r, {confirmations:(r.confirmed_by || []).length});
  const recentFirst = arr => arr.slice().sort((a,b) => b.created_at - a.created_at);
  function fail(message) { throw Error(message); }
  function findReport(reportId) {
    const item = data.reports.find(r => r.id === reportId);
    if (!item) fail('No existe el reporte de demostración');
    return item;
  }
  function securityOnly() {
    if (role !== 'seguridad') fail('Selecciona el rol simulado de personal de seguridad');
  }
  function history(report, action, details) {
    data.history.unshift({id:id(),report_id:report.id,action,details,created_at:now(),actor:me().name});
  }
  function alertStudent(message) {
    data.alerts.unshift({id:id(),user_id:STUDENT,message,created_at:now(),read:0});
  }
  function reportBody(body) {
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    const district = String(body.district || '').trim();
    const risk = String(body.risk || '').trim();
    if (!categories.includes(category)) fail('Selecciona una categoría');
    if (description.length < 12 || description.length > 1500) fail('La descripción debe tener entre 12 y 1500 caracteres');
    if (!district || district.length > 120) fail('Indica un distrito o referencia');
    if (!risks.includes(risk)) fail('Selecciona un nivel de riesgo válido');
    if (body.lat === '' || body.lon === '' || body.lat == null || body.lon == null) fail('Indica latitud y longitud');
    const lat = number(body.lat), lon = number(body.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      fail('Coordenadas inválidas');
    }
    let photo = body.photo || null;
    if (photo && (!/^data:image\/(png|jpeg|webp);base64,/.test(photo) || photo.length > 275000)) {
      fail('La evidencia debe ser PNG, JPG o WebP y no exceder 200 KB');
    }
    return {category,description,district,risk,lat,lon,photo};
  }
  function updatePrefs(body) {
    const key = me().id, current = data.preferences[key] || prefsDefault();
    const next = Object.assign({}, current, body);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(next.hour_start) || !timePattern.test(next.hour_end)) fail('Horarios inválidos');
    next.radius = number(next.radius);
    next.mute_until = number(next.mute_until);
    if (!Number.isInteger(next.radius) || next.radius < 100 || next.radius > 5000 ||
        !Number.isFinite(next.mute_until)) fail('Preferencias inválidas');
    next.routes = String(next.routes || '').slice(0, 300);
    data.preferences[key] = next;
    save();
    return next;
  }
  async function request(path, options) {
    const method = String(options && options.method || 'GET').toUpperCase();
    const body = options && options.body ? JSON.parse(options.body) : {};
    const url = new URL(path, location.origin);
    const route = url.pathname;
    const user = me();
    if (route === '/me') return {user,preferences:data.preferences[user.id] || prefsDefault()};
    if (route === '/preferences' && method === 'GET') return data.preferences[user.id] || prefsDefault();
    if (route === '/preferences' && method === 'PATCH') return updatePrefs(body);
    if (route === '/reports' && method === 'GET') {
      const onlyMine = url.searchParams.get('mine') === '1';
      const visible = data.reports.filter(r => onlyMine ? r.owner_id === user.id :
        !r.withdrawn && r.verification !== 'descartado');
      return {reports:recentFirst(visible).map(reportPublic)};
    }
    if (route === '/reports' && method === 'POST') {
      const content = reportBody(body);
      const report = Object.assign({}, content, {id:id(),owner_id:user.id,author:user.name,
        created_at:now(),updated_at:now(),verification:'pendiente',assignee:'',
        attention:'Pendiente',withdrawn:0,confirmed_by:[]});
      data.reports.unshift(report);
      history(report,'creado','Reporte ficticio guardado localmente: pendiente');
      save();
      return {report:reportPublic(report)};
    }
    if (route === '/security/reports') {
      securityOnly();
      return {reports:recentFirst(data.reports.filter(r => !r.withdrawn)).map(reportPublic)};
    }
    if (route === '/security/history') {
      securityOnly();
      return {history:recentFirst(data.history)};
    }
    if (route === '/notices' && method === 'GET') return {notices:recentFirst(data.notices)};
    if (route === '/notices' && method === 'POST') {
      securityOnly();
      const district = String(body.district || '').trim();
      const message = String(body.message || '').trim();
      if (!district || message.length < 8) fail('Indica la zona y un comunicado de al menos 8 caracteres');
      const notice = {id:id(),district,message,created_at:now(),author:user.name};
      data.notices.unshift(notice);
      const routes = (data.preferences[STUDENT] || prefsDefault()).routes.toLowerCase().split(',').map(s=>s.trim());
      const matching = routes.some(x => x && (district.toLowerCase().includes(x) || x.includes(district.toLowerCase())));
      if (matching) alertStudent('COMUNICADO FICTICIO para ' + district + ': ' + message);
      save();
      return {ok:true,id:notice.id,recipients:matching ? 1 : 0};
    }
    if (route === '/alerts' && method === 'GET') return {alerts:recentFirst(data.alerts.filter(a=>a.user_id === user.id))};
    if (route === '/alerts/read' && method === 'POST') {
      data.alerts.filter(a=>a.user_id===user.id).forEach(a=>{a.read=1;});
      save();
      return {ok:true};
    }
    const match = route.match(/^\/reports\/([^/]+)(?:\/([^/]+))?$/);
    if (match) {
      const report = findReport(decodeURIComponent(match[1]));
      const action = match[2] || '';
      if (action === 'history' && method === 'GET') return {history:recentFirst(data.history.filter(h=>h.report_id===report.id))};
      if (action === 'photo' && method === 'GET') {
        if (!report.photo) fail('El reporte no tiene evidencia adjunta');
        return {photo:report.photo};
      }
      if (!action && method === 'GET') return {report:reportPublic(report)};
      if (!action && method === 'PATCH') {
        if (report.owner_id!==user.id || report.withdrawn || report.verification!=='pendiente') {
          fail('Solo puedes editar reportes propios pendientes');
        }
        const changes = reportBody(body); if (!changes.photo) delete changes.photo; Object.assign(report, changes);
        report.updated_at=now();
        history(report,'editado','El autor actualizó su reporte ficticio');
        save();
        return {report:reportPublic(report)};
      }
      if (action === 'withdraw' && method === 'POST') {
        if (report.owner_id!==user.id || report.withdrawn || report.verification!=='pendiente') {
          fail('Solo puedes retirar reportes propios pendientes');
        }
        report.withdrawn=1;
        report.updated_at=now();
        history(report,'retirado','Reporte retirado de la demostración');
        save();
        return {report:reportPublic(report)};
      }
      if (action === 'confirm' && method === 'POST') {
        if (report.withdrawn || report.verification==='descartado' || report.owner_id===user.id) {
          fail('Este reporte no se puede confirmar desde tu perfil');
        }
        if (!report.confirmed_by.includes(user.id)) {
          report.confirmed_by.push(user.id);
          history(report,'confirmación','Confirmación comunitaria simulada');
          save();
        }
        return {report:reportPublic(report)};
      }
      if (action === 'manage' && method === 'POST') {
        securityOnly();
        if (report.withdrawn) fail('No se puede gestionar un reporte retirado');
        const verification = body.verification || report.verification;
        const attention = body.attention || report.attention;
        const assignee = String(body.assignee || '').slice(0,80);
        if (!verifications.includes(verification) || !attentions.includes(attention)) fail('Estado inválido');
        const before = report.verification;
        report.verification=verification;
        report.attention=attention;
        report.assignee=assignee;
        report.updated_at=now();
        history(report,'gestión','Verificación: '+before+' → '+verification+'; responsable: '+(assignee||'Sin asignar')+'; atención: '+attention);
        if (before!==verification && report.owner_id===STUDENT) {
          alertStudent('Tu reporte ficticio '+report.id+' cambió a '+verification);
        }
        save();
        return {report:reportPublic(report)};
      }
    }
    fail('Operación no disponible en esta simulación: '+method+' '+route);
  }
  function setRole(nextRole) {
    role = nextRole === 'seguridad' ? 'seguridad' : 'estudiante';
    sessionStorage.setItem(ROLE_KEY, role);
  }
  function reset() {
    localStorage.removeItem(KEY);
    data = seed();
    save();
  }
  window.SafeCampusDemo = {request,setRole,getRole:()=>role,reset};
})();