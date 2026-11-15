'use strict';
/** SafeCampus. Servidor de demostración académica con datos compartidos entre clientes.
 * No es un servicio de emergencia ni debe publicar reportes reales sin revisión institucional. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const ROOT = __dirname;
const DATA = process.env.SAFECAMPUS_DATA || path.join(ROOT, '.datos');
fs.mkdirSync(DATA, {recursive:true, mode:0o700});
const db = new DatabaseSync(path.join(DATA, 'safecampus.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,pass TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('estudiante','seguridad')),created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id),category TEXT NOT NULL,description TEXT NOT NULL,risk TEXT NOT NULL CHECK(risk IN ('bajo','medio','alto')),district TEXT NOT NULL,lat REAL NOT NULL,lon REAL NOT NULL,photo TEXT,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,verification TEXT NOT NULL DEFAULT 'pendiente',assignee TEXT NOT NULL DEFAULT '',attention TEXT NOT NULL DEFAULT 'Pendiente',withdrawn INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS confirmations(report_id TEXT NOT NULL REFERENCES reports(id),user_id TEXT NOT NULL REFERENCES users(id),created_at INTEGER NOT NULL,PRIMARY KEY(report_id,user_id));
CREATE TABLE IF NOT EXISTS preferences(user_id TEXT PRIMARY KEY REFERENCES users(id),routes TEXT NOT NULL DEFAULT '',hour_start TEXT NOT NULL DEFAULT '00:00',hour_end TEXT NOT NULL DEFAULT '23:59',radius INTEGER NOT NULL DEFAULT 500,mute_until INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS notices(id TEXT PRIMARY KEY,author_id TEXT NOT NULL REFERENCES users(id),district TEXT NOT NULL,message TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS alerts(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),message TEXT NOT NULL,created_at INTEGER NOT NULL,read INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS history(id TEXT PRIMARY KEY,report_id TEXT NOT NULL REFERENCES reports(id),actor_id TEXT NOT NULL REFERENCES users(id),action TEXT NOT NULL,details TEXT NOT NULL,created_at INTEGER NOT NULL);`);
const now = () => Date.now();
const uid = () => crypto.randomUUID();
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const passwordHash = (pass, salt=crypto.randomBytes(16).toString('hex')) => salt+':'+crypto.scryptSync(pass,salt,64).toString('hex');
function checkPassword(pass,stored){const [salt,hashHex]=stored.split(':');if(!salt||!hashHex)return false;const got=crypto.scryptSync(pass,salt,64);const expected=Buffer.from(hashHex,'hex');return got.length===expected.length&&crypto.timingSafeEqual(got,expected)}
const clean = (x,n=300)=>String(x??'').trim().slice(0,n);
function err(status,message){const e=new Error(message);e.status=status;throw e}
const json = (res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
function statement(s,...args){return db.prepare(s).all(...args)}
const clients=new Set();
function publish(type,data={}){const item=`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;for(const client of clients){try{client.write(item)}catch{clients.delete(client)}}}
const count='(SELECT COUNT(*) FROM confirmations c WHERE c.report_id=r.id) AS confirmations';
function getReport(id){return db.prepare(`SELECT r.*,u.name AS author,${count} FROM reports r JOIN users u ON u.id=r.owner_id WHERE r.id=?`).get(id)}
function audit(report,user,action,details=''){db.prepare('INSERT INTO history VALUES(?,?,?,?,?,?)').run(uid(),report,user.id,action,details,now())}
function alert(userId,message){db.prepare('INSERT INTO alerts VALUES(?,?,?,?,0)').run(uid(),userId,message,now())}
function requireUser(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sc_session='))?.slice(11);if(!token)err(401,'Inicia sesión primero');const u=db.prepare(`SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?`).get(hash(token),now());if(!u)err(401,'La sesión expiró');return u}
function security(user){if(user.role!=='seguridad')err(403,'Acceso reservado al personal de seguridad autenticado')}
function validateReport(b){
 const category=clean(b.category,50),description=clean(b.description,1500),district=clean(b.district,120),risk=clean(b.risk,20);
 const lat=Number(b.lat),lon=Number(b.lon);
 if(!['Robo','Acoso','Iluminación','Acceso','Otro'].includes(category))err(400,'Categoría inválida');
 if(description.length<12)err(400,'Describe el incidente en 12 caracteres como mínimo');
 if(!district)err(400,'Indica distrito o referencia');
 if(!['bajo','medio','alto'].includes(risk))err(400,'Nivel de riesgo inválido');
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat>90||lon < -180||lon>180)err(400,'Coordenadas inválidas');
 let photo=null;
 if(b.photo){const str=String(b.photo);if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(str))err(400,'Adjunta PNG, JPEG o WebP');const bytes=Buffer.from(str.split(',')[1],'base64');if(bytes.length>200*1024)err(400,'La imagen excede 200 KB');photo=str}
 return {category,description,district,risk,lat,lon,photo};
}
function readBody(req){return new Promise((resolve,reject)=>{let chunks=[],length=0;req.on('data',c=>{length+=c.length;if(length>400000){reject(Object.assign(new Error('Solicitud demasiado grande'),{status:413}));req.destroy();return;}chunks.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString()||'{}'))}catch{reject(Object.assign(new Error('JSON inválido'),{status:400}))}});req.on('error',reject)})}
function validateOrigin(req){if(['POST','PATCH','DELETE','PUT'].includes(req.method)){const origin=req.headers.origin;if(origin){let reqOrigin;try{reqOrigin=new URL(origin)}catch{err(403,'Origen inválido')}const host=req.headers.host;if(reqOrigin.host!==host)err(403,'Origen no permitido')}}}
function pref(user){let p=db.prepare('SELECT * FROM preferences WHERE user_id=?').get(user.id);if(!p){db.prepare('INSERT INTO preferences(user_id) VALUES(?)').run(user.id);p=db.prepare('SELECT * FROM preferences WHERE user_id=?').get(user.id)}return p}
function serve(req,res,pathname){let file=pathname==='/'?'/index.html':pathname;try{file=decodeURIComponent(file)}catch{return json(res,400,{error:'Ruta inválida'})}
 if(file.includes('\0')||file.split('/').includes('..')||file.includes('\\'))return json(res,403,{error:'Ruta prohibida'});
 const target=path.resolve(ROOT,'.'+file);if(!target.startsWith(ROOT+path.sep))return json(res,403,{error:'Ruta prohibida'});
 if(file.startsWith('/.datos')||file.startsWith('/tests')||['/server.js','/package.json'].includes(file))return json(res,403,{error:'Ruta prohibida'});
 let st;try{st=fs.statSync(target)}catch{return json(res,404,{error:'Archivo inexistente'})}if(!st.isFile())return json(res,404,{error:'Archivo inexistente'});
 const ext=path.extname(target).toLowerCase();const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json','.webp':'image/webp'}[ext];if(!mime)return json(res,403,{error:'Tipo no permitido'});
 res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: blob: https://*.tile.openstreetmap.org; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nominatim.openstreetmap.org; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});fs.createReadStream(target).pipe(res)
}
async function api(req,res,p){const method=req.method;validateOrigin(req);
 if(p==='/api/health'&&method==='GET')return json(res,200,{ok:true,mode:'servidor SQLite',online_clients:clients.size});
 if(p==='/api/register'&&method==='POST'){
  const b=await readBody(req),name=clean(b.name,80),email=clean(b.email,120).toLowerCase(),pass=String(b.password||'');
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||pass.length<10)err(400,'Indica nombre, correo válido y contraseña de 10+ caracteres');
  if(db.prepare('SELECT 1 FROM users WHERE email=?').get(email))err(409,'Correo ya registrado');
  const id=uid();db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(id,name,email,passwordHash(pass),'estudiante',now());db.prepare('INSERT INTO preferences(user_id) VALUES(?)').run(id);return json(res,201,{ok:true})
 }
 if(p==='/api/login'&&method==='POST'){
  const b=await readBody(req),email=clean(b.email,120).toLowerCase(),pass=String(b.password||'');const u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!u||!checkPassword(pass,u.pass))err(401,'Credenciales incorrectas');const token=crypto.randomBytes(32).toString('base64url');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),u.id,now()+86400000);
  res.setHeader('Set-Cookie',`sc_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.COOKIE_SECURE==='1'?'; Secure':''}`);return json(res,200,{user:{id:u.id,name:u.name,email:u.email,role:u.role}})
 }
 const user=requireUser(req);
 if(p==='/api/logout'&&method==='POST'){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sc_session='))?.slice(11);db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));res.setHeader('Set-Cookie','sc_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');return json(res,200,{ok:true})}
 if(p==='/api/me'&&method==='GET')return json(res,200,{user,preferences:pref(user)});
 if(p==='/api/events'&&method==='GET'){
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write('retry: 2500\nevent: connected\ndata: {}\n\n');clients.add(res);
  const h=setInterval(()=>{try{res.write(': ping\n\n')}catch{clearInterval(h);clients.delete(res)}},20000);req.on('close',()=>{clearInterval(h);clients.delete(res)});return;
 }
 if(p==='/api/preferences'&&method==='GET')return json(res,200,pref(user));
 if(p==='/api/preferences'&&method==='PATCH'){
  const b=await readBody(req);const old=pref(user),routes=clean(b.routes??old.routes,300),hs=clean(b.hour_start??old.hour_start,5),he=clean(b.hour_end??old.hour_end,5),radius=Number(b.radius??old.radius),mute=Number(b.mute_until??old.mute_until);
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(hs)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(he)||!Number.isInteger(radius)||radius<100||radius>5000||!Number.isFinite(mute))err(400,'Preferencias inválidas');
  db.prepare('UPDATE preferences SET routes=?,hour_start=?,hour_end=?,radius=?,mute_until=? WHERE user_id=?').run(routes,hs,he,radius,mute,user.id);return json(res,200,pref(user))
 }
 if(p==='/api/reports'&&method==='GET'){
  const mine=new URL(req.url,'http://localhost').searchParams.get('mine')==='1';const where=mine?'r.owner_id=?':'r.withdrawn=0 AND r.verification!=\'descartado\'';
  const rows=db.prepare(`SELECT r.id,r.owner_id,r.category,r.description,r.risk,r.district,r.lat,r.lon,r.created_at,r.updated_at,r.verification,r.assignee,r.attention,r.withdrawn,u.name AS author,${count} FROM reports r JOIN users u ON u.id=r.owner_id WHERE ${where} ORDER BY r.created_at DESC LIMIT 500`).all(...(mine?[user.id]:[]));return json(res,200,{reports:rows})
 }
 if(p==='/api/reports'&&method==='POST'){
  const b=validateReport(await readBody(req)),id='SC-'+crypto.randomBytes(4).toString('hex').toUpperCase(),t=now();
  db.prepare('INSERT INTO reports(id,owner_id,category,description,risk,district,lat,lon,photo,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,user.id,b.category,b.description,b.risk,b.district,b.lat,b.lon,b.photo,t,t);
  audit(id,user,'creado','Pendiente; 0 confirmaciones');publish('reports',{action:'created',id});return json(res,201,{report:getReport(id)})
 }
 if(p.startsWith('/api/reports/')){
  const parts=p.split('/'),id=decodeURIComponent(parts[3]||'');const r=getReport(id);if(!r)err(404,'Reporte inexistente');
  if(parts[4]==='confirm'&&method==='POST'){
   if(r.withdrawn||r.verification==='descartado')err(409,'Reporte no confirmable');
   if(r.owner_id===user.id)err(403,'No puedes confirmar tu propio reporte');
   db.prepare('INSERT OR IGNORE INTO confirmations VALUES(?,?,?)').run(id,user.id,now());publish('reports',{action:'confirmation',id});return json(res,200,{report:getReport(id)});
  }
  if(parts[4]==='photo'&&method==='GET'){
   if(!r.photo)return json(res,404,{error:'No existe evidencia'});return json(res,200,{photo:r.photo});
  }
  if(parts[4]==='history'&&method==='GET'){
   return json(res,200,{history:db.prepare('SELECT h.id,h.action,h.details,h.created_at,u.name AS actor FROM history h JOIN users u ON u.id=h.actor_id WHERE h.report_id=? ORDER BY h.created_at DESC').all(id)})
  }
  if(parts.length===4&&method==='GET')return json(res,200,{report:r});
  if(parts.length===4&&method==='PATCH'){
   if(r.owner_id!==user.id||r.verification!=='pendiente'||r.withdrawn)err(403,'Solo puedes editar reportes propios pendientes');
   const b=validateReport(await readBody(req));db.prepare('UPDATE reports SET category=?,description=?,risk=?,district=?,lat=?,lon=?,photo=?,updated_at=? WHERE id=?').run(b.category,b.description,b.risk,b.district,b.lat,b.lon,b.photo??r.photo,now(),id);audit(id,user,'editado','Edición de reporte propio');publish('reports',{action:'edited',id});return json(res,200,{report:getReport(id)})
  }
  if(parts[4]==='withdraw'&&method==='POST'){
   if(r.owner_id!==user.id||r.verification!=='pendiente'||r.withdrawn)err(403,'Solo puedes retirar reportes propios pendientes');
   db.prepare('UPDATE reports SET withdrawn=1,updated_at=? WHERE id=?').run(now(),id);audit(id,user,'retirado','Retirado por el autor');publish('reports',{action:'withdrawn',id});return json(res,200,{report:getReport(id)})
  }
  if(parts[4]==='manage'&&method==='POST'){
   security(user);const b=await readBody(req),verification=clean(b.verification??r.verification),attention=clean(b.attention??r.attention,30),assignee=clean(b.assignee??r.assignee,80);
   if(!['pendiente','confirmado','descartado'].includes(verification)||!['Pendiente','En atención','Atendido'].includes(attention))err(400,'Estado no permitido');
   db.prepare('UPDATE reports SET verification=?,attention=?,assignee=?,updated_at=? WHERE id=?').run(verification,attention,assignee,now(),id);
   audit(id,user,'gestión',`Verificación: ${r.verification} -> ${verification}; responsable: ${assignee||'Sin asignar'}; atención: ${attention}`);
   if(r.verification!==verification)alert(r.owner_id,`Tu reporte ${id} cambió de ${r.verification} a ${verification}.`);
   publish('reports',{action:'managed',id});publish('alerts',{user_id:r.owner_id});return json(res,200,{report:getReport(id)})
  }
 }
 if(p==='/api/security/reports'&&method==='GET'){security(user);const rows=db.prepare(`SELECT r.id,r.owner_id,r.category,r.description,r.risk,r.district,r.lat,r.lon,r.created_at,r.updated_at,r.verification,r.assignee,r.attention,r.withdrawn,u.name AS author,${count} FROM reports r JOIN users u ON u.id=r.owner_id WHERE r.withdrawn=0 ORDER BY r.created_at DESC LIMIT 500`).all();return json(res,200,{reports:rows})}
 if(p==='/api/security/history'&&method==='GET'){security(user);return json(res,200,{history:statement('SELECT h.report_id,h.action,h.details,h.created_at,u.name AS actor FROM history h JOIN users u ON u.id=h.actor_id ORDER BY h.created_at DESC LIMIT 500')})}
 if(p==='/api/notices'&&method==='GET')return json(res,200,{notices:statement('SELECT n.id,n.district,n.message,n.created_at,u.name AS author FROM notices n JOIN users u ON u.id=n.author_id ORDER BY n.created_at DESC LIMIT 100')});
 if(p==='/api/notices'&&method==='POST'){
  security(user);const b=await readBody(req),district=clean(b.district,120),message=clean(b.message,500);if(!district||message.length<8)err(400,'Indica zona y comunicado (8+ caracteres)');const id=uid();db.prepare('INSERT INTO notices VALUES(?,?,?,?,?)').run(id,user.id,district,message,now());
  const users=statement("SELECT id FROM users WHERE role='estudiante'");for(const u of users)alert(u.id,`Comunicado para ${district}: ${message}`);publish('notices',{id,district});publish('alerts',{});return json(res,201,{ok:true,id,recipients:users.length})
 }
 if(p==='/api/alerts'&&method==='GET')return json(res,200,{alerts:db.prepare('SELECT * FROM alerts WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(user.id)});
 if(p==='/api/alerts/read'&&method==='POST'){db.prepare('UPDATE alerts SET read=1 WHERE user_id=?').run(user.id);return json(res,200,{ok:true})}
 return json(res,404,{error:'Ruta API inexistente'});
}
async function handler(req,res){try{const p=new URL(req.url,'http://localhost').pathname;if(p.startsWith('/api/'))return await api(req,res,p);if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Método no permitido'});return serve(req,res,p)}catch(e){if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Error interno'});else res.end();if(!e.status)console.error(e)}}
// Crear cuenta de seguridad solamente mediante variables de entorno configuradas explícitamente.
if(process.env.SECURITY_EMAIL&&process.env.SECURITY_PASSWORD){const email=process.env.SECURITY_EMAIL.toLowerCase();if(!db.prepare('SELECT id FROM users WHERE email=?').get(email)){const id=uid();db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(id,'Personal de seguridad',email,passwordHash(process.env.SECURITY_PASSWORD),'seguridad',now());db.prepare('INSERT INTO preferences(user_id) VALUES(?)').run(id);console.log('Cuenta de seguridad configurada')}}
function start(port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1'){const server=http.createServer(handler);return server.listen(port,host,()=>console.log(`SafeCampus: http://${host}:${server.address().port}`))}
if(require.main===module)start();
module.exports={start,db,handler};
