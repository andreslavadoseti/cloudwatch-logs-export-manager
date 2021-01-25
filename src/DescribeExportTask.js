'use strict';
const AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs();

exports.main = function (event, context, callback) {
  let params = {
    taskId: event.taskId
  }
  cloudwatchlogs.describeExportTasks(params, function(err, data) {
    if (err) {
      callback(Error(err));
    }
    else {
      for (let i in data.exportTasks){
        if(data.exportTasks[i].taskId == params.taskId){
          callback(null, data.exportTasks[i]); // successful response
        }
      }
      callback(new Error('Task not found'));
    }
  });
};
