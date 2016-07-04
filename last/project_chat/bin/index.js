/**
 * Created by shahriar on 6/14/16.
 */
/**
 Loading all dependencies.
 **/
var express         =     require("express");
var redis           =     require("redis");
var request         =     require('request');
var session         =     require('express-session');
var redisStore      =     require('connect-redis')(session);
var pub             =     require('redis-connection')();
var sub             =     require('redis-connection')('subscriber');
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
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
/*
sms config
 */
var CLIENT_USERNAME_SMS =   'chat';
var CLIENT_PASSWORD_SMS =   'Hd9_s5mN';
var shortcode_SMS       =   '205083';
/*
function send sms
 */
http://ws.mci.aseman-sdp.ir/index.php?r=send/index&username=chat&password=Hd9_s5mN&numbers=09125779218&messages=12345678&shortcode=205083
function send_sms(telephon,messege){
    // var result;
    // url =   " http://ws.mci.aseman-sdp.ir/index.php?r=send/index";
    // url +=  "&username:"+CLIENT_USERNAME_SMS+"&password:"+CLIENT_PASSWORD_SMS;
    // url +=  "&numbers:"+telephon+"&messages="+messege+"&shortcode="+shortcode_SMS;
    // url +=  "&fix=true";
    // request(url, function (error, response, body) {
    //     result = JSON.parse(response.body);
    //     if (!error && response.statusCode == 200 && result.code >=200 && result.code <= 299) {
    //         console.log('send sms');
    //         return true;
    //     }else if (!error && response.statusCode == 200 && result.code >= 400 && result.code <= 499) {
    //         console.log(result.message);
    //         return false;
    //     }
    // });
    return true;
}



app.set('views', path.join(__dirname,'../','views'));
app.use('/css', express.static(path.join(__dirname,'../','css')));
app.use('/js', express.static(path.join(__dirname,'../','js')));
app.use('/img', express.static(path.join(__dirname,'../','img')));
app.use('/upload', express.static(path.join(__dirname,'../','upload')));
app.use('/upload/image', express.static(path.join(__dirname,'../','upload/image')));
app.use('/upload/audio', express.static(path.join(__dirname,'../','upload/audio')));
app.use('/upload/document', express.static(path.join(__dirname,'../','upload/document')));
app.engine('html', require('ejs').renderFile);
app.use(allowCrossDomain);
// IMPORTANT
// Here we tell Express to use Redis as session store.
// We pass Redis credentials and port information.
// And express does the rest !

app.use(session({
    secret: 'ssshhhhh',
    store: new redisStore({ host: 'localhost', port: 6379, client: client}),
    saveUninitialized: false,
    resave: false
}));
app.use(cookieParser("secretSign#143_!223"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/**
 --- Router Code begins here.
 **/

router.get('/',function(req,res){
    console.log(JSON.stringify(req.cookies.device));
    console.log(JSON.stringify(req.cookies.login));
    if(req.cookies.login) {
        console.log('11');

        res.render('home.html');
    }
    if (req.cookies.device) {
        console.log('00');
        res.render('index.html', { code:true });
    }else{
        console.log('22');

        res.render('index.html', { code:false });

    }
});
router.post("/register",function(req,res){
    var key = Math.floor(Math.random() * 99999)+11111;
    console.log(key);
    if(req.body.telephon.length == 10) {
        pub.sismember("Telephon", req.body.telephon, function (err, response) {
            console.log("response: " + JSON.stringify(response));
            if (!response) {
                pub.SADD("Telephon", req.body.telephon);
            }
            information = {
                name: req.body.telephon,
                created: new Date().getTime(),
                verify_code: key,
                status: true,
                trust: 0
            };
            req.session.key = information;
            var messege = 123456;
            result = send_sms(information.name, messege);
            if (result) {
                pub.HSET(information.name, 'info', JSON.stringify(information));
                res.cookie('device',information.name);
                res.json({"error": false, "message": "succsses."});
            } else {
                res.json({"error": true, "message": "Error can not send sms."});
            }
            return;
        });
    }

       // res.json({"error" : true , "message" : "Error Number Telephon."});

});

router.post('/start',function(req,res){
    pub.HGETALL(req.body.telephon, function (err, information) {
            if(information === null) {
                res.json({"error" : "true","message" : "Database error occured"});
            } else {
                info_user = JSON.parse(information.info);
                if(req.body.code == info_user.verify_code){
                    console.log('match');
                    console.log("cookie: "+JSON.stringify(req.session.key.session));
                    if(pub.sismember('SESSION_'+info_user.name,req.session.key.session)){
                        pub.SADD('SESSION_'+info_user.name,req.session.key.session);
                        res.json({"error" : false,"message" : "Login success."});
                        res.cookie('login',req.session.key.session);
                    }else{
                        res.json({"error" : true,"message" : "ERROR."});
                    }
                }else{
                    console.log('not match');
                    res.json({"error" : true,"message" : "code error."});

                }

            }

    });


    // handle_database(req,"login",function(response){
    //     if(response === null) {
    //         res.json({"error" : "true","message" : "Database error occured"});
    //     } else {
    //         if(!response) {
    //             res.json({
    //                 "error" : "true",
    //                 "message" : "Login failed ! Please register"
    //             });
    //         } else {
    //             req.session.key = response;
    //             res.json({"error" : false,"message" : "Login success."});
    //         }
    //     }
    // });
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
        console.log(req.session.key["user_name"]);
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
            console.log(clients[room]);
        }


    });
    // sending online members list

    //room = "testroom";
    socket.on('roomname', function(room,name) {

        console.log('a user  join ' + room);
        socket.on("online-members", function(data){
            console.log("online room:"+ room + "member :"+clients[room]);
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
 //           console.log("cookie: "+JSON.stringify(socket.handshake.headers.cookie));


        });

    });


});

http.listen(4000,function(){
    console.log("I am running at 4000");
});