'use strict';
const AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs();
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.main = function (event, context, callback) {
  let currentTime = new Date().getTime();
  let logGroupName = event.logGroupName;
  //let from = event.creationTime - 1;
  let params = {
    taskName: logGroupName+-+currentTime,
    logGroupName: logGroupName,
    from: 0,
    to: currentTime,
    destination: BUCKET_NAME,
    destinationPrefix: logGroupName
  }

  cloudwatchlogs.createExportTask(params, function(err, data) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, data); // successful response
    }
  });
};
