'use strict';
const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();
const ssm = new AWS.SSM();
const moment = require('moment-timezone');
const TIME_ZONE = process.env.TIME_ZONE;
const BUCKET_NAME = process.env.BUCKET_NAME;
const EXPORT_RANGE_PARAMETER_NAME = process.env.EXPORT_RANGE_PARAMETER_NAME;
const DEFAULT_EXPORT_RANGE = process.env.DEFAULT_EXPORT_RANGE;

function createExportTask(event, exportRange, callback) {
  let logGroupName = event.logGroupName;
  let lastMonthDate = moment().tz(TIME_ZONE).subtract(1, 'months');
  let firstDay = lastMonthDate.clone().startOf('month');
  let lastDay = lastMonthDate.clone().endOf('month');
  let fromTime = firstDay.valueOf();
  let toTime = lastDay.valueOf();
  if(exportRange === DEFAULT_EXPORT_RANGE){
    fromTime = event.creationTime; 
  }
  let params = {
    taskName: logGroupName+'-'+moment().tz(TIME_ZONE).valueOf(),
    logGroupName: logGroupName,
    from: fromTime,
    to: toTime,
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
}

exports.main = function (event, context, callback) {
  let parameterPromise = ssm.getParameter({
    Name: EXPORT_RANGE_PARAMETER_NAME,
    WithDecryption: false
  }).promise();
  parameterPromise.then(function (data) {
    createExportTask(event, data.Parameter.Value, callback);
  }).catch(function (err) {
      console.error(err, err.stack);
      callback(err);
  });
};
