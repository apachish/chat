var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis_lib = require("redis");

app.get('/', function(req, res){
    res.sendfile('index.html');
});

// io.on('connection', function(socket){
//     console.log('a user connected');
//     socket.on('disconnect', function(){
//         console.log('user disconnected');
//     });
// });

function redis_reply(res) {
    return function (err, reply) {
        console.log(err, reply);
        if(err) res.end("There was a problem working with Redis.");
        else res.end(reply);
    }
}
io.on('connection', function(socket){
    console.log('a user connected');
    socket.broadcast.emit('chat message','welcome chat here');
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});