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

	get(path){
		//This makes a request from the chromium browser instance
		//to make it as real as possible
		return this.page.evaluate((_path) => {
			return fetch(_path, {
				method:'GET',
				credentials:'same-origin',
				headers: {
					'Content-Type':'application/json'
				}
			}).then(res => res.json());
		},path);
	}

	post(path,data){
		//This makes a request from the chromium browser instance
		//to make it as real as possible
		return this.page.evaluate((_path,_data) => {
			return fetch(_path, {
				method:'POST',
				credentials:'same-origin',
				headers: {
					'Content-Type':'application/json'
				}, 
				body: JSON.stringify(_data)
			}).then(res => res.json());
		},path,data);
	}

	execRequests(actions){
		return Promise.all(
			actions.map(({method,path,data}) =>{
				return this[method](path,data);
			})
		);
	}

}

module.exports = CustomPage;