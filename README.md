# SFEventConnector

PRE-REQUISITES

- you will need a Salesforce Org that has a Connected app
- for the customization (platform events and triggers) check the project documentation and get the specified branch
- and you will need npm --> https://www.npmjs.com/

INSTALLATION

$ npm install

CONFIGURATION

Create a Connected app in Salesforce:

    - Choose an app name
    - Enter your email adress
    - Enable the Ouath Settings
    - Put the following callback URL:
        http://localhost:3000/token
        
    - Enable the following scopes:
        Api
        Web
        RefreshToken
        OpenID

    Takes note on the generated consumer key and consumer secret.

Put your SF username, password (with token), the clientId (consumer key) and the clientSecret (consumer secret) from the ConnectedApp in the lib/connection.js 

START

$ npm start 

The application is available now via http://localhost:3000/ 

USE CASES

1. create a case via Node app 
    http://localhost:3000/ to check your displayed username and instance URL
    http://localhost:3000/cases to get the list of all cases
    On the page 'Create case' you will fire the event 'IANA_case_creator__e' by clicking on 'Create' via cometD with your paramaters - see router.post('/publishEvent', ...) in the javascript file index.js

2. update cases in Salesforce
    After updating a Salesforce case the 'CaseUpdated' trigger will call the IANACaseService.publishEvent() service which fires the 'IANA_case_update__e' platform event
    Because we are subscriber of this event (see client.subscribe('/event/IANA_case_update__e') in the connection.js), you will get a windows notification in your Node app


