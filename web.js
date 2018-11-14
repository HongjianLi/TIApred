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
  app.route('/record').get((req, res) => {
//  let v = new validator(req.query);
    if (Object.keys(req.query).length) {
      emrColl.findOne(req.query).then((emr) => { // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
        res.json(emr);
      });
    } else {
      emrColl.find({}, {
        projection: {
          '基线登记.基本信息.姓名': 1,
          '基线登记.基本信息.住院号': 1,
          '基线登记.基本信息.住院日期': 1,
        },
      }).toArray((err, emrArr) => {
        res.json(emrArr);
      });
    }
  }).post((req, res) => {
//  let v = new validator(req.body);
    emrColl.insertOne(req.body).then((commandResult) => {
      res.json({
        insertedId: commandResult.insertedId,
      });
    });
  });
  const port = 4000;
  app.listen(port);
  console.log('Process %d listening on HTTP port %d in %s mode', process.pid, port, app.settings.env);
});
