'use strict'

var nforce = require('nforce');
var faye = require('faye');
var notifier = require('node-notifier');
const WindowsToaster = require('node-notifier/notifiers/toaster');

//var clientId = module.parent.exports.clientId, ...

var org = nforce.createConnection({
  clientId: '3MVG9mIli7ewofGsW5BO9Y3KywKmjxxSsSCQHohMaEGRnPEkIT3p.Qrorua2bhWy_DCQkL0RO5ieT7i9THfQp',
  clientSecret: '4472962632084236591',
  redirectUri: 'https://secret-anchorage-90043.herokuapp.com/token',
  apiVersion: 'v43.0', // optional, defaults to current salesforce API version
  environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
  mode: 'single' // optional, 'single' or 'multi' user mode, multi default
});
var oauth;
org.authenticate({
  username: 'herokuapp@empolis.pdms',
  password: 'secretHerokuPwd123456789d0Z0jmUHFGtBD8swN8FhdOWo8'
}, function (err, resp) {
  // store the oauth object for this user
  if (!err) org.oauth = resp;
  if (org.oauth) {
    var client = new faye.Client(org.oauth.instance_url + '/cometd/43.0/');
    client.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
    client.subscribe('/event/IANA_case_update__e', function (message) {
      console.log(message);
      notifier.notify({
          title: 'Case updated in SF',
          message: message.payload.External_ID__c,
          // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback, until user action is taken against notification
        },
        function (err, response) {
          // Response is response from notification
        }
      );
    });
  }
});


module.exports = org;