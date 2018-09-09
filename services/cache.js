const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl='redis://127.0.0.1:6379';
const client=redis.createClient(redisUrl);
const util=require('util');

client.get= util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (){
	this.useCache=true;
	return this;
}

mongoose.Query.prototype.exec = async function (){

	if (!this.useCache){
		return exec.apply(this,arguments);
	}


	//The key will be made from the query+collection
	const key = JSON.stringify(
		Object.assign({}, this.getQuery(),{
		collection: this.mongooseCollection.name
	}));


 	// Do we have any cached data in redis related to this query?
    const cachedValue = await client.get(key);


    //If yes, then respond to the request right away
    if (cachedValue){
    	console.log('SERVING FROM CACHE..');
		const doc = JSON.parse(cachedValue);

		//we have to return values as a mongoose document
		return Array.isArray(doc) ?
				doc.map(d=> new this.model(d)):
				new this.model(doc);
      	
    }

    //If not, we need to execute the query and update our cache
    //to store the data
    console.log('SERVING FROM MONGODB..');

    //execute query normally in mongoDB
   	const result = await exec.apply(this,arguments);
    
    //Save in Cache (Redis)
    client.set(key,JSON.stringify(result));

    return result;

}


   
