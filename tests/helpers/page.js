const puppeteer = require('puppeteer');
const sessionFactory= require('../factories/sessionFactory');
const userFactory= require('../factories/userFactory');

class CustomPage {

	static async build(){
		const browser = await puppeteer.launch({
			headless: false
		});
		const page = await browser.newPage();
		const customPage= new CustomPage(page, browser);

		return new Proxy(customPage, {
			get: function(target,property){
				return customPage[property] || page[property] || browser[property];
			}
		});

	}

	constructor(page, browser){
		this.page=page;
		this.browser= browser;
	}

	close(){
		this.browser.close();
	}


	async login(){
		//Create a new user and a session cookie
		const user = await userFactory();
		const {session, sig} = sessionFactory(user);

		//Set the cookie to the page
		await this.page.setCookie({name: 'session', value: session});
		await this.page.setCookie({name: 'session.sig',value: sig});

		//Reaload page and wait for rendering
		await this.page.goto('localhost:3000/blogs');
		await this.page.waitFor('a[href="/auth/logout"]');
	}

	async getContentOf(selector){
		return this.page.$eval(selector, el => el.innerHTML);
	}

}

module.exports = CustomPage;