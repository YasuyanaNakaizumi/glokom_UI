const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on "顧客リスト" to trigger CustomerListView and get errors
  try {
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('button, a'));
      const link = links.find(el => el.textContent.includes('顧客リスト'));
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Select the first customer
    await page.evaluate(() => {
      const customers = Array.from(document.querySelectorAll('button'));
      const customer = customers.find(el => el.textContent.includes('建設') || el.textContent.includes('開発'));
      if (customer) customer.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    await page.screenshot({path: 'screenshot.png'});
  } catch (e) {
    console.log(e);
  }
  
  await browser.close();
})();
