var http = require('http');
var url = require('url');
var redis_lib = require("redis");

function redis_reply(res) {
    return function (err, reply) {
        console.log(err, reply);
        if(err) res.end("There was a problem working with Redis.");
        else res.end(reply);
    }
}

http.createServer(function (req, res) {
    console.log('connect');

    var redis = redis_lib.createClient();
    var query = url.parse(req.url, true).query;

    console.log('query');
    query.key="test";
    query.val="shahriar";
    console.log(query);

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

    redis.on("error", function (err) {
        console.log("Error " + err);
    });

    if(query.key) {
        console.log(query.key);
        if(query.val) {
            console.log("redis.hset");
            redis_reply();
            redis.hset(["kv_repo", query.key, query.val]);
            res.end();
        }
        else {
            console.log("redis.hget");
            redis.hget(["kv_repo", query.key], function(err, reply) {
                res.end(reply);
            });
        }
    }
    else {
        console.log("redis.get");
        redis.hgetall(["kv_repo"], function(err, reply) {
            Object.keys(reply).forEach(function(key) {
                res.write(key + ": " + reply[key] + "\n");
            });
            res.end();
        });
    }

    redis.end();
}).listen(8090);