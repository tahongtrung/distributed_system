var express = require('express');
var app = express();
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000);


var listUsers = [];
var listTyping = [];

io.on('connection', function(socket) {
    //console.log(socket.id+' connected!');
    //diconnected in case user press f5,refresh page
    socket.on("disconnect", function(){
        //console.log(socket.id + " disconnected!");
        if(socket.username !==""){

            listUsers.splice(listUsers.indexOf(socket.username), 1);
            socket.broadcast.emit('server-send-list-users', listUsers);
        }
    });
    //connected in case user register successfully!
    socket.on('client-send-username', function(data) {
        if (listUsers.indexOf(data) !== -1) {
            //console.log('Account have already registered!');
            socket.emit('server-send-register-error', {
                res: data + ' already registered',
                username: data
            });
        } else {
            socket.username = data;
            listUsers.push(data);
            
            //console.log(listUsers);
            socket.emit('server-send-register-success', {
                res: data + ' register successfully',
                username: data
            });
            io.sockets.emit('server-send-list-users',listUsers);
            io.sockets.emit('server-send-list-typing', listTyping);
        }
    });

    socket.on('client-send-logout', function() {
        //console.log(socket.username + ' loged out ');
        listUsers.splice(listUsers.indexOf(socket.username), 1);
        socket.broadcast.emit('server-send-list-users',listUsers);
    });

    socket.on('client-send-message', function(data) {
        io.sockets.emit('server-send-message', {
            id: socket.id,
            username: socket.username,
            message: data
        });
    });

    socket.on('client-send-typing', function() {
        listTyping.push(socket.username);
        socket.broadcast.emit('server-send-list-typing', listTyping);
    });
    socket.on('client-send-stop-typing', function() {
        listTyping.splice(listTyping.indexOf(socket.username), 1);
        socket.broadcast.emit('server-send-list-typing', listTyping);
    });

});

app.get('/', function(req, res) {
    res.render('client');
});
