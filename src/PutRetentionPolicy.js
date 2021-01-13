'use strict';
const AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs();
const RETENTION_IN_DAYS = process.env.RETENTION_IN_DAYS;

exports.main = function (event, context, callback) {
    var params = {
        logGroupName: event.logGroupName,
        retentionInDays: RETENTION_IN_DAYS
    };
    cloudwatchlogs.putRetentionPolicy(params, function (err, data) {
        if (err) {
            callback(Error(err));
        }
        else {
            callback(null, data);
        }
    });
};
