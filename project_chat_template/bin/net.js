// Load the TCP Library
var net             =       require('net');
var mysql           =       require("mysql");
var async           =       require("async");
var io              =       require('socket.io')(net);

// Keep track of the chat clients
var clients = [];
// Always use MySQL pooling.
// Helpful for multiple connections.
var room;


// Start a TCP Server
net.createServer(function (socket) {
    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");


    // Put this new client in the list
    clients.push(socket);


    // broadcast(socket.name + " joined the chat\n", socket);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        var check = data.toString();
        check = check.trim();
       /*
       create room
       write /room
        */
        if (!check.search('@')) {
            socket.room = check;
            socket.write("room : " + socket.room + "\n");
            return;

        }
        /*
        write /exit disconent
         */
        if (!check.search('/') && check.search('exit')== 1) {
            console.log('exit command received: ' + socket.name + '\n');
            socket.destroy();
            var idx = clients.indexOf(socket);
            if (idx != -1) {
                delete clients[idx];
            }
            return;
        }
        console.log(socket.room);
        broadcast(socket.name + "> " + data, socket);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            console.log('dsdas'+socket.room);

            // Don't want to send it to sender
            if (client === sender) return;
            if(!socket.room) return;
            client.in[socket.room].write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");