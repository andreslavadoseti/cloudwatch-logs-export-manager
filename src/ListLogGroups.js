'use strict';
const AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs();

function handleResponse(response, logGroups, callback) {
  Array.prototype.push.apply(logGroups, response.data.logGroups);
  if (!response.data.nextToken) {
    let lightList = logGroups.map(function (item, index, array) {
      return {
        "logGroupName": item.logGroupName,
        "retentionInDays": item.retentionInDays,
        "storedBytes": item.storedBytes,
        "creationTime": item.creationTime
      };
    });
    callback(null, {
      "logGroups": lightList
    });
  }
}

exports.main = function (event, context, callback) {
  let params = {};
  let logGroups = [];
  var request = cloudwatchlogs.describeLogGroups(params);
  request.on('success', function handlePage(response) {
    handleResponse(response, logGroups, callback);
    if (response.hasNextPage()) {
      response.nextPage().on('success', handlePage).send();
    }
  });
  request.on('error', function (error, response) {
    callback(Error(error));
  });
  request.send();
};
