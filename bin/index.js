/**
 * Created by shahriar on 6/14/16.
 */
/**
 Loading all dependencies.
 **/
var express         =     require("express");
var redis           =     require("redis");
var mysql           =     require("mysql");
var session         =     require('express-session');
var redisStore      =     require('connect-redis')(session);
var bodyParser      =     require('body-parser');
var cookieParser    =     require('cookie-parser');
var path            =     require("path");
var async           =     require("async");
var client          =     redis.createClient();
var app             =     express();
var http            =     require('http').Server(app);
var io              =     require('socket.io')(http);
var router          =     express.Router();
var fs              =     require('fs');						// fs module for handling file operations
var formidable      =     require('formidable');		// file upload module

var room = {};
var clients = [];
var files_array  = [];


// Always use MySQL pooling.
// Helpful for multiple connections.

var pool    =   mysql.createPool({
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'redis_demo',
    debug    :  false
});

app.set('views', path.join(__dirname,'../','views'));
app.use('/css', express.static(path.join(__dirname,'../','css')));
app.use('/js', express.static(path.join(__dirname,'../','js')));
app.use('/img', express.static(path.join(__dirname,'../','img')));
app.use('/upload', express.static(path.join(__dirname,'../','upload')));
app.use('/upload/image', express.static(path.join(__dirname,'../','upload/image')));
app.use('/upload/audio', express.static(path.join(__dirname,'../','upload/audio')));
app.use('/upload/document', express.static(path.join(__dirname,'../','upload/document')));
app.engine('html', require('ejs').renderFile);

// IMPORTANT
// Here we tell Express to use Redis as session store.
// We pass Redis credentials and port information.
// And express does the rest !

app.use(session({
    secret: 'ssshhhhh',
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));
app.use(cookieParser("secretSign#143_!223"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({limit: '900mb'}));
// app.use(bodyParser.json({limit: '900mb'}));
// This is an important function.
// This function does the database handling task.
// We also use async here for control flow.

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
                        SQLquery = "SELECT * from user_login WHERE user_email='"+req.body.user_email+"' AND `user_password`='"+req.body.user_password+"'";
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

/**
 --- Router Code begins here.
 **/

router.get('/',function(req,res){
    res.render('index.html');
});

router.post('/login',function(req,res){
    handle_database(req,"login",function(response){
        if(response === null) {
            res.json({"error" : "true","message" : "Database error occured"});
        } else {
            if(!response) {
                res.json({
                    "error" : "true",
                    "message" : "Login failed ! Please register"
                });
            } else {
                req.session.key = response;
                res.json({"error" : false,"message" : "Login success."});
            }
        }
    });
});

router.get('/home',function(req,res){
    if(req.session.key) {
        res.render("home.html",{ email : req.session.key["user_name"]});
    } else {
        res.redirect("/");
    }
});
router.get('/chat',function(req,res){
    if(req.session.key) {
        res.render("chat.html",{ email : req.session.key["user_name"]});

    } else {
        res.redirect("/");
    }

});
router.get('/css',function(req,res){
        res.render("style.css");
});
router.get('/getName',function(req,res){
    if(req.session.key) {
        res.json({"error" : false, "name" : req.session.key["user_name"]});
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }

});

router.get("/fetchStatus",function(req,res){
    if(req.session.key) {
        handle_database(req,"getStatus",function(response){
            if(!response) {
                res.json({"error" : false, "message" : "There is no status to show."});
            } else {
                res.json({"error" : false, "message" : response});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }

});

router.post("/addStatus",function(req,res){
    if(req.session.key) {
        handle_database(req,"addStatus",function(response){
            if(!response) {
                res.json({"error" : false, "message" : "Status is added."});
            } else {
                res.json({"error" : false, "message" : "Error while adding Status"});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.post("/addChat",function(req,res){
    if(req.session.key) {
        handle_database(req,"roomChat",function(response){
            req.body.room=response.id;
            handle_database(req,"addChat",function(response){
                if(response) {
                    res.json({"error" : false, "message" : "Error while adding Chat"});
                }
            });
        });

    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.post("/addRoom",function(req,res){
    if(req.session.key) {
        handle_database(req,"addRoom",function(response){
            if(!response) {
                res.json({"error" : false, "message" : "Room is added."});
            } else {
                res.json({"error" : false, "message" : "Error while adding Room"});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/loadChat",function(req,res){
    if(req.session.key) {
        req.body.room = req.query['room'];
        handle_database(req,"roomChat",function(response){
            req.body.room=response.id;

            handle_database(req,"getChat",function(response){
                if(response) {
                    res.json({"error" : false, "message" : response});
                }
            });
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});

router.get("/joinRoom",function(req,res){
    if(req.session.key) {
        res.render("chat.html",{ email : req.session.key["user_name"],room : req.query["room"]});

    } else {
        res.redirect('/');
    }
});
router.get("/loadRoom",function(req,res){
    if(req.session.key) {
        handle_database(req,"getRooms",function(response){
            if(response) {
                res.json({"error" : false, "message" : response});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.post("/register",function(req,res){
    handle_database(req,"checkEmail",function(response){
        if(response === null) {
            res.json({"error" : true, "message" : "This email is already present"});
        } else {
            fs.createReadStream("../img/avatars/"+req.body.avatar).pipe(fs.createWriteStream("../img/avatars/profile/"+req.body.user_name+'.jpg'));
            req.body.avatar = req.body.user_name+'.jpg';
            handle_database(req,"register",function(response){
                if(response === null) {
                    res.json({"error" : true , "message" : "Error while adding user."});
                } else {
                    res.json({"error" : false, "message" : "Registered successfully."});
                }
            });
        }
    });
});

// route for uploading images asynchronously
router.post('/uploadImage',function (req, res){
    if(req.session.key) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/image/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            // console.dir("form.bytesReceived" + JSON.stringify(fields));
            // //TESTING
            // console.log("file size: "+JSON.stringify(files.file.size));
            // console.log("file path: "+JSON.stringify(files.file.path));
            // console.log("file name: "+JSON.stringify(files.file.name));
            // console.log("file type: "+JSON.stringify(files.file.type));
            // console.log("astModifiedDate: "+JSON.stringify(files.file.lastModifiedDate));

            //Formidable changes the name of the uploaded file
            //Rename the file to its original name
            filename = req.session.key["user_name"] + "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/image/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                console.log(fields.room);
                req.body.room = fields.room;
                req.body.text = 'data:image/'+filename+'.'+type;
                handle_database(req,"roomChat",function(response){
                    req.body.room=response.id;
                    handle_database(req,"addChat",function(response){
                        if(response) {
                            res.json({"error" : false, "message" : "Error while adding Chat"});
                        }
                    });
                });
                console.log('renamed complete');
            });
            res.end();
        });
    } else {
        res.redirect('/');
    }

});

// route for uploading audio asynchronously
router.post('/uploadAudio',function (req, res){
    if(req.session.key) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/audio/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            // console.dir("form.bytesReceived" + JSON.stringify(fields));
            // //TESTING
            // console.log("file size: "+JSON.stringify(files.file.size));
            // console.log("file path: "+JSON.stringify(files.file.path));
            // console.log("file name: "+JSON.stringify(files.file.name));
            // console.log("file type: "+JSON.stringify(files.file.type));
            // console.log("astModifiedDate: "+JSON.stringify(files.file.lastModifiedDate));

            //Formidable changes the name of the uploaded file
            //Rename the file to its original name
            filename = req.session.key["user_name"] + "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/audio/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                console.log(fields.room);
                req.body.room = fields.room;
                req.body.text = 'data:audio/'+filename+'.'+type;
                handle_database(req,"roomChat",function(response){
                    req.body.room=response.id;
                    handle_database(req,"addChat",function(response){
                        if(response) {
                            res.json({"error" : false, "message" : "Error while adding Chat"});
                        }
                    });
                });
                console.log('renamed complete');
            });
            res.end();
        });
    } else {
        res.redirect('/');
    }

});

// route for uploading document asynchronously
router.post('/uploadPDF',function (req, res){
    if(req.session.key) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/document/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            // console.dir("form.bytesReceived" + JSON.stringify(fields));
            //TESTING
            // console.log("file size: "+JSON.stringify(files.file.size));
            // console.log("file path: "+JSON.stringify(files.file.path));
            // console.log("file name: "+JSON.stringify(files.file.name));
            // console.log("file type: "+JSON.stringify(files.file.type));
            // console.log("astModifiedDate: "+JSON.stringify(files.file.lastModifiedDate));

            //Formidable changes the name of the uploaded file
            //Rename the file to its original name
            filename = req.session.key["user_name"] + "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/document/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                req.body.room = fields.room;
                req.body.text = 'data:application/'+filename+'.'+type;
                handle_database(req,"roomChat",function(response){
                    req.body.room=response.id;
                    handle_database(req,"addChat",function(response){
                        if(response) {
                            res.json({"error" : false, "message" : "Error while adding Chat"});
                        }
                    });
                });
                console.log('renamed complete');
            });
            res.end();
        });
    } else {
        res.redirect('/');
    }

});
router.get('/logout',function(req,res){
    if(req.session.key) {
        req.session.destroy(function(){
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

app.use('/',router);

io.on('connection', function(socket){
    // console.log(io.sockets);
    socket.on('room', function(room,name) {
        if(name){
            if(room in clients){
                clients[room]=clients[room].join(" , ");
                if(clients[room].indexOf(name) == -1){
                    clients[room]+= name+" , ";
                }
            }else{
                clients[room]= name+" , ";
            }
            clients[room] =clients[room].split(" , ");

            clients.push(clients[room]);
        }


    });
    // sending online members list

    //room = "testroom";
    socket.on('roomname', function(room,name) {

        console.log('a user  join ' + room);
        socket.on("online-members", function(data){
            io.emit(room, clients[room]);
        });
        // socket.emit('listuser',clients);   // send jobs
        // socket.broadcast.emit('chat message','welcome chat here');
        socket.in(room).on('io:name', function (name) {
            io.emit('io:name', name);
        });
        socket.on('chat message '+room, function(msg,name,color){
            io.emit('chat message '+room , {user_name:name,message:msg,created_date:new Date().getTime(),font_color:color,avatar:name+'.jpg'});
        });
        socket.on('disconnect', function(){
            console.log('user leave ' + room);
            socket.leave(room);
            console.log(clients[room].indexOf(name));
            clients[room].splice(clients[room].indexOf(name), 1);
            console.log(clients[room]);
            io.emit(room,clients[room]);   // send jobs

        });

    });


});

http.listen(3000,function(){
    console.log("I am running at 3000");
});