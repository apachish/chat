//function onDeviceReady(){
var address_file = 'http://chat.asemanapps.ir:4000';
$("#main .contain").css("height",screen.height - $(".top-nav").height() - $("footer").height() + 39);
$("#main .messages-wrapper").css("height",screen.height - $(".top-nav").height() - $("footer").height() - 36);
$("#main .contain").css("overflow-y","scroll");
$("#main .contain").css("overflow-x","hidden");
$(".img-loading").hide();
$(window).on("orientationchange",function(){
    alert("The  	orientation has changed!");
    $("#m").css("width",screen.width - 50+"px");

});
function file(){
    console.log('file js is working');

    var w = window.innerWidth;    console.log('w'+w);

    var h = window.innerHeight;    console.log('h'+h);

    var android_version = getAndroidVersion(); //"4.1.2"
    console.log('android_version'+android_version);

    var version_int = version_to_int(android_version);//4200100
    console.log('version_int'+version_int);

    var local_storage_path = cordova.file.externalDataDirectory;
    console.log('local_storage_path'+local_storage_path);

    var local_application_path = cordova.file.applicationDirectory;
    console.log('local_application_path'+local_application_path);


//file:///android_asset/      applicationDirectory                            r       N/A     N/A     Yes
///data/data/<app-id>/        applicationStorageDirectory             -       r/w     N/A     N/A     Yes
//    cache                   cacheDirectory                      cache       r/w     Yes     Yes*    Yes
//    files                   dataDirectory                       files       r/w     Yes     No      Yes
//        Documents           documents                                       r/w     Yes     No      Yes
//<sdcard>/                   externalRootDirectory               sdcard      r/w     Yes     No      No
//    Android/data/<app-id>/  externalApplicationStorageDirectory     -       r/w     Yes     No      No
//        cache               externalCacheDirectory          cache-external  r/w     Yes     No**    No
//        files               externalDataDirectory           files-external  r/w     Yes     No      No
    console.log('www'+file_exist(local_storage_path+'session.txt'));
    if(file_exist(local_storage_path+'session.txt') == true){
        console.log('readfile');
        console.log("going to exist "+local_storage_path+'session.txt');
        var log = readFile(local_storage_path+'session.txt');
        console.log(log);
        if(log){
            var msg=log.split("####");
            console.log('if'+msg[0]);
            // new_location = window.location.href.replace("index","home");
            //
            // console.log(new_location+'?login='+msg[0]+'&device='+msg[1]);
            // window.location.href = new_location+'?login='+msg[0]+'&device='+msg[1];

            $('#main').show();
            $('#login').hide();
            $('#nav-mobile').show();
            console.log(msg[0]+''+msg[1]);

            $('#session').val(msg[0]);
            $('#user_online').val(msg[1]);
            console.log('session'+msg[0]);
            console.log('user_online'+msg[1]);
            load(msg[0],msg[1]);

        }
    }else{
        console.log('login');
        $('#main').hide();
        $('#nav-mobile').hide();
        $('#login').show();
    }
    $(document).on('keyup','#code',function(){
        console.log('start');
        console.log($(this).val().length);
        if($(this).val().length >= 5) {
            console.log($("#code").val());
            console.log($("#tel").text());
            $.post(address_file+"/start", {
                code: $("#code").val(),
                telephon: $("#tel").text()
            }, function (data) {
                console.log('data' + JSON.stringify(data));
                if (!data.error) {
                    msg = JSON.parse(data.message);
                    console.log(msg);
                    var session = msg.user;
                    var user_online = msg.telephon;
                    console.log('file' + session);
                    // removeFile(local_storage_path+'session.txt');
                    console.log('writefile');
                    res = writeFile(local_storage_path, 'session.txt', session + '####' + user_online);
                    $('#main').show();
                    $('#login').hide();
                    $('#nav-mobile').show();
                    console.log('sessionnn'+session);
                    console.log('user_onlineee'+user_online);
                    $('#session').val(session);
                    $('#user_online').val(user_online);
                    load(session, user_online);
                } else {
                    console.log(data.message);
                }
            });


        }
    });
    $('#logout').click(function () {
        removeFile(local_storage_path+'session.txt');
        $('#main').hide();
        $('#login').show();
        $('#nav-mobile').hide();
        $.post(address_file+"/logout",{
        },function(data) {
alert('logout');
        });
    });


    function load(session,user_online) {
            console.log('loadroom1');
            console.log(address_file+"/loadRoom?session="+session+"&user_online="+user_online);
            $.get(address_file+"/loadRoom?session="+session+"&user_online="+user_online, function (res) {
                user_online = $('#user_online').val();
                session     = $('#session').val();
                console.log(session);
                $.each(res.message, function (index, value) {
                    console.log('rooooooooooom1'+value);

                    value = JSON.parse(value);
                    console.log('rooooooooooom'+value);

                    if(!index){
                        checked="checked";
                        $("#roomnow").val(value.room);
                        $("#contact").val(value.contact);
                        $("#namecontact").val(value.name);
                        window.room = value.room;
                        $(".messages-list").attr('id',window.room);
                    }else{
                        checked="";
                    }
                    html ='<li class="navbar-text navbar-right "  >' ;
                    console.log('imge'+address_file+value.img);
                    html +='<img class="group-avatar" src="'+address_file+value.img+'" />';
                    html += '<a class="joinRoom ' + checked + '"  data-contact="'+value.contact+'" data-id="' + value.room + '">';
                    html += value.name ;
                    html +='</a>';
                    if(value.messagelast != undefined){
                        html += '<span class="group-message">'+ value.messagelast.substr(0, 25)+' ...</span>';
                    }
                    if(value.number){
                        html += '<span class="new-unread">'+value.number+'</span>';
                    }
                    html += '<i class="material-icons done-all">done_all</i>';
                    html +='</li>';
                    $("#Room").append(html);

                });
                var contact = $('#contact').val();

                $.get(address_file+'/loadChat?room='+window.room+'&contact='+contact+'&session='+session+'&user_online='+user_online,function(res){
                    $.each(res.message,function(index,value) {
                        renderMessage(index,value,window.room);
                    });
                    scrollToBottom();
                });
            });
    }
    //else{
    //     console.log('return');
    //     new_location = window.location.href.replace("home","index");
    //     window.location.href = new_location;
    // }
}

function createDir(fileName) {

}

function scanDir(fileName) {
    
}

function download(url,filePath,success,error)
{
    console.log("going to download "+url+" and save to "+filePath);

    var fileTransfer = new FileTransfer();
    var uri = encodeURI(url);

    fileTransfer.download(
        uri,
        filePath,
        function(entry) {
            console.log("succefully download "+url+" to "+filePath);
            //console.log(entry);
            success(entry);
        },
        function(error) {
            console.log("download error"+url+" to "+filePath);
            colsole.log(error);
            error(error);
        },
        false,
        {
            headers: {
                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
        }
    );

    return "Done";
}


function writeFile(basePath,fileName,text) {
    console.log("going to write to "+basePath+fileName);
    window.resolveLocalFileSystemURL(basePath, function(dir) {
        dir.getFile(fileName, {create:true}, function(file) {
            if(!file){
                console.log("write failed");
                return;
            }
            file.createWriter(function(fileWriter) {
                
                fileWriter.seek(fileWriter.length);
                
                var blob = new Blob([text], {type:'text/plain'});
                fileWriter.write(blob);
                console.log("Write was successfull");
            });
        });
    });    
   //return filePath; 
}

function readFile(filePath) {
    console.log("going to readd "+filePath);
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);

    xmlhttp.send(null);
    status = xmlhttp.status;

    if(status==200||status==0)
    {

        return xmlhttp.responseText;
    }else{
        console.log(filePath+" not exists(2)!");
        return false;
    }
}   



function removeFile(filePath,successCallback,failCallback) {
    console.log("going to remove "+filePath);
    if(!file_exist(filePath))
    {
        console.log("file not exists to remove "+filePath);
        return;
    }
    window.resolveLocalFileSystemURL(
        filePath, 
        function gotFile(fileEntry) {
             fileEntry.remove(function() {
                console.log("remove was successfull");
             }, 
             function(e){
                console.log('File remove Error.'+e.code+" "+filePath);
             });
        }, 
        function(e) {
             console.log('File remove Error.'+e.code+" "+filePath);
        }
    );
   return filePath; 
}

function file_exist(filePath){
    console.log("going to read "+filePath);
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);
    xmlhttp.send(null);
    status = xmlhttp.status;
    console.log('status'+status);
    console.log('status report'+xmlhttp.responseText);
    if(status==200||status==0)
    {
        return (xmlhttp.responseText.length > 0)?true:false;
    }else{
        console.log(filePath+" not exists(2)!");
        return false;
    }

}

 function getAndroidVersion(ua) {
         ua = (ua || navigator.userAgent).toLowerCase();
         var match = ua.match(/android\s([0-9\.]*)/);
         return match ? match[1] : false
 };

 function version_to_int(version_string)
 {
         //'4.1.2' => 4100200
         version_string = version_string||'';
         version = version_string.split(".");
         if(version.length==1)
                 return parseInt(version[0])*1000000;
         if(version.length==2)
                 return parseInt(version[0])*1000000+parseInt(version[1])*1000;
         if(version.length==3)
                 return parseInt(version[0])*1000000+parseInt(version[1])*1000+parseInt(version[2]);
     }
document.addEventListener("deviceready", init, false);
function init() {

    navigator.contacts.find(
        [navigator.contacts.fieldType.displayName],
        gotContacts,
        errorHandler);

}

function errorHandler(e) {
    console.log("errorHandler: "+e);
}

function gotContacts(c) {
    console.log("gotContacts, number of results "+c.length);
    html ='';
    user_online = $('#user_online').val();console.log('online'+user_online);
    session     = $('#session').val();console.log('session'+session);
    // $.get(address_file+"/loadContact?session="+session+"&user_online="+user_online, function (res) {
    //     $.each(res.message, function (index, value) {
    //         value = JSON.parse(value);
    //         console.log(value['phoneNumbers']);
    //         $.each(value['phoneNumbers'],function (key ,tel) {
    //             if(tel['type'] == 'mobile'){
    //                 telephon = tel['value'];
    //                 console.log('tel'+tel['value']);
    //             }
    //         });
    //         if(telephon){
    //             html +='<li class="navbar-text navbar-right "  >' ;
    //             html += '<img class="group-avatar" src="'+address_file+'/img/contact-svg.svg" />';
    //             html += '<a class="joinRoom"  data-contact="true" data-id="' + tel_num + '">';
    //             html += value['displayName'];
    //             html +='</a>';
    //             html +='</li>';
    //         }
    //     });
    // });
    if(!html){
        for(var i=0, len=c.length; i<len; i++) {
            $.post(address_file+"/addConntact",
                {listcontact:JSON.stringify(c[i]),name:name,session:session ,user_online : user_online},
                function (res) {
                    if (!res.error) {
                        return false;
                    }
                    return false;
                });
            /*var tel_num = 0;
            if(c[i].phoneNumbers && c[i].phoneNumbers.length > 0){
                c[i].phoneNumbers.forEach(function (item) {
                    if(item.type == 'mobile'){
                        tel_num = item.value.trim().replace(/^(\+98|0098|098|98|0)?/g,"");
                        tel_num = tel_num.replace(/\s/g,'');
                    }
                });
            }
            if(tel_num) {
                console.log('shahhhh'+tel_num);
                html +='<li class="navbar-text navbar-right "  >' ;
                if(c[i].photos && c[i].photos.length > 0) {
                    html += '<img class="group-avatar" src="' + c[i].photos[0].value + '" />';
                }else{
                    html += '<img class="group-avatar" src="'+address_file+'/img/contact-svg.svg" />';
                }
                html += '<a class="joinRoom"  data-contact="true" data-id="' + tel_num + '">';
                html += c[i].displayName;
                html +='</a>';
                html +='</li>';
            }*/
        }
    }
}