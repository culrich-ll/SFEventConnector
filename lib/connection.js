'use strict'

var nforce = require('nforce');
var faye = require('faye');
var io = require("socket.io-client");
var socket = io.connect('http://localhost:3000', {reconnect: true});
socket.on('connect', function (socket) {
  console.log('Client connected!');
});
//var clientId = module.parent.exports.clientId, ...

var org = nforce.createConnection({
  clientId: '3MVG9mIli7ewofGuQ0r38ivKaH6j14ArJQx9Qa9EnF7v5LCdew2toxvtEuof0.3PxdRxCqB9IZxn.NqOrDkgB',
  clientSecret: '5196392027591980871',
  redirectUri: 'http://localhost:3000/token',
  apiVersion: 'v43.0',  // optional, defaults to current salesforce API version
  environment: 'production',  // optional, salesforce 'sandbox' or 'production', production default
  mode: 'single' // optional, 'single' or 'multi' user mode, multi default
});
var oauth;
org.authenticate({ username: 'ceciia.ulrich@emprent.dev1', password: 'Schnuff77FeBol3qXQHkQ0uR4Fao59wGd' }, function (err, resp) {
  // store the oauth object for this user
  if (!err) org.oauth = resp;

  var client = new faye.Client(org.oauth.instance_url + '/cometd/43.0/');
  client.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
  client.subscribe('/event/IANA_case_update__e', function (message) {
    console.log(message);
    socket.emit('event', {message: message});
  });
});

module.exports = org;
