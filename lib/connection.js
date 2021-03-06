'use strict'

var nforce = require('nforce');
var faye = require('faye');
var notifier = require('node-notifier');
const WindowsToaster = require('node-notifier/notifiers/toaster');

//var clientId = module.parent.exports.clientId, ...

var org = nforce.createConnection({
  clientId: '3MVG9fTLmJ60pJ5IgJHmH8ByBBAstnz33vdaDLBKQ_BYsCyKToP2hgdigBFeeU6Bv70QhNTHG4uNA0iZXqswO',
  clientSecret: '6369620280214979675',
  redirectUri: 'https://assman-simulator.herokuapp.com/token',
  apiVersion: 'v44.0', // optional, defaults to current salesforce API version
  environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
  mode: 'single' // optional, 'single' or 'multi' user mode, multi default
});
var oauth;
org.authenticate({
  username: 'heroku@lam4sf-qa.com',
  password: 'secretPassword77iN514A2L9XJzJP1kJaEvhHyo'
}, function (err, resp) {
  // store the oauth object for this user
  if (!err) org.oauth = resp;
  var client = new faye.Client(org.oauth.instance_url + '/cometd/44.0/');
  client.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
  /*client.subscribe('/event/IANA_case_update__e', function (message) {
    console.log(message);
    notifier.notify({
        title: 'Case updated in SF',
        message: message.payload.KBA_External_ID__c,
        // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: true // Wait with callback, until user action is taken against notification
      },
      function (err, response) {
        // Response is response from notification
      }
    );
  });
  */
});


module.exports = org;