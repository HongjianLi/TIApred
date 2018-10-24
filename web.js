#!/usr/bin/env node
'use strict';
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
const port = 4000;
app.listen(port);
console.log('Process %d listening on HTTP port %d in %s mode', process.pid, port, app.settings.env);
