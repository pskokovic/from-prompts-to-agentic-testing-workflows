// Run with Playwright available through Node resolution / NODE_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const os = require('node:os');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
    await page.goto(pathToFileURL(path.resolve(__dirname, 'index.html')).href);
    await page.locator('#interactive').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#sources .source').count(), 7);
    await page.locator('#review').click();
    assert.match(await page.locator('#examples').innerText(), /No functional test/);
    assert.match(await page.locator('#next').innerText(), /7 source decision/);
    await page.locator('#reset').click();
    assert(await page.locator('#results').isHidden());
    // Keyboard-only movement from the first selection to its rationale.
    await page.locator('#decision-0').focus();
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SUMMARY');
    await page.keyboard.press('Enter'); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'reason-0');
    for (let i = 0; i < 7; i++) await page.locator(`#decision-${i}`).selectOption([0, 3].includes(i) ? 'include' : [2, 4].includes(i) ? 'defer' : 'exclude');
    for (const i of [1, 5]) {
      await page.locator(`#reason-${i}`).locator('..').locator('..').locator('summary').click();
      await page.locator(`#reason-${i}`).fill(i === 1 ? 'Superseded by AC-02.' : 'Different feature.');
    }
    await page.locator('#conflict').fill('AC-02 is current: 30 minutes. OLD-01 is superseded.');
    await page.locator('#question-1').fill('Unregistered email response?');
    await page.locator('#question-2').fill('Exact expiry boundary?');
    await page.locator('#review').click();
    assert.match(await page.locator('#concerns').innerText(), /No modeled/);
    assert.equal(await page.locator('#examples li').count(), 4);
    await page.locator('#decision-1').selectOption('include');
    assert(await page.locator('#stale').isVisible());
    await page.locator('#history').selectOption('history');
    await page.locator('#review').click();
    assert.match(await page.locator('#concerns').innerText(), /No modeled/);
    await page.locator('#results details').first().locator('summary').click();
    assert.match(await page.locator('#comparison').innerText(), /OLD-01/);
    await page.locator('#history').selectOption('authority'); await page.locator('#review').click();
    assert.match(await page.locator('#concerns').innerText(), /15-minute/);
    for (let i = 0; i < 7; i++) await page.locator(`#decision-${i}`).selectOption('include');
    await page.locator('#review').click();
    assert((await page.locator('#concerns li').count()) >= 4);
    // Free text is literal text, never HTML, and makes existing feedback stale.
    await page.locator('#conflict').fill('<img src=x onerror=alert(1)>');
    assert.equal(await page.locator('#package img').count(), 0);
    assert.match(await page.locator('#package').innerText(), /<img/);
    // Exercise successful copy and unavailable clipboard deterministically.
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copied = text; } } }));
    await page.locator('#copy').click();
    assert.equal(await page.evaluate(() => window.copied), await page.locator('#package').innerText());
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw Error('unavailable'); } } }));
    await page.locator('#copy').click();
    assert.match(await page.locator('#status').innerText(), /Clipboard unavailable/);
    assert.equal(await page.evaluate(() => window.getSelection().toString()), await page.locator('#package').innerText());
    await page.locator('#reset').click();
    assert(await page.locator('#results').isHidden()); assert.equal(await page.locator('#conflict').inputValue(), '');
    await page.screenshot({ path: path.join(os.tmpdir(), 'exercise-02-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(os.tmpdir(), 'exercise-02-mobile.png'), fullPage: true });
    // Direct-file offline use, including script-free fallback.
    await page.context().setOffline(true); await page.reload();
    assert(await page.locator('#interactive').isVisible());
    await page.locator('a[href="worksheet.html"]').first().click();
    assert.equal(await page.locator('.source').count(), 7);
    await page.locator('a[href="worked-example.html"]').click();
    assert.match(await page.locator('h1').innerText(), /One defensible package/);
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await noJS.newPage();
    await fallback.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    assert(await fallback.locator('noscript').isVisible());
    await fallback.locator('noscript a').first().click();
    assert.equal(await fallback.locator('.source').count(), 7);
    assert.deepEqual(errors, []); assert.deepEqual(network, []);
    console.log('Passed Chromium: home navigation, decisions, keyboard path, feedback/revision, history handling, all-source hazards, safe free text, copy branches, reset, 390px layout, direct-file offline use and no-JS fallback.');
    console.log(`Screenshots: ${path.join(os.tmpdir(), 'exercise-02-desktop.png')} and ${path.join(os.tmpdir(), 'exercise-02-mobile.png')}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
