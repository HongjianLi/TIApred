#!/usr/bin/env node
'use strict';
(async() => {
  // Connect to MongoDB.
  const mongodb = require('mongodb');
  const mongoClient = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }); // poolSize is 5 by default
  const tiaPred = mongoClient.db('TIApred');
  const emrColl = tiaPred.collection('EMRcoll');
  // Initialize the web server.
  const express = require('express');
  const bodyParser = require('body-parser');
  var app = express();
//  app.use(bodyParser.json({ limit: '1mb', strict: false }));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true })); // https://www.npmjs.com/package/body-parser
  app.use(express.static(__dirname + '/public'));
  app.route('/record').get((req, res) => {
    //  let v = new validator(req.body);
    const emr = emrColl.findOne({ // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
      "姓名": req.body["姓名"],
    });
    console.log(emr);
    // Read DB to get a document with req.body["住院号"]
  }).post((req, res) => {
    console.log(req.body);
//  let v = new validator(req.body);
    emrColl.insertOne(emr);
    res.json({}});
  });
  const port = 4000;
  app.listen(port);
  console.log('Process %d listening on HTTP port %d in %s mode', process.pid, port, app.settings.env);
})();
