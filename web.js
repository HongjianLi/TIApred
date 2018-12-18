#!/usr/bin/env node
'use strict';
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }).then((mongoClient) => { // poolSize is 5 by default
  const predTIA = mongoClient.db('predTIA');
  const records = predTIA.collection('records');
  // Initialize the web server.
  const express = require('express');
  const bodyParser = require('body-parser');
  var app = express();
//  app.use(bodyParser.json({ limit: '1mb', strict: false }));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true })); // https://www.npmjs.com/package/body-parser
  app.use(express.static(__dirname + '/public'));
  app.route('/records').get((req, res) => {
//  let v = new validator(req.query);
    records.find({}, {
      projection: req.query,
    }).toArray((err, recordArr) => {
      res.json(recordArr);
    });
  });
  app.route('/record').get((req, res) => {
//  let v = new validator(req.query);
    records.findOne(req.query).then((record) => { // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
      res.json(record);
    });
  }).post((req, res) => {
//  let v = new validator(req.body);
    const record = JSON.parse(req.body.record)
    records.updateOne({ // findOneAndUpdate(filter, update, options, callback). http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOneAndUpdate
      '基线登记.基本信息.住院号': record['基线登记']['基本信息']['住院号'],
    }, {
      $set: record,
    }, {
      upsert: true, // Use upsert instead of insert
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
