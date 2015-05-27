var express = require('express');
var app = express();
var server = require('http').Server(app);
var favicon = require('serve-favicon');
var mongo = require('mongodb').MongoClient;
var io = require('socket.io')(server);
var crypto = require("crypto-js");
var randomColor = require('./random-color');

'use strict';

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

    var collectionChat = db.collection('chatLog');
    var collectionServer = db.collection('serverLog');
    var collectionUsers = db.collection('users');

    //Function for setting the status alert
    var sendStatus = function (data) {
      socket.emit('status', data);
    };

    //Function for updating the number of connected clients
    var sendConn = function (data) {
      io.emit('conn update', data);
    };

    //Function for new connection
    var newConn = function (data) {

      //Populate connected users
      io.to(socket.id).emit('populate names', userList);
      userCount += 1;
      sendConn(userCount);

      //Populate chat history
      collectionChat.find().sort({$natural:-1}).limit(50).toArray(function (err, response) {

        if (err) {
          sendStatus({category: "alert-danger", message: 'Error fetching messages'});
        }

        //Populates top 50 chatLog history and welcome message only to new client
        io.to(socket.id).emit('chat message', response.reverse());
        io.to(socket.id).emit('chat message', {name: 'Server', message: welcomeMsg});
      });

      //Sends connection message and adds new client to every other client
      collectionServer.insert({socketID: socket.id, name: userList[socket.id].name, message: 'Connect', date: new Date().toString()});
      socket.emit('chat message', {name: 'Server', message: userList[socket.id].name + " has connected."});
      socket.broadcast.emit('add user', userList[socket.id]);
      sendStatus({category: "alert-success", message: 'Login Successful'});

      //Removes login form and sets clients name in site
      io.to(socket.id).emit('set name', userList[socket.id]);
    };




    socket.on('login', function (data) {

      //Check the user collection for any matching records
      collectionUsers.find({name_lower: data.name.toLowerCase()}).toArray(function (err, response) {

        if (err) {
            sendStatus({category: "alert-danger", message: 'Error on Login'});
        }

        //If an existing user record is found, check the password
        if (response.length == 1) {

          //If the provided password is correct,
          //allow access and add user to connected list
          if (crypto.SHA256(response[0].salt + data.pass).toString() === response[0].pass) {

            userList[socket.id] = {name: response[0].name, color: randomColor()};

            newConn(response[0].name);

          //Else deny access and request another attempt
          } else {

            sendStatus({category: "alert-danger", message: 'Invalid Login'});
          }

        //If a user is not found, create a salt, hash the password
        //and create a new user record with provided information
        } else {

          var salt = crypto.lib.WordArray.random(256/8).toString();

          var hash = crypto.SHA256(salt + data.pass).toString();

          collectionUsers.insert({name: data.name, pass: hash, salt: salt, name_lower: data.name.toLowerCase()});

          userList[socket.id] = {name: data.name, color: randomColor()};

          newConn(data.name);
        }

      });

    });

    //Logic for inserting into the db and sending a new message
    socket.on('chat message', function (data) {

      collectionChat.insert({socketID: socket.id, name: data.name, message: data.message, date: new Date().toString()});
      io.emit('chat message', {name: data.name, message: data.message, color: userList[socket.id].color});
      sendStatus({category: "alert-success", message: 'Message sent'});
    });


    //Logic for disconnect, removes user from userList and updates connection counter
    socket.on('disconnect', function () {

      //Checks if the user disconnecting has logged in, if not, no action needed
      if (userList[socket.id].name != undefined) {
        collectionServer.insert({socketID: socket.id, name: userList[socket.id].name, message: 'Disconnect', date: new Date().toString()});
        io.emit('disconnect', userList[socket.id]);
        delete userList[socket.id];
        sendConn(userCount -= 1);
      }
    });
  });
});


server.listen(port, function() {

  console.log('Server now listening on port ', port);
});
