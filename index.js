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
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
// var _               = require('underscore');
var room = {};
var clients = [];
var files_array  = [];

// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'example.com');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//
//     next();
// }
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/*
 sms config
 */
var CLIENT_USERNAME_SMS =   'chat';
var CLIENT_PASSWORD_SMS =   'Hd9_s5mN';
var shortcode_SMS       =   '100098';
/*
 function send sms
 */
function send_sms(telephon,messege){
    var result;
    url =   "http://ws.gama.aseman-sdp.ir/index.php?r=send/index";
    url +=  "&username="+CLIENT_USERNAME_SMS+"&password="+CLIENT_PASSWORD_SMS;
    url +=  "&numbers="+telephon+"&messages="+messege+"&shortcode="+shortcode_SMS;
    url +=  "&fix=true";
    // function success() {
    //     return true;
    // }
    //  request(url, function (error, response, body,success) {
    //     console.log(response);
    //     result = JSON.parse(response.body);
    //     if (!error && response.statusCode == 200 && result.code >=200 && result.code <= 299) {
    //         console.log('send sms');
    //         success();
    //     }else if (!error && response.statusCode == 200 && result.code >= 400 && result.code <= 499) {
    //         console.log(result.message);
    //         return false;
    //     }
    // });
    xhr.open("GET",url,false);
    // //
    xhr.send(null);
    status = xhr.status;
    // //
    if(status==200||status==0)
    {
        // //
        return xhr.responseText;
    }else{
        console.log(url+" not exists(2)!");
        return false;
    }
// return true;
}



app.set('views', path.join(__dirname,'./mobile/www/',''));
app.set('views/contacts.json', path.join(__dirname,'../','views/contacts.json'));
app.use('/css', express.static(path.join(__dirname,'./mobile/www/','css')));
app.use('/js', express.static(path.join(__dirname,'./mobile/www/','js')));
app.use('/img', express.static(path.join(__dirname,'./mobile/www/','img')));
app.use('/fonts', express.static(path.join(__dirname,'./mobile/www/','fonts')));
app.use('/upload', express.static(path.join(__dirname,'./mobile/www/','upload')));
app.use('/upload/image', express.static(path.join(__dirname,'./mobile/www/','upload/image')));
app.use('/upload/audio', express.static(path.join(__dirname,'./mobile/www/','upload/audio')));
app.use('/upload/document', express.static(path.join(__dirname,'./mobile/www/','upload/document')));
app.engine('html', require('ejs').renderFile);
// app.use(allowCrossDomain);
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
    console.log('rooot'+JSON.stringify(req.cookies));
    if(req.cookies.login) {
        pub.SMEMBERS('rooms',function (err, room) {
            res.render('index.html',{user : req.cookies.device,room: room,roomnow:room[0]});
        });
        return;
    }
    if (req.cookies.device) {

        res.render('index.html', { code:true,telephon: req.cookies.device});
    }else{

        res.render('index.html', { code:false ,telephon: null});
    }
});
router.get('/loadfirst',function(req,res){
    console.log('rooot'+JSON.stringify(req.cookies));
    if(req.cookies.login) {
        pub.SMEMBERS('rooms',function (err, room) {
            res.json({"error": false, "message":JSON.stringify({user:req.cookies.login,telephon: req.cookies.device,room: room,roomnow:room[0]})});
        });
        return;
    }
    if (req.cookies.device) {

        res.json({"error": false, "message":JSON.stringify({ code:true,telephon: req.cookies.device})});
    }else{

        res.json({"error": false, "message":JSON.stringify({ code:false ,telephon: null})});
    }
});
var sesssion;
router.post("/register",function(req,res){
    if(req.body.telephon.length < 10) {
        res.json({"error": true, "message": "telephone number must 10 number. example:9372852427."});
    }else{
        var key = Math.floor(Math.random()*90000) + 10000;
        console.log(key);
        pub.sismember("Telephon", req.body.telephon, function (err, response) {
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
            var messege = "code :"+ key;
            result = send_sms(information.name, messege);
            console.log('result sms'+result);
            if (result) {
                pub.HSET(information.name, 'info', JSON.stringify(information));
                console.log('telephon'+information.name);
                res.cookie('device',information.name);
                res.json({"error": false, "message":JSON.stringify(req.session)});
                sesssion = req.session;
            } else {
                res.json({"error": true, "message": "Error can not send sms."});
            }
            return;
        });
    }
});

router.post('/start',function(req,res){

    pub.HGETALL(req.body.telephon.trim(), function (err, information) {
        if(information === null) {
            res.json({"error" : "true","message" : "Database error occured"});
        } else {
            info_user = JSON.parse(information.info);
            if(req.body.code == info_user.verify_code){
                if(typeof req.session.key != 'undefined'){
                    sessions = req.session;
                }else{
                    sessions = sesssion;
                }
                console.log('qqq'+JSON.stringify(sesssion));
                console.log('qq2q'+JSON.stringify(req.session));

                pub.sismember('SESSION_'+info_user.name,sessions.key.session, function (err, status_session) {
                    if(!status_session){
                        pub.SADD('SESSION_'+info_user.name,sessions.key.session);
                        res.cookie('login',sessions.key.session);
                        res.json({"error" : false,"message" :JSON.stringify({user:sessions.key.session,telephon:info_user.name})});
//                           res.render('index.html',{user : req.cookies.device,room:null,roomnow:null,login:sesssion.key.session,device:info_user.name});
                    }else{
                        res.json({"error" : true,"message" : JSON.stringify({user:sessions.key.session,telephon:info_user.name})});
                    }
                });
            }else{
                res.json({"error" : true,"message" : "code error."});

            }

        }

    });
});

router.get('/home',function(req,res){
    // if(req.cookies.login) {
    var roomnow = null;
    pub.LRANGE( req.cookies.device+'_rooms',0,-1,function (err, room) {
        console.log(room);
        if(room[0]){
            console.log('room1'+room);
            roomnow = JSON.parse(room[0]);
            roomnow = roomnow.room;
        }
        console.log('room'+roomnow);
        res.render('index.html',{user : req.cookies.device,room: room,roomnow:roomnow});
    });
    // } else {
    //     res.redirect("/");
    // }
});
router.post("/addRoom",function(req,res){
    if(req.cookies.login || (req.body.session && req.body.user_online)) {
        if(req.cookies.device){
            user =req.cookies.device;
        }else{
            user = req.body.user_online;
        }
        pub.sismember('rooms',req.body.room_name,function (err, statusroom) {
            if(!statusroom){
                pub.SADD('rooms',req.body.room_name,function (err, room) {
                    pub.RPUSH(user+'_rooms',JSON.stringify({room:req.body.room_name,name:req.body.room_name,img:req.body.img,contact:false}),function (err, room) {
                        if(room) {
                            res.json({"error" : false, "message" : "Room is added."});
                        } else {
                            res.json({"error" : true, "message" : "Error while adding Room"});
                        }
                    });
                });
            }else{
                pub.RPUSH(user+'_rooms',JSON.stringify({room:req.body.room_name,name:req.body.room_name,img:req.body.img,contact:false}),function (err, room) {
                    if(room) {
                        res.json({"error" : false, "message" : "Room is added."});
                    } else {
                        res.json({"error" : true, "message" : "Error while adding Room"});
                    }
                });
            }
        });

    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/loadRoom",function(req,res){
    render_rooms =[];
    if(req.cookies.login || (req.query['session'] && req.query['user_online'])) {
        console.log('loadroom');
        if(req.cookies.device){
            user = req.cookies.device;
        }else{
            user = req.query['user_online'];
        }
        console.log(user+'_rooms');

        pub.LRANGE(user+'_rooms',0,-1,function (err, room) {
            room.forEach(function(item) {
                inforoom = JSON.parse(item);
                pub.LRANGE(inforoom.room,-1,-1,function (err, response) {
                    if(response.length >= 1) {
                        message =JSON.parse(response);
                        inforoom.messagelast = message.text;
                        inforoom.number = 3;
                        console.log('item   '+inforoom);
                        render_rooms.push(JSON.stringify(inforoom));
                    }else{
                        render_rooms.push(item);
                    }
                    if(room.length == render_rooms.length){

                        callback(render_rooms);
                    }
                });
            });
            function callback(render_rooms){
                console.log('out'+render_rooms);
                if (render_rooms) {
                    res.json({"error": false, "message": render_rooms});
                } else {
                    res.json({"error": false, "message": render_rooms});
                }
            }

        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});

router.post("/addChat",function(req,res){
    if(req.cookies.login || (req.body.session && req.body.user_online)) {
        if(req.cookies.device){
            name = req.cookies.device;
        }else{
            name = req.body.user_online;
        }
        console.log(req.body);
        if(req.body.contact != 'false'){

            pub.RPUSH(req.body.room,JSON.stringify({name:name,text:req.body.text
                ,color:req.body.font_color,created_date:new Date().getTime()}));
            pub.sismember(name+'_rooms_contact',req.body.contact, function (err, status_contact) {
                if (!status_contact) {
                    pub.SADD(name+'_rooms_contact',req.body.contact);
                    pub.SADD(req.body.contact+'_rooms_contact',name);
                    pub.RPUSH(name + '_rooms', JSON.stringify({
                        room: req.body.room,
                        name: req.body.name,
                        contact: req.body.contact
                    }));
                    pub.RPUSH(req.body.contact + '_rooms', JSON.stringify({
                        room: req.body.room,
                        name: req.body.name,
                        contact: name
                    }));
                }
            });
            res.json({"error" : false, "message" : 'send'});
        }else{
            pub.RPUSH(req.body.room,JSON.stringify({name: name,text:req.body.text
                    ,color:req.body.font_color,created_date:new Date().getTime()})
                ,function (err, response) {
                    if(!response) {
                        res.json({"error" : true, "message" : "Error while adding Chat"});
                    }else{
                        res.json({"error" : true, "message" : response});
                    }
                });
        }
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/loadChat",function(req,res){
    req.body.room = req.query['room'];
    if(req.cookies.login || (req.query['session'] && req.query['user_online'])) {
        if(req.query['contact'] == 'true'){
            console.log('loadchatcontact');
            pub.LRANGE(req.cookies.device+'_'+req.body.room,0,-1,function (err, response) {
                if(response) {
                    res.json({"error" : false, "message" : response});
                }else{
                    res.json({"error" : true, "message" : 'not message'});
                }
            });
        }else{
            console.log('loadchatroom');
            pub.LRANGE(req.body.room,0,-1,function (err, response) {
                if(response) {
                    res.json({"error" : false, "message" : response});
                }else{
                    res.json({"error" : true, "message" : 'not message'});
                }
            });
        }


    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/lastMassegeRoom",function(req,res){
    req.body.room = req.query['room'];
    if(req.cookies.login || (req.query['session'] && req.query['user_online'])) {

        pub.LRANGE(req.cookies.device+'_'+req.body.room,-1,-1,function (err, response) {
            if(response) {
                res.json({"error" : false, "message" : response});
            }else{
                res.json({"error" : true, "message" : 'not message'});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/joinRoom",function(req,res){
    req.body.room = req.query['room'];
    if(req.cookies.login || (req.query['session'] && req.query['user_online'])) {
        if(req.cookies.device){
            name = req.cookies.device;
        }else{
            name =req.query['user_online'];
        }
        if(req.query['contact'] == 'true'){
            console.log('loadchatcontact');
            pub.LRANGE(name+'_'+req.body.room,0,-1,function (err, response) {
                if(response) {
                    res.json({"error" : false, "message" : response});
                }else{
                    res.json({"error" : true, "message" : 'not message'});
                }
            });
        }else{
            console.log('loadchatroom');
            pub.LRANGE(req.body.room,0,-1,function (err, response) {
                if(response) {
                    res.json({"error" : false, "message" : response});
                }else{
                    res.json({"error" : true, "message" : 'not message'});
                }
            });
        }


    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/fetchStatus",function(req,res){
    if(req.cookies.login) {
        pub.HGETALL('status',req.cookies.device,function (err, response) {
            if(response) {
                res.json({"error" : false, "message" : response});
            }else{
                res.json({"error" : false, "message" : 'not message'});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});

router.post("/addStatus",function(req,res){
    if(req.cookies.login) {
        pub.HSET('status',req.cookies.device,req.body.status,function (err, response) {
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

router.post("/addConntact",function(req,res){
    if(req.cookies.login || (req.body.session && req.body.user_online)) {
        console.log('addcontact');
        var tel = [];
        if(req.cookies.device){
            user = req.cookies.device;
        }else{
            user =req.query['user_online'];
        }
        var obj = JSON.parse(req.body.listcontact);
        console.log('wwww'+JSON.stringify(obj));
            name = obj.displayName;
        if(obj.phoneNumbers && obj.phoneNumbers.length>0 ) {
            pub.HSET(user + "_contact", name, JSON.stringify(obj)
                , function (err, response) {
                    listtel = obj.phoneNumbers;
                    listtel.forEach(function (telephon) {
                        if (telephon.type == 'mobile') {
                            tel.push(telephon.value);
                        }
                    });
                });
        }
        res.json({"error" : false, "message" : 'addcontact :'+name});

    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
router.get("/loadContact",function(req,res){
    if(req.cookies.login || (req.query['session'] && req.query['user_online'])) {
        if(req.cookies.device){
            name = req.cookies.device;
        }else{
            name =req.query['user_online'];
        }
        pub.HGETALL(name+'_contact',function (err,info) {
            if(info) {
                res.json({"error" : false, "message" : info});
            } else {
                res.json({"error" : false, "message" : "no contact"});
            }
        });
    } else {
        res.json({"error" : true, "message" : "Please login first."});
    }
});
// route for uploading images asynchronously
router.post('/uploadImage',function (req, res){
    if(req.cookies.login) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/image/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            filename = req.cookies.device + "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/image/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                req.body.room = fields.room;
                req.body.text = 'data:image/'+filename+'.'+type;
                pub.RPUSH(req.body.room,JSON.stringify({name: req.cookies.device,text:req.body.text
                        ,color:null,created_date:new Date().getTime()})
                    ,function (err, response) {
                        res.end();
                    });

            });
        });
    } else {
        res.redirect('/');
    }

});

// route for uploading audio asynchronously
router.post('/uploadAudio',function (req, res){
    if(req.cookies.login) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/audio/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            filename = req.cookies.device+ "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/audio/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                req.body.room = fields.room;
                req.body.text = 'data:audio/'+filename+'.'+type;
                pub.RPUSH(req.body.room,JSON.stringify({name: req.cookies.device,text:req.body.text
                        ,color:null,created_date:new Date().getTime()})
                    ,function (err, response) {
                        res.end();
                    });
            });

        });
    } else {
        res.redirect('/');
    }

});

// route for uploading document asynchronously
router.post('/uploadPDF',function (req, res){
    if(req.cookies.login) {
        var form = new formidable.IncomingForm();
        //Formidable uploads to operating systems tmp dir by default
        form.uploadDir = "../upload/document/";       //set upload directory
        form.keepExtensions = true;     //keep file extension
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            filename = req.cookies.device + "chat" + Date.now();
            filetype = files.file.type;
            type = filetype.split('/');
            fs.rename(files.file.path, '../upload/document/'+filename+'.'+type, function(err) {
                if (err)
                    throw err;
                req.body.room = fields.room;
                req.body.text = 'data:application/'+filename+'.'+type;
                pub.RPUSH(req.body.room,JSON.stringify({name: req.cookies.device,text:req.body.text
                        ,color:null,created_date:new Date().getTime()})
                    ,function (err, response) {
                        res.end();
                    });
            });
        });
    } else {
        res.redirect('/');
    }

});
router.get('/logout',function(req,res){
    if(req.cookies.login) {
        console.log('startlogout');
        pub.SREM("SESSION_"+req.cookies.device,req.cookies.login,function (err,response) {
            res.clearCookie('login');
            res.clearCookie('device');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

app.use('/',router);
io.on('connection', function(socket){
    socket.on('room', function(room,name) {
        console.log('room'+room);
        socket.join(room);

    });
    socket.on('roomname', function(room,name) {

        console.log('a room join ' + room);
        console.log('a user  join ' + name);
        socket.in(room).on('io:name', function (name) {
            io.emit('io:name', name);
        });
        socket.on('chat_message', function(msg,name,color){
            console.log({name:name,text:msg,created_date:new Date().getTime(),color:color});
            io.in(room).emit('chat_message' , {name:name,text:msg,created_date:new Date().getTime(),color:color});
        });
        socket.on('room_message', function(msg,name,color){
            console.log({name:name,text:msg,created_date:new Date().getTime(),color:color});
            io.in(room).emit('room_message' , {name:name,text:msg,created_date:new Date().getTime(),color:color});
        });
        socket.on('disconnect', function(){
            console.log('user leave ' + room);
            socket.leave(room);
        });

    });


});

http.listen(4000,function(){
    console.log("I am running at 4000");
});