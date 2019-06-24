const mongoose = require("mongoose");
const redis = require("redis");
const { promisify } = require("util");
const keys = require("../config/keys");
const client = redis.createClient(keys.redisURL);
client.hget = promisify(client.hget);
const { exec } = mongoose.Query.prototype;

client.on("error", function(err) {
  console.log("Error " + err);
});
client.on("monitor", function(time, args, raw_reply) {
  console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
});

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashkey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), this.mongooseCollection.name)
  );

  const cachedValue = await client.hget(this.hashkey, key);
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    const result = Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
    console.log("here");
    return result;
  }
  const result = await exec.apply(this, arguments);
  console.log("after");
  client.hset(this.hashkey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
