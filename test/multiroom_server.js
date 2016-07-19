// (c) Copyright 2011 Aditya Ravi Shankar (www.adityaravishankar.com). All Rights Reserved. 
// NowJS and Node.js Tutorial – Creating a multi room chat client
// http://www.adityaravishankar.com/2011/10/nowjs-node-js-tutorial-creating-multi-room-chat-server/

var html = require('fs').readFileSync(__dirname+'/multiroom.html');
var server = require('http').createServer(function(req, res){
    res.end(html);
});
server.listen(8080);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

// List of available rooms
everyone.now.serverRoomsList = {'room1':'Room 1','room2':'Room 2','room3':'Room 3'};

// Send message to everyone on the users group
everyone.now.distributeMessage = function(message){
    //console.log('Received message from '+this.now.name +' in serverroom '+this.now.serverRoom);
    var group = nowjs.getGroup(this.now.serverRoom);
    group.now.receiveMessage(this.now.name+'@'+this.now.serverRoom, message);
};

everyone.now.changeRoom = function(newRoom){
    var oldRoom = this.now.serverRoom;
    console.log('Changed user '+this.now.name + ' from '+oldRoom + ' to '+newRoom);
    //if old room is not null; then leave the old room
    if(oldRoom){
        var oldGroup = nowjs.getGroup(oldRoom);
        oldGroup.removeUser(this.user.clientId);
        // Tell everyone he left :)
        oldGroup.now.receiveMessage('SERVER@'+oldRoom, this.now.name + ' has left the room and gone to '+newRoom);
    }
    var newGroup = nowjs.getGroup(newRoom);
    newGroup.addUser(this.user.clientId);
    // Tell everyone he joined
    newGroup.now.receiveMessage('SERVER@'+newRoom, this.now.name + ' has joined the room');
    this.now.serverRoom = newRoom;
};