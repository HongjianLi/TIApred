#!/usr/bin/env node
'use strict';
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }).then((mongoClient) => { // poolSize is 5 by default
  const tiaPred = mongoClient.db('TIApred');
  const emrColl = tiaPred.collection('EMRcoll');
  // Initialize the web server.
  const express = require('express');
  const bodyParser = require('body-parser');
  var app = express();
//  app.use(bodyParser.json({ limit: '1mb', strict: false }));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true })); // https://www.npmjs.com/package/body-parser
  app.use(express.static(__dirname + '/public'));
  app.route('/records').get((req, res) => {
//  let v = new validator(req.query);
    emrColl.find({}, {
      projection: req.query,
    }).toArray((err, emrArr) => {
      res.json(emrArr);
    });
  });
  app.route('/record').get((req, res) => {
//  let v = new validator(req.query);
    emrColl.findOne(req.query).then((emr) => { // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
      res.json(emr);
    });
  }).post((req, res) => {
//  let v = new validator(req.body);
    emrColl.updateOne({ // Use upsert instead of insert
      '基线登记.基本信息.住院号': req.body['基线登记']['基本信息']['住院号'],
    }, { $set: req.body }, {
      upsert: true,
    }).then((commandResult) => {
      res.json({
        result: commandResult.result,
      });
    }, (error) => {
      console.error(error);
      res.json({
        errmsg: error.errmsg,
      });
    });
  });
  const port = 4000;
  app.listen(port);
  console.log('Process %d listening on HTTP port %d in %s mode', process.pid, port, app.settings.env);
});
