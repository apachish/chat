/**
 * Created by shahriar on 6/22/16.
 */
var socket = io('/');
function showEmoji(msg) {
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
    while (match = reg.exec(msg)) {
        emojiIndex = match[0].slice(7, -1);
        if (emojiIndex > totalEmojiNum) {
            result = result.replace(match[0], '[X]');
        } else {
            result = result.replace(match[0], '<img class="emoji" src="img/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
        };
    };
    reg = /data:image*/;
    reg_bace = /\\*;base64,*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result = '<img class="image" src="'+msg+'" />';//todo:fix this in chrome it will cause a new request for the image
    }else if(reg.exec(msg)){
        msg = msg.replace('data:image','/upload/image');
        result = '<img class="image" src="'+msg+'" />';//todo:fix this in chrome it will cause a new request for the image
    }
    reg = /data:audio*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result ='<audio controls><source src="'+msg+'" type="audio/ogg"><source src="'+msg+'" type="audio/mpeg"></audio>';
    }else if(reg.exec(msg)){
        msg = msg.replace('data:audio','/upload/audio');
        result ='<audio controls><source src="'+msg+'" type="audio/ogg"><source src="'+msg+'" type="audio/mpeg"></audio>';
    }
    reg = /data:application*/;
    if(reg.exec(msg) && reg_bace.exec(msg)){
        result ='<a href="'+msg+'"><img  class="image" src="/img/pdf.png"   ></a>';
    }else if(reg.exec(msg)){
        msg = msg.replace('data:application','/upload/document');
        result ='<a href="'+msg+'"><img class="image" src="/img/pdf.png"></a>';
    }
    return result;
}

$(document).ready(function(){
    var room = $('#room').val();
    function getName() {
            $.get(window.location.origin+'/getName', function(res){
                name = res.name;
            });
        return name;
    }
    var name = getName();alert(name);
    $('#fileupload').change(function(e) {
        if (this.files.length != 0) {
            var file = this.files[0],
                reader = new FileReader(),
                color = $('#colorStyle').val();
            console.log(file.size+file.type);
            reader.onload = function(e) {
                var fd = new FormData();
                fd.append('file', file);
                fd.append('size', file.size);
                fd.append('path', file.path);
                fd.append('name',  file.name);
                fd.append('username', name);
                fd.append('room', room);
                fd.append('type', file.type);
                switch(file.type) {
                    case 'image/jpeg':
                    case 'image/png':
                        $.ajax({
                            url: "/uploadImage", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    console.log('Done upLoad');
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    case 'application/pdf':
                        $.ajax({
                            url: "/uploadPDF", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    console.log(res.message);
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    case 'audio/mp3':
                        $.ajax({
                            url: "/uploadAudio", // Url to which the request is send
                            type: "POST",             // Type of request to be send, called as method
                            data: fd, // Data sent to server, a set of key/value pairs (i.e. form fields and values)
                            contentType: false,       // The content type used when sending data to the server.
                            cache: false,             // To unable request pages to be cached
                            processData:false,        // To send DOMDocument or non processed data file it is set to false
                            success: function (res) {
                                if (!res.error) {
                                    console.log(res.message);
                                    $('#fileupload').val('');
                                }
                            }
                        });
                        break;
                    default:
                        alert("type file undefined");
                        return false;
                        break;
                }
                console.log(e.target.result);
                socket.emit('chat message '+room, e.target.result,name);

            };
            reader.readAsDataURL(file);
        };
        return false;
    });
    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', room,name);
    });
    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('roomname', room,name);
    });
    $('#form').submit(function(){
        if(!name || name.length < 1 || name === 'null') {
            getName();
            alert('please again login');
            return false;
        } else {
            if ($("#m").val() !== "") {
                socket.emit('chat message '+room, $('#m').val() ,name,$("#colorStyle").val());
                $.post("/addChat",
                    {text: $("#m").val(),room:room,font_color : $("#colorStyle").val()},
                    function (res) {
                        if (!res.error) {
                            alert(res.message);
                        }
                    });
                $('#m').val('');
                return false;

            }else{
                alert("please insert text in textbox");
                return false;
            }
        }
    });
    socket.on(room, function(online){
        console.log(">> " +online);
        var html = '';
        $('.contacts-list').html(html);
        $.each(online,function(index,value) {
            if(value){
                html += "<li ng-repeat='user in users'>";
                html += "<a href>";
                html += "<img class='contacts-list-img' src='img/avatars/profile/"+value+".jpg'/>";
                html += "<div class='contacts-list-info'>";
                html += "<span class='ol-memeber-name' style='line-height:2.6; padding:5px; font-weight : 600; color : #333;'>"+value+"</span>";
                html += "</div><!-- /.contacts-list-info --></a></li>";
            }
        });
        $('.contacts-list').html(html);  // append to list
    });
    socket.emit("online-members",function(data){
    });

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    socket.on('chat message '+room, function(msg){
        console.log(">> " +msg);
        renderMessage(msg);
        scrollToBottom();
    });
    function scrollToBottom () {
        console.log($('.content').height());
        $(window).scrollTop($('.content').height());
    }
    function leadZero(number) {
        return (number < 10) ? '0'+number : number;
    }
    function getTime(timestamp) {
        var t, h, m, s, time;
        t = new Date(timestamp);
        h = leadZero(t.getHours());
        m = leadZero(t.getMinutes());
        s = leadZero(t.getSeconds());
        return '' + h  + ':' + m + ':' + s;
    }
    /**
     * renders messages to the DOM
     * nothing fancy
     */
    function renderMessage(value) {
        if(name == value.user_name){
            var html='<li class="messege-row">';
            html +='<ul class="message-list sent-message">';
            html +='<li class="message-single message-first">';
            html +='<div class="avatar-container">';
            html +='<img src="img/avatars/profile/'+value.avatar+'">';
            html +='</div>';
            html +='<div class="message-container">';
            html +='<div class="message-text">';
            html += "<small class='time'>" + getTime(value.created_date) + " </small>";
            html += "<span class='name'>" + value.user_name + ": </span>";
            html += "<span class='msg' style='color:"+value.font_color+"'>" + showEmoji(value.message); + "</span>";
            html +='</div>';
            html +='</div>';
            html +='</li>';
            html +='</ul>';
            html +='</li>';
        }else{
            var html='<li class="messege-row">';
            html +='<ul class="message-list received-message">';
            html +='<li class="message-single message-first">';
            html +='<div class="avatar-container">';
            html +='<img src="img/avatars/profile/'+value.avatar+'">';
            html +='</div>';
            html +='<div class="message-container">';
            html +='<div class="message-text">';
            html += "<small class='time'>" + getTime(value.created_date) + " </small>";
            html += "<span class='name'>" + value.user_name + ": </span>";
            html += "<span class='msg' style='color:"+value.font_color+"'>" + showEmoji(value.message); + "</span>";
            html +='</div>';
            html +='</div>';
            html +='</li>';
            html +='</ul>';
            html +='</li>';
        }
        $('.messages-list').append(html);  // append to list
        return;
    }
    function loadMessages() {
        $.get(window.location.origin+'/loadChat?room='+room,function(res){

            $.each(res.message,function(index,value) {
                renderMessage(value);
            });
            scrollToBottom();
        })
    }
    loadMessages();
    $('#colorStyle').on('change',function () {
        var color = $('#colorStyle').val();
        $('#m').css("color",color);
    })

});