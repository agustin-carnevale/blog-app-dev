const Page = require('./helpers/page');

let page;

beforeEach(async()=>{
	page = await Page.build();
	await page.goto('http://localhost:3000');
});

afterEach(async ()=>{
	await page.close();
});


//Testing Logo Text
test('The header (brand-logo) has the correct text.', async ()=>{
	const text = await page.getContentOf('a.brand-logo');
	expect(text).toEqual('Blogster');
});

//Testing OAuth Flow - Login Button
test('After clicking Login button the OAuth flow starts.', async ()=>{
	await page.click('.right a'); //Login with Google
	const url= await page.url();
	expect(url).toMatch(/accounts\.google\.com/);
});

//Testing being signed in - Logout Button
test('When signed in, shows logout button.', async ()=>{
	await page.login();
	const text = await page.getContentOf('a[href="/auth/logout"]');
	expect(text).toEqual('Logout');
});


