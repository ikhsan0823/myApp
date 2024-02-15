const Redis = require("ioredis");
const redisUri = "rediss://default:AVNS_ckBDT8EWS_p2BmX-aSp@redis-fb69e67-thisistips919-289a.a.aivencloud.com:20499"
const redis = new Redis(redisUri);

redis.set("key", "hello world");

redis.get("key").then(function (result) {
    console.log(`The value of key is: ${result}`);
    redis.disconnect();
});