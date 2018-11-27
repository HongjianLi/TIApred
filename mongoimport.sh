#!/usr/bin/env bash
mongoimport --db predTIA --collection recordsImported --type csv --headerline --columnsHaveTypes --mode upsert --upsertFields 基线登记.基本信息.住院号 --file records.csv
