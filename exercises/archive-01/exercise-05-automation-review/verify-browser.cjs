'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),path=require('node:path'),os=require('node:os');
const url=name=>pathToFileURL(path.resolve(__dirname,name)).href;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(url('index.html'));assert(await page.locator('#interactive').isVisible());assert.equal(await page.locator('input:checked').count(),0);
  await page.screenshot({path:path.join(os.tmpdir(),'exercise-05-desktop.png'),fullPage:true});
  await page.locator('.step-nav [data-step="2"]').click();await page.locator('#commit').click();assert.match(await page.locator('#status').innerText(),/Complete your review/);assert(await page.locator('#results').isHidden());
  async function fill({bad=false,request='patch',approval='patch',decision='allow',disposition='partial'}={}){
   await page.locator('.step-nav [data-step="0"]').click();
   for(const [name,value] of Object.entries({wait:'retain',credentials:bad?'retain':'fresh',policy:'defer'}))await page.locator(`[name="${name}"][value="${value}"]`).check();
   await page.locator('#rationale').fill('TIM-01 / AC-04 / DATA-01: independent fresh sessions and supported expectations.');
   await page.locator('.step-nav [data-step="1"]').click();
   for(const value of ['delay','deadline','error','newFails','oldWorks'])await page.locator(`[name="validation"][value="${value}"]`).check();
   await page.locator('#evidence').fill('Submission/observation times, isolated fixture IDs, authentication results, diagnostics and cleanup.');
   if(bad)await page.screenshot({path:path.join(os.tmpdir(),'exercise-05-validation.png'),fullPage:true});
   await page.locator('.step-nav [data-step="2"]').click();
   for(const [name,value] of Object.entries({request,approval,decision,disposition}))await page.locator('#'+name).selectOption(value);
   await page.locator('#reviewer').fill('Designated automation reviewer');await page.locator('#permissionReason').fill('Check exact action scope and technical prerequisites.');await page.locator('#conditions').fill('Validate setup and all planned cases; clarify policy with product owner.');
   if(bad)await page.screenshot({path:path.join(os.tmpdir(),'exercise-05-authority.png'),fullPage:true});
  }
  await fill({bad:true});assert.equal(await page.locator('#status').innerText(),'');await page.locator('#commit').click();assert.match(await page.locator('#permission-result').innerText(),/HELD FOR CORRECTION/);assert(await page.locator('#commit').isDisabled());assert.equal(await page.evaluate(()=>document.activeElement.id),'results-title');
  const first=(await page.locator('#record').innerText()).split('CURRENT COMMITTED REVIEW')[0];
  await page.locator('#revise').click();await page.locator('[name="credentials"][value="fresh"]').check();await page.locator('#rationale').fill('<img src=x onerror=alert(1)> AC-04 needs fresh sessions.');
  assert(await page.locator('#stale').isVisible());assert.equal(await page.locator('#record img').count(),0);
  assert((await page.locator('#record').innerText()).startsWith(first));
  await page.locator('.step-nav [data-step="2"]').click();await page.locator('#commit').click();assert.match(await page.locator('#permission-result').innerText(),/ALLOWED IN SIMULATION/);assert(await page.locator('#revise').isHidden());assert(await page.locator('#commit').isDisabled());assert(await page.locator('#stale').isHidden());assert.match(await page.locator('#record').innerText(),/One revision committed/);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copied=text;}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.copied),await page.locator('#record').innerText());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.getSelection().toString()),await page.locator('#record').innerText());
  await page.screenshot({path:path.join(os.tmpdir(),'exercise-05-reviewed.png'),fullPage:true});
  await page.locator('#reset-attempt').click();assert(await page.locator('#results').isHidden());assert.equal(await page.locator('#record').innerText(),'');assert.equal(await page.locator('input:checked').count(),0);
  await fill({request:'comparison',approval:'patch'});await page.locator('#commit').click();assert.match(await page.locator('#technical-result').innerText(),/ready for review/);assert.match(await page.locator('#permission-result').innerText(),/No matching scoped approval/);
  await page.locator('#reset-attempt').click();await fill({request:'production',approval:'comparison'});await page.locator('#commit').click();assert.match(await page.locator('#permission-result').innerText(),/Production changes are prohibited/);
  await page.locator('#reset-attempt').click();await fill({request:'comparison',approval:'comparison',decision:'defer',disposition:'stop'});await page.locator('#commit').click();assert.match(await page.locator('#permission-result').innerText(),/DEFERRED/);assert.match(await page.locator('#technical-result').innerText(),/unresolved/);
  await page.locator('#reset-attempt').click();await page.locator('[name="wait"]').first().focus();await page.keyboard.press('ArrowDown');assert.equal(await page.locator('[name="wait"]:checked').count(),1);
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(os.tmpdir(),'exercise-05-mobile.png'),fullPage:true});
  await page.setViewportSize({width:720,height:500});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await context.setOffline(true);await page.reload();assert(await page.locator('#interactive').isVisible());
  const noJS=await browser.newContext({javaScriptEnabled:false,offline:true});const fallback=await noJS.newPage();await fallback.goto(url('index.html'));assert(await fallback.locator('noscript a').isVisible());await fallback.locator('noscript a').click();assert.equal(await fallback.locator('.source[open]').count(),4);await fallback.locator('a[href="feedback.html"]').click();assert.match(await fallback.locator('body').innerText(),/Authority decision guide/);await fallback.locator('a[href="worked-example.html"]').click();assert.match(await fallback.locator('body').innerText(),/No matching scoped approval/);
  await fallback.goto(url('worksheet.html'));await fallback.pdf({path:path.join(os.tmpdir(),'exercise-05-worksheet.pdf'),format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});
  await fallback.emulateMedia({media:'print'});await fallback.screenshot({path:path.join(os.tmpdir(),'exercise-05-worksheet-print.png'),fullPage:true});
  await page.goto(url('../../../index.html'));for(const id of ['02','03','04','05'])assert(await page.locator(`[aria-labelledby="exercise-${id}"] button`).isDisabled());assert(await page.locator('[aria-labelledby="exercise-06"] a').isVisible());await page.goto(url('index.html'));assert.match(await page.locator('h1').innerText(),/Review an automation change/);
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  console.log('Edge '+browser.version()+': correction/revision, mismatched/prohibited/deferred authority, snapshots, literal text, clipboard stubs, reset, keyboard, mobile/reflow, offline and no-JS paths passed. Worksheet PDF and screenshots in '+os.tmpdir());
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
