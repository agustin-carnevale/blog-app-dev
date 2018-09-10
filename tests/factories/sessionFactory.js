const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip= new Keygrip([keys.cookieKey]);


module.exports = user => {

	//We create the cookie session manually to login without having to go through 
	//the entire real google OAuth flow many times in a row
	const sessionObject ={
		passport: {
			user: user._id.toString()
		}
	};
	const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
	const sig = keygrip.sign('session=' + session);

	return {session, sig};

};