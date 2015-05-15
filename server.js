var express = require('express');
var app = express();
var server = require('http').Server(app);
var favicon = require('serve-favicon');
var mongo = require('mongodb').MongoClient;
var io = require('socket.io')(server);
var port = 8080;

var userList = {};
var userCount = 0;

var welcomeMsg = "Welcome to the Empty Datacube. Messages below this are old.";

app.use(favicon(__dirname + '/favicon.ico'));
app.use(express.static(__dirname));

app.get('/', function (request, response) {

  response.sendfile('./index.html');
});

mongo.connect('mongodb://localhost/chat', function (err, db) {

  if (err) {
    throw err;
  }

  io.on('connection', function (socket) {

    var collection = db.collection('chatLog');

    //All new clients are intialized with a name of 'Unknown'
    //Add new client name to userList
    userList[socket.id] = 'Unknown';
    userCount += 1;


    //Function for setting the status alert
    var sendStatus = function (data) {
      socket.emit('status', data);
    };

    //Function for updating the number of connected clients
    var sendConn = function (data) {
      io.emit('conn update', data);
    };



    //Populate connected users
    io.to(socket.id).emit('populate names', userList);
    sendConn(userCount);



    //Populate chat history
    collection.find().sort({$natural:-1}).limit(50).toArray(function (err, response) {

      if (err) {
        sendStatus({category: "alert-danger", message: 'Error fetching messages'});
      }

      //Populates top 50 chatLog history and welcome message only to new client
      io.to(socket.id).emit('chat message', response.reverse());
      io.to(socket.id).emit('chat message', {name: 'Server', message: welcomeMsg});
    });

    //Sends connection message and adds new client to every other client
    socket.broadcast.emit('chat message', {name: userList[socket.id], message: "has connected."});
    socket.broadcast.emit('add user', userList[socket.id]);


    //Logic for changing user's name
    socket.on('name change', function(data) {

      io.emit('chat message', {name: "Server", message: data.oldName + " is now known as " + data.name});
      io.emit('name change', data);
      sendStatus({category: "alert-success", message: 'Name changed'});

      userList[data.socketID] = data.name;
    });


    //Logic for inserting into the db and sending a new message
    socket.on('chat message', function (data) {

      collection.insert({socketID: socket.id, name: data.name, message: data.message, date: new Date().toString()});
      io.emit('chat message', {name: data.name, message: data.message});
      sendStatus({category: "alert-success", message: 'Message sent'});
    });


    //Logic for disconnect, removes user from userList and updates connection counter
    socket.on('disconnect', function () {

      io.emit('disconnect', userList[socket.id]);
      delete userList[socket.id];
      sendConn(userCount -= 1);
    });
  });
});


server.listen(port, function() {

  console.log('Server now listening on port ', port);
});
