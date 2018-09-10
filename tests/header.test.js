const puppeteer = require('puppeteer');

let browser,page;

beforeEach(async()=>{
	browser = await puppeteer.launch({
		headless: false
	});
	page = await browser.newPage();
	await page.goto('localhost:3000');
});

afterEach(async ()=>{
	await browser.close();
});


//Testing Logo Text
test('The header (brand-logo) has the correct text.', async ()=>{
	const text = await page.$eval('a.brand-logo', el=>el.innerHTML);
	expect(text).toEqual('Blogster');
});

//Testing OAuth Flow - Login Button
test('After clicking Login button the OAuth flow starts.', async ()=>{
	await page.click('.right a'); //Login with Google
	const url= await page.url();
	expect(url).toMatch(/accounts\.google\.com/);
});




