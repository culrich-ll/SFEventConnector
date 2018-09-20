var express = require('express');
var app = express();
var router = express.Router();
var nforce = require('nforce');
var org = require('../lib/connection');
var notifier = require('node-notifier');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (org == null) {
    res.render('configuration', {
      title: 'Configuration'
    });
  } else {
    res.render('index', {
      User: org.username,
      Instance: org.oauth.instance_url
    });
  }
});

/* GET the token - this is the callback URL for the SF connected app */
router.get('/token', function (req, res, next) {
  if (org == null) {
    res.render('configuration', {
      title: 'Configuration'
    });
  } else {
    res.render('index', {
      User: org.username,
      Instance: org.oauth.instance_url
    });
  }
});

/* GET configuration page. */
router.post('/configure', function (req, res, next) {
  delete require.cache[require.resolve('../lib/connection')];
  module.exports = req.body;
  require('../lib/connection');
  res.render('index', {
    User: org.username,
    Instance: org.oauth.instance_url
  });
});

router.get('/create-case', function (req, res, next) {
  res.render('create-case', {
    title: 'Create Case'
  });
});

router.get('/create-asset', function (req, res, next) {
  res.render('create-asset', {
    title: 'Create Asset'
  });
});

router.post('/publishCaseEvent', function (req, res, next) {
  var event = nforce.createSObject('Case_creator__e');
  event.set('CaseOrigin__c', req.body.origin);
  event.set('Serial_Number__c', req.body.serialNumber);
  event.set('External_ID__c', req.body.externalId);
  event.set('AssetID__c', req.body.asset);
  event.set('Subject__c', req.body.subject);
  event.set('Priority__c', req.body.priority);
  event.set('Description__c', req.body.description);
  event.set('Command__c', 'CREATE_CASE');
  org.insert({
    sobject: event
  }, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("Case_creator__e published");
    }
  });
  res.redirect('/cases');
  console.log(event);
  notifier.notify({
      title: 'Case created in SF',
      message: req.body.externalId,
      // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: true // Wait with callback, until user action is taken against notification
    },
    function (err, response) {
      // Response is response from notification
    }
  );

});

router.post('/publishAssetEvent', function (req, res, next) {
  var event = nforce.createSObject('Asset_creator__e');
  event.set('Name__c', req.body.name);
  event.set('Description__c', req.body.description);
  event.set('ProductFamily__c', req.body.productFamily);
  event.set('Status__c', req.body.status);
  event.set('SerialNumber__c', req.body.serialNumber);
  event.set('Command__c', 'CREATE_ASSET');
  org.insert({
    sobject: event
  }, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("Asset_creator__e published");
    }
  });
  res.redirect('/assets');
  console.log(event);
  notifier.notify({
      title: 'Asset created in SF',
      message: req.body.externalId,
      // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: true // Wait with callback, until user action is taken against notification
    },
    function (err, response) {
      // Response is response from notification
    }
  );
});


router.get('/create-account', function (req, res, next) {
  res.render('create-account', {
    title: 'Create Account'
  });
});

router.get('/create-contact', function (req, res, next) {
  res.render('create-contact', {
    title: 'Create Contact'
  });
});

router.get('/assets', function (req, res, next) {

  org.query({
      query: "Select Id, AccountId, Name, Description, StockKeepingUnit, Status, SerialNumber From Asset Order By LastModifiedDate DESC"
    })
    .then(function (results) {
      res.render('index-assets', {
        records: results.records
      });
    });

});

router.get('/cases', function (req, res, next) {

  org.query({
      query: "Select Id, CaseNumber, Subject, Origin, Priority, Status From Case Order By LastModifiedDate DESC"
    })
    .then(function (results) {
      res.render('index-cases', {
        records: results.records
      });
    });

});

router.get('/accounts', function (req, res, next) {

  org.query({
      query: "Select Id, Name, Type, Industry, Rating From Account Order By LastModifiedDate DESC"
    })
    .then(function (results) {
      res.render('index-accounts', {
        records: results.records
      });
    });

});

router.get('/contacts', function (req, res, next) {

  org.query({
      query: "Select Id, Name, Email, Phone From Contact Order By Name"
    })
    .then(function (results) {
      console.log('contacts: %s', String(results.records));
      res.render('index-contacts', {
        records: results.records
      });
    });

});

router.post('/create-account', function (req, res, next) {
  var acc = nforce.createSObject('Account');
  acc.set('Name', req.body.name);
  acc.set('Industry', req.body.industry);
  acc.set('Type', req.body.type);


  org.insert({
      sobject: acc
    })
    .then(function (account) {
      res.render('message', {
        title: 'Account Created: ' + String(account.id)
      });
    })
});

router.post('/create-contact', function (req, res, next) {
  var cont = nforce.createSObject('Contact');
  cont.set('FirstName', req.body.firstname);
  cont.set('LastName', req.body.lastname);
  cont.set('Phone', req.body.phone);
  cont.set('Email', req.body.email);



  org.insert({
      sobject: cont
    })
    .then(function (contact) {
      res.render('message', {
        title: 'Contact Created: ' + String(contact.id)
      });
    })
});

router.post('/manage-case', function (req, res, next) {

  if (req.body.close != null) {
    var event = nforce.createSObject('IANA_case_creator__e');
    event.set('CaseID__c', req.body.id);
    event.set('Command__c', 'CLOSE_CASE');
    org.insert({
      sobject: event
    }, err => {
      if (err) {
        console.error(err);
      } else {
        console.log("IANA_case_creator__e published");
      }
      notifier.notify({
          title: 'Case closed',
          message: req.body.externalId,
          // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback, until user action is taken against notification
        },
        function (err, response) {
          // Response is response from notification
        }
      );
    });
    res.redirect('/cases');
  } else if (req.body.delete != null) {
    var cs = nforce.createSObject('Case');
    cs.set('Id', req.body.id);
    console.log('id: %s', req.body.id);
    org.delete({
        sobject: cs
      })
      .then(function (msg) {
        res.render('message', {
          title: 'Case Deleted: ' + String(req.body.id)
        });
      });
  }
});

router.post('/manage-asset', function (req, res, next) {

  if (req.body.close != null) {
    var event = nforce.createSObject('Asset_creator__e');
    event.set('Id__c', req.body.id);
    event.set('Command__c', 'UPDATE_ASSET');
    org.insert({
      sobject: event
    }, err => {
      if (err) {
        console.error(err);
      } else {
        console.log("Asset_creator__e published");
      }
      notifier.notify({
          title: 'Asset changed',
          message: req.body.externalId,
          // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback, until user action is taken against notification
        },
        function (err, response) {
          // Response is response from notification
        }
      );
    });
    res.redirect('/assets');
  } else if (req.body.delete != null) {
    var cs = nforce.createSObject('Asset');
    cs.set('Id', req.body.id);
    console.log('id: %s', req.body.id);
    org.delete({
        sobject: cs
      })
      .then(function (msg) {
        res.render('message', {
          title: 'Asset changed: ' + String(req.body.id)
        });
      });
  }
});

router.post('/delete-account', function (req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Id', req.body.id);
  console.log('id: %s', req.body.id);
  org.delete({
      sobject: acc
    })
    .then(function (msg) {
      res.render('message', {
        title: 'Account Deleted: ' + String(req.body.id)
      });
    });
});

router.post('/delete-contact', function (req, res, next) {

  var acc = nforce.createSObject('Contact');
  acc.set('Id', req.body.id);
  console.log('id: %s', req.body.id);
  org.delete({
      sobject: acc
    })
    .then(function (msg) {
      res.render('message', {
        title: 'Contact Deleted: ' + String(req.body.id)
      });
    });
});

router.get('/account/:id', function (req, res) {
  res.send("Account Created : " + req.params.id);
});


router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Force.com Sample'
  });
});

router.get('/test/query', function (req, res) {
  var query = 'SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 5';
  org.query({
    query: query,
    oauth: req.session.oauth
  }, function (err, resp) {
    if (!err) {
      res.render('query', {
        title: 'query results',
        records: resp.records
      });
    } else {
      res.send(err.message);
    }
  });
});
module.exports = router;