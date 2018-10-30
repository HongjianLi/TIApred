#!/usr/bin/env node
'use strict';
const mongodb = require('mongodb');
const express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
const port = 4000;
app.listen(port);
console.log('Process %d listening on HTTP port %d in %s mode', process.pid, port, app.settings.env);
/*
(async() => {
  const mongoClient = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }); // poolSize is 5 by default
  const tiaPred = mongoClient.db('TIApred');
  const info = tiaPred.collection('info');
  const doc = {
    "基线登记": {
      "基本信息": {
        "身份证号": "4401053215325325",
        "姓名": "天生一个丽宝",
        "民族": "汉",
      },
      "发病情况": {},
      "既往病史": {},
    },
  }
  info.insertOne(doc);
})();
*/
