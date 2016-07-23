// Load the TCP Library
var net             =       require('net');
var mysql           =       require("mysql");
var async           =       require("async");

// Keep track of the chat clients
var clients = [];
// Always use MySQL pooling.
// Helpful for multiple connections.

var pool    =   mysql.createPool({
    connectionLimit : 10000,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'redis_demo',
    debug    :  false
});
function handle_database(req,type,callback) {
    async.waterfall([
            function(callback) {
                pool.getConnection(function(err,connection){
                    if(err) {
                        // if there is error, stop right away.
                        // This will stop the async code execution and goes to last function.
                        callback(true);
                    } else {
                        callback(null,connection);
                    }
                });
            },
            function(connection,callback) {
                var SQLquery;
                var SQLSelect;
                switch(type) {
                    case "login" :
                        SQLquery = "SELECT * from user_login WHERE user_email='"+req+"' ";//AND `user_password`='"+req.body.user_password+"'
                        console.log(SQLquery);
                        break;
                    case "checkEmail" :
                        SQLquery = "SELECT * from user_login WHERE user_email='"+req.body.user_email+"'";
                        break;
                    case "register" :
                        SQLquery = "INSERT into user_login(user_email,user_password,user_name,avatar) VALUES ('"+req.body.user_email+"','"+req.body.user_password+"','"+req.body.user_name+"','"+req.body.avatar+"')";
                        break;
                    case "addStatus" :
                        SQLquery = "INSERT into user_status(user_id,user_status) VALUES ("+req.session.key["user_id"]+",'"+req.body.status+"')";
                        break;
                    case "getStatus" :
                        SQLquery = "SELECT * FROM user_status WHERE user_id="+req.session.key["user_id"];
                        break;
                    case "roomChat" :
                        SQLquery = "SELECT id FROM room WHERE room_name='"+req.body.room+"'";
                        break;
                    case "addChat" :
                        SQLquery = "INSERT into chat(user_id,message,room,font_color) VALUES ("+req.session.key["user_id"]+",'"+req.body.text+"','"+req.body.room+"','"+req.body.font_color+"')";
                        break;
                    case "getChat" :
                        SQLquery = "SELECT * FROM chat as c LEFT JOIN user_login as u on c.user_id = u.user_id WHERE  room ='"+req.body.room+"' ORDER BY created_date ASC";
                        break;
                    case "addRoom" :
                        SQLquery = "INSERT into room(room_name) VALUES ('"+req.body.room_name+"')";
                        break;
                    case "getRooms" :
                        SQLquery = "SELECT * FROM room as r WHERE 1";
                        break;
                    default :
                        break;
                }
                callback(null,connection,SQLquery);
            },
            function(connection,SQLquery,callback) {
                connection.query(SQLquery,function(err,rows){
                    connection.release();
                    if(!err) {
                        if(type === "login") {
                            callback(rows.length === 0 ? false : rows[0]);
                        } else if(type === "getStatus") {
                            callback(rows.length === 0 ? false : rows);
                        } else if(type === "getChat") {
                            callback(rows.length === 0 ? false : rows);
                        } else if(type === "getRooms") {
                            callback(rows.length === 0 ? false : rows);
                        }else if(type === "checkEmail") {
                            callback(rows.length === 0 ? false : true);
                        } else if(type === "roomChat") {
                            callback(rows.length === 0 ? false : rows[0]);
                        }
                        else {
                            callback(false);
                        }
                    } else {
                        // if there is error, stop right away.
                        // This will stop the async code execution and goes to last function.
                        callback(true);
                    }
                });
            }],
        function(result){
            // This function gets call after every async task finished.
            if(typeof(result) === "boolean" && result === true) {
                callback(null);
            } else {
                callback(result);
            }
        });
}

// Start a TCP Server
net.createServer(function (socket) {
    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");
    socket.write("please insert username:\n");
    var username = false;

    // Put this new client in the list
    clients.push(socket);


    // broadcast(socket.name + " joined the chat\n", socket);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        var check = data.toString();
        check = check.trim();
        if(!username){

            handle_database(check,"login",function(response){
                if(response){
                    username= response.user_name;
                    socket.write("please insert password:\n");

                }else{
                    socket.write("please insert username:\n");
                }
            });
        }
        /*
        write /exit disconent
         */
        if (!check.search('/') && check.search('exit')== 1) {
            console.log('exit command received: ' + username + '\n');
            socket.destroy();
            var idx = clients.indexOf(socket);
            if (idx != -1) {
                delete clients[idx];
            }
            return;
        }
        broadcast(username + "> " + data, socket);

    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");