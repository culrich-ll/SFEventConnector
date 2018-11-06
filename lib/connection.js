'use strict'

var nforce = require('nforce');
var faye = require('faye');
var notifier = require('node-notifier');
const WindowsToaster = require('node-notifier/notifiers/toaster');

//var clientId = module.parent.exports.clientId, ...

if(process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REDIRECT_URI && process.env.USERNAME && process.env.PASSWORD) {
var org = nforce.createConnection({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  apiVersion: 'v43.0', // optional, defaults to current salesforce API version
  environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
  mode: 'single' // optional, 'single' or 'multi' user mode, multi default
});
var oauth;
org.authenticate({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}, function (err, resp) {
  // store the oauth object for this user
  if (!err) {
    org.oauth = resp;
    var client = new faye.Client(org.oauth.instance_url + '/cometd/43.0/');
    client.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
    // module.exports = org;
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
  }
});
module.exports = org;
}
