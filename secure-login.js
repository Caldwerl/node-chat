var crypto = require("crypto-js");

'use strict';

module.exports = function (collectionUsers, data, callback) {

  //Check the user collection for any matching records
  collectionUsers.find({name_lower: data.name.toLowerCase()}).toArray(function (err, response) {

    if (err) {
        callback(null, {functionName: "sendStatus", data: {category: "alert-danger", message: 'Error on DB'}});
    }

    //If an existing user record is found, check the password
    if (response.length == 1) {

      //If the provided password is correct,
      //allow access and add user to connected list
      if (crypto.SHA256(response[0].salt + data.pass).toString() === response[0].pass) {

        callback(null, {functionName: "newConn", data: response[0].name});

      //Else deny access and request another attempt
      } else {

        callback(null, {functionName: "sendStatus", data:{category: "alert-danger", message: 'Invalid Login'}});
      }

    //If a user is not found, create a salt, hash the password
    //and create a new user record with provided information
    } else {

      var salt = crypto.lib.WordArray.random(256/8).toString();

      var hash = crypto.SHA256(salt + data.pass).toString();

      collectionUsers.insert({name: data.name, pass: hash, salt: salt, name_lower: data.name.toLowerCase()});

      callback(null, {functionName: "newConn", data: data.name});
    }

  });

}

