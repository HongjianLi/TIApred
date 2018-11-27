#!/usr/bin/env mongo
db = connect("localhost:27017/predTIA"); // db = new Mongo("localhost:27017").getDB("predTIA");
db.createCollection("records", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: [ "基线登记.基本信息.住院号" ],
         properties: {
            "基线登记.基本信息.住院号": {
               bsonType: "string",
               minLength: 1,
               description: "must be a string and is required",
            },
         },
      },
   },
   validationLevel: "moderate",
})

db.runCommand( {
   collMod: "records",
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: [ "基线登记.基本信息.住院号" ],
         properties: {
            "基线登记.基本信息.住院号": {
               bsonType: "string",
               minLength: 1,
               description: "must be a string and is required",
            },
         },
      },
   },
   validationLevel: "moderate",
})

// Create a unique index for 基线登记.基本信息.住院号
db.records.createIndex({
  "基线登记.基本信息.住院号": 1,
}, {
  unique: true,
})
