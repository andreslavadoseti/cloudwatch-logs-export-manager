'use strict';
const AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs();

exports.main = function (event, context, callback) {
  let params = {
    taskId: event.taskId
  }
  cloudwatchlogs.describeExportTasks(params, function(err, data) {
    if (err) {
      callback(err);
    }
    else {
      let found = false;
      for (let i in data.exportTasks){
        if(data.exportTasks[i].taskId == params.taskId){
          callback(null, data.exportTasks[i]); // successful response
          found = true;
        }
      }
      if(!found) {
        callback(new Error('Task not found'));
      }
    }
  });
};
