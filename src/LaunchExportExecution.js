'use strict';
const AWS = require('aws-sdk');
var stepfunctions = new AWS.StepFunctions();

exports.main = function (event, context, callback) {
    var params = {
        stateMachineArn: event.stateMachineArn,
        input: JSON.stringify({"pendingLogGroups": event.pendingLogGroups}),
        name: 'CONTINUE-PENDING_'+event.pendingLogGroups.length+'-'+new Date().getTime()
    };
    var executionPromise = stepfunctions.startExecution(params).promise();
    executionPromise.then(function (data) {
        callback(null, data);
    }).catch(function (err) {
        console.error(err, err.stack);
        callback(Error(err));
    });
};
