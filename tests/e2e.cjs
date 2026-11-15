/* Pruebas de navegador para SafeCampus TB2 (solo CI, no parte del runtime de la página). */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright-core');
const base='http://127.0.0.1:5500/';
async function run(viewport){
 const executablePath=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
 if(!executablePath)throw Error('No se encontró Chrome/Chromium en el runner');
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
 const pageErrors=[];
 const context=await browser.newContext({viewport,permissions:['geolocation'],geolocation:{latitude:-12.0475,longitude:-77.0428}});
 const page=await context.newPage();
 page.on('pageerror',e=>pageErrors.push(e.message));
 try {
   await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
   await page.getByRole('link',{name:'Probar SafeCampus'}).click();
   await page.locator('#view-map h1').waitFor({state:'visible'});
   assert.match(await page.locator('#view-map h1').innerText(),/Mapa de riesgos/);
   assert.equal(await page.locator('#demo-role').inputValue(),'estudiante');
   await page.locator('#filter-category').selectOption('Robo');
   await page.locator('#filter-age').selectOption('7');
   await page.locator('#reset-map').click();
   assert.equal(await page.locator('#filter-category').inputValue(),'');
   await page.locator('#view-map [data-nav="report-new"]').click();
   await page.locator('#report-form [name="category"]').selectOption('Acceso');
   await page.locator('#report-form [name="description"]').fill('INCIDENTE FICTICIO generado por prueba de navegador');
   await page.locator('#report-form [name="district"]').fill('Centro de Lima (prueba)');
   await page.locator('#report-form [name="lat"]').fill('-12.048');
   await page.locator('#report-form [name="lon"]').fill('-77.045');
   await page.locator('#report-form button[type="submit"]').click();
   await page.locator('#report-review').waitFor({state:'visible'});
   await page.locator('#save-report').click();
   await page.locator('#view-reports').waitFor({state:'visible'});
   await page.getByText('INCIDENTE FICTICIO generado por prueba de navegador').first().waitFor();
   await page.locator('#demo-role').selectOption('seguridad');
   await page.locator('#nav-security').waitFor({state:'visible'});
   await page.locator('#nav-security').click();
   await page.locator('#view-security').waitFor({state:'visible'});
   await page.locator('#security-report').selectOption('D-021');
   await page.locator('#security-form [name="assignee"]').fill('Equipo A');
   await page.locator('#security-form [name="attention"]').selectOption('En atención');
   await page.locator('#security-form [name="verification"]').selectOption('confirmado');
   page.once('dialog',dialog=>dialog.accept());
   await page.locator('#security-form button[type="submit"]').click();
   await page.getByText('Gestión ficticia de D-021 registrada').first().waitFor();
   await page.locator('#demo-role').selectOption('estudiante');
   await page.locator('#bottom-nav [data-nav="community"]').click();
   await page.locator('#view-community').waitFor({state:'visible'});
   await page.getByText('Tu reporte ficticio D-021 cambió a confirmado').first().waitFor();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   assert.equal(overflow,false,'Se encontró desbordamiento horizontal en '+viewport.width+'px');
   assert.equal(pageErrors.length,0,'Errores JS en la página: '+pageErrors.join(' | '));
   console.log('OK navegador',viewport.width+'x'+viewport.height,'crear/filtros/gestión/avisos/responsive');
 } finally {await browser.close()}
}
(async()=>{await run({width:1280,height:800});await run({width:390,height:844})})().catch(e=>{console.error(e);process.exitCode=1});
