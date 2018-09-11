const Page = require('./helpers/page');

let page;

beforeEach(async()=>{
	page = await Page.build();
	await page.goto('localhost:3000');
});

afterEach(async ()=>{
	await page.close();
});


//Testing Blog Creation

describe('When logged in', async () =>{
	beforeEach(async ()=>{
		await page.login();
		await page.click('a.btn-floating'); //(+) Button

	});

	test('Can see blog creation form.', async ()=>{
		//We see form labels
		const label = await page.getContentOf('form label');
		expect(label).toEqual('Blog Title');

	});

	describe('And using valid inputs', async()=>{
		beforeEach(async ()=>{
			await page.type('.title input','My Test Title');
			await page.type('.content input','My Test Content');
			await page.click('form button'); //Submit Button
		});

		test('Submitting takes user to review screen', async()=>{
			const text = await page.getContentOf('h5');
			expect(text).toEqual('Please confirm your entries');
		});

		test('Submitting then saving adds post to index page', async()=>{
			await page.click('button.green'); //Saving Button
			await page.waitFor('.card'); //Have to wait for the page to render

			const title = await page.getContentOf('.card-title');
			const content = await page.getContentOf('p');

			expect(title).toEqual('My Test Title');
			expect(content).toEqual('My Test Content');
		});

	});

	describe('And using invalid inputs', async()=>{
		beforeEach(async ()=>{
			await page.click('form button'); //Submit Button
		});

		test('The form shows an error message', async()=>{
			const titleError  = await page.getContentOf('.title .red-text');
			const contentError = await page.getContentOf('.content .red-text');

			expect(titleError).toEqual('You must provide a value');
			expect(contentError).toEqual('You must provide a value');
		});

	});

});


describe('When not logged in', async () =>{

	test('User cannot create a blog post',async()=>{

		//This makes a request from the chromium browser instance
		//to make it as real as possible
		const result = await page.evaluate(() => {
			return fetch('/api/blogs', {
				method:'POST',
				credentials:'same-origin',
				headers: {
					'Content-Type':'application/json'
				}, 
				body: JSON.stringify({title:'My Title', content:'My Content'})
			}).then(res => res.json());
		});

		expect(result).toEqual({error: 'You must log in!'});
	});

	test('User cannot get a blog posts',async()=>{

		//This makes a request from the chromium browser instance
		//to make it as real as possible
		const result = await page.evaluate(() => {
			return fetch('/api/blogs', {
				method:'GET',
				credentials:'same-origin',
				headers: {
					'Content-Type':'application/json'
				}
			}).then(res => res.json());
		});

		expect(result).toEqual({error: 'You must log in!'});
	});

});







