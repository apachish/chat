var socket = io('ws://chat.asemanapps.ir:4000', { query: "platform=web" });
var address ="http://chat.asemanapps.ir:4000";
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
            result = result.replace(match[0], '<img class="emoji" src="'+address+'/img/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
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
        result ='<a href="'+msg+'"><img  class="image" src="'+address+'/img/pdf.png"   ></a>';
    }else if(reg.exec(msg)){
        msg = msg.replace('data:application','/upload/document');
        result ='<a href="'+msg+'"><img class="image" src="'+address+'/img/pdf.png"></a>';
    }
    return result;
}

$(document).on("ready",function(){
    var room;
    $(".form-profile").hide();
    var user_online = $('#user_online').val();
    var session = $('#session').val();
    $('#new-group').click(function(e){
        $('.bold').removeClass('active');
        $(this).parent('li').addClass('active');
        // prompt for person's name before allowing to post
        name = window.prompt("Insert name for Room?");
        if (name  === null) {
            $("#nav-mobile").css("margin-left","5%");
            return; //break out of the function early
        }
        if(name.length < 3) {
            alert("please insert character in input(min 3 Character)");
        }
        if(name.length >= 3) {
            var session         = $('#session').val();
            var user_online     = $('#user_online').val();
            $.post(address+"/addRoom",
                { room_name : name ,session : session ,user_online :user_online,img:'/img/room/1.jpge'},
                function(res){
                    if(!res.error) {
                        console.log(res.message);
                        $("#roomnow").val(name);
                        $("#namecontact").val(name);
                        $("#contact").val(false);
                        window.room = name;
                        $(".messages-list").attr('id',name);
                        $('.messages-list').html("");
                        html ='<li class="navbar-text navbar-right "  >' ;
                        html +='<img class="group-avatar" src="'+address+'/img/room/1.jpge" />';
                        html += '<a class="joinRoom"  data-contact="false" data-id="' + name + '">';
                        html += name ;
                        html +='</a>';
                        html +='</li>';
                        $("#Room").append(html);
                        $("#nav-mobile").css("margin-left","5%");
                    }
                });
            return name;
        }
        return false;
    });
    $(document).on('click','.user_contact',function(){
        var joinroom = $(this).attr('data-id');
        var text = $('span',this).text();
        user_online = $('#user_online').val();
        session     = $('#session').val();
        $("#roomnow").val(joinroom+'_'+user_online);
        $('.messages-list').html("");
        $(".messages-list").attr('id',joinroom+'_'+user_online);
        $('#chat').show();
        $.get(address+"/loadRoom?session="+session+"&user_online="+user_online, function (res) {
            $("#Room").html('');
            $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom checked"  data-contact="'+joinroom+'" data-id="'+joinroom+'_'+user_online+'">' + text + '</a></li>');
            $("#contact").val(joinroom);
            $("#namecontact").val(text);
            $.each(res.message, function (index, value) {
                value = JSON.parse(value);
                $("#Room").append('<li class="navbar-text navbar-right "  ><a class="joinRoom ' + checked + '"  data-contact="'+value.contact+'" data-id="' + value.room + '">' + value.name + '</a></li>');
            });
        });
        window.room = joinroom;
        $.ajax({
            url:  address+"/joinRoom?room="+joinroom+"&session="+session+"&user_online="+user_online,
            type: "GET",             // Type of request to be send, called as method
            data: {room: joinroom,session: session, user_online : user_online},
            contentType: false,       // The content type used when sending data to the server.
            cache: false,             // To unable request pages to be cached
            processData:false,        // To send DOMDocument or non processed data file it is set to false
            success: function (res) {
                if (!res.error) {
                    $.each(res.message,function(index,value) {
                        renderMessage(index,value,window.room);
                        scrollToBottom();
                    })
                }else{
                    console.log('add room error');
                }
            }
        });
    });
    $(document).on('click','.navbar-text',function(){
        $(".send-btn").hide();
        $(".attach-file-div").show();
        $(".group-contain").hide();
        var joinroom = $(this).find("a").attr('data-id');
        var contact  = $('#contact').val($(this).find("a").attr('data-contact'));
        user_online = $('#user_online').val();
        session     = $('#session').val();
        $('#namecontact').val($(this).find("a").text());
        $("#roomnow").val(joinroom);
        $('.messages-list').html("");
          window.room = joinroom;
        $(".messages-list").attr('id',window.room);
        $.ajax({
            url:  address+"/joinRoom?room="+joinroom+"&contact="+$(this).find("a").attr('data-contact')+"&session="+session+"&user_online="+user_online,
            type: "GET",             // Type of request to be send, called as method
            data: {room: joinroom,contact: $(this).find("a").attr('data-contact'),session: session, user_online : user_online},
            contentType: false,       // The content type used when sending data to the server.
            cache: false,             // To unable request pages to be cached
            processData:false,        // To send DOMDocument or non processed data file it is set to false
            success: function (res) {
                if (!res.error) {
                        $.each(res.message,function(index,value) {
                            renderMessage(index,value,window.room);
                            scrollToBottom();
                    })
                }else{
                    console.log('add room error');
                }
            }
        });
        $(".back-icon").removeClass("hide");
        $(".chat-contain").show();
    });
    $(document).on('click','#chat-list',function(){
        $(".back-icon").addClass("hide");
        $(".chat-contain").hide();
        $(".group-contain").show();
    });
    $(document).on('click','#profile',function(){
      $('.bold').removeClass('active');
      $(this).parent('li').addClass('active');
      $("#Room").html("");
      $('#chat').hide();
      $('.form-profile').show();
      $("#nav-mobile").css("margin-left","5%");

    });
    $(document).on('click','.loadContactlist',function(){
        user_online = $('#user_online').val();
        session     =  $('#session').val();
      $.get(address+"/addConntact?session="+session+"&user_online="+user_online, function (res) {
        $("#Room").html("");
        $("#Room").html('<img src="'+address/+'img/load.png" class="loadContactlist logo-img" alt="loadContactlist">');
        $.each(res.message, function (index, value) {
            $.each(value.phoneNumbers,function (key ,tel) {
                if(tel.type == 'mobile'){
                    telephon = tel.value;
                }
            });
            html  = '<li class="navbar-text navbar-right ">';
            html += '<a class="user_contact"  data-id="' + telephon + '">';
            html +=  '<span>'+value.displayName+'</span> : '+ telephon;
            html += '</a></li>';
            $("#Room").append(html);
        });
          return false;
      });
    })
    $(document).on('click','#contacts',function(){
        user_online = $('#user_online').val();
        session     = $('#session').val();
      $('.bold').removeClass('active');
      $(this).parent('li').addClass('active');
        $.get(address+"/loadContact?session="+session+"&user_online="+user_online, function (res) {
            $("#Room").html("");
            $("#chat").hide();
            $(".form-profile").hide();
            $("#Room").html('<img src="'+address+'/img/load.png" class="loadContactlist logo-img" alt="loadContactlist">');
            $.each(res.message, function (index, value) {
                value = JSON.parse(value);
                $.each(value.phoneNumbers,function (key ,tel) {
                    if(tel.type == 'mobile'){
                        telephon = tel.value;
                    }
                    if(!room){
                      $("#roomnow").val(tel.number);
                      window.room= tel.number;
                    }
                });
                html  = '<li class="navbar-text navbar-right ">';
                html += '<a class="user_contact"  data-id="' + telephon + '">';
                html +=  '<span>'+ value.displayName +'</span> : '+ telephon;
                html += '</a></li>';
                $("#Room").append(html);
            });
        });
        // $("#nav-mobile").css("margin-left","240px");

    });



    $('#fileupload').change(function(e) {
        if (this.files.length != 0) {
            var file = this.files[0],
                reader = new FileReader(),
                color = $('#colorStyle').val();
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
                socket.emit('chat_message_'+window.room,e.target.result,name);
            };
            reader.readAsDataURL(file);
        };
        return false;
    });

    $('#form').submit(function(){
        window.room = $("#roomnow").val();
        contact = $("#contact").val();
        name = $("#namecontact").val();
        user_online = $('#user_online').val();
        session     = $('#session').val();
        if ($("#m").val() !== "") {
            socket.emit('chat_message', $('#m').val() ,$('#user_online').val(),$("#colorStyle").val());
            socket.emit('room_message', $('#m').val() ,$('#user_online').val(),$("#colorStyle").val());
            $.post(address+"/addChat",
                {text: $("#m").val(),room:window.room,font_color : $("#colorStyle").val(),contact:contact,name:name,session:session ,user_online : user_online},
                function (res) {
                    if (!res.error) {
                        return false;

                    }
                    return false;
                });
            $('#m').val('');
            return false;

        }else{
            alert("please insert text in textbox");
            return false;
        }
    });

    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', $("#roomnow").val(),$("#user_online").val());
    });
    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('roomname', $("#roomnow").val(),$("#user_online").val());
    });
    socket.on('chat_message', function(msg){
        renderMessage('send',msg, $("#roomnow").val());
        scrollToBottom();
    });
    socket.on('room_message', function(msg){
        renderMessageroom('send',msg, $("#roomnow").val());
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


    /**
     * renders messages to the DOM
     * nothing fancy
     */

    $('#colorStyle').on('change',function () {
        var color = $('#colorStyle').val();
        $('#m').css("color",color);
    })

});
function renderMessage(index,value,room) {
    if(index != 'send'){
        value = JSON.parse(value);
    }
    var html ='';
    user_online = $('#user_online').val();
    if(user_online == value.name){
        html='<li class="messege-row">';
        html +='<ul class="message-list sent-message">';
        html +='<li class="message-single message-first">';
        html +='<div class="avatar-container">';
        html +='<img src="'+address+'/img/avatars/avatar.jpg">';
        html +='</div>';
        html +='<div class="message-container">';
        html +='<div class="message-text">';
        html += "<small class='time'>" + getTime(value.created_date) + " </small>";
        html += "<span class='name'>" + value.name + ": </span>";
        html += "<span class='msg' style='color:"+value.color+"'>" + showEmoji(value.text); + "</span>";
        html +='</div>';
        html +='</div>';
        html +='</li>';
        html +='</ul>';
        html +='</li>';
    }else{
        html='<li class="messege-row">';
        html +='<ul class="message-list received-message">';
        html +='<li class="message-single message-first">';
        html +='<div class="avatar-container">';
        html +='<img src="'+address+'/img/avatars/avatar.jpg">';
        html +='</div>';
        html +='<div class="message-container">';
        html +='<div class="message-text">';
        html += "<small class='time'>" + getTime(value.created_date) + " </small>";
        html += "<span class='name'>" + value.name + ": </span>";
        html += "<span class='msg' style='color:"+value.font_color+"'>" + showEmoji(value.text); + "</span>";
        html +='</div>';
        html +='</div>';
        html +='</li>';
        html +='</ul>';
        html +='</li>';
    }
    $('#'+room).append(html);  // append to list
    return;
}
function renderMessageroom(index,value,room) {
    if(index != 'send'){
        value = JSON.parse(value);
    }
    var html ='';
        html='<span>';
        html += "<small class='time'>" + getTime(value.created_date) + " </small>";
        html += "<span class='name'>" + value.name + ": </span>";
        html += "<span class='msg' style='color:"+value.color+"'>" + showEmoji(value.text); + "</span>";
        html +='</span>';
    $('#last_'+room).append(html);  // append to list
    return;
}
function getTime(timestamp) {
    var t, h, m, s, time;
    t = new Date(timestamp);
    h = leadZero(t.getHours());
    m = leadZero(t.getMinutes());
    s = leadZero(t.getSeconds());
    return '' + h  + ':' + m + ':' + s;
}

function scrollToBottom () {
    $(window).scrollTop($('.messages-list').height());
    $('.messages-wrapper').scrollTop($('.messages-wrapper')[0].scrollHeight);
}
function leadZero(number) {
    return (number < 10) ? '0'+number : number;
}