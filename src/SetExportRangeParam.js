'use strict';
const AWS = require('aws-sdk');
var ssm = new AWS.SSM();
const EXPORT_RANGE_PARAMETER_NAME = process.env.EXPORT_RANGE_PARAMETER_NAME;
const DEFAULT_EXPORT_RANGE = process.env.DEFAULT_EXPORT_RANGE;

exports.main = function (event, context, callback) {
    let exportRange = DEFAULT_EXPORT_RANGE;
    if ("EXPORT_RANGE" in event) {
        exportRange = event['EXPORT_RANGE'];
    }
    var params = {
        Name: EXPORT_RANGE_PARAMETER_NAME, /* required */
        Value: exportRange, /* required */
        Overwrite: true
    };
    let putParamPromise = ssm.putParameter(params).promise();
    putParamPromise.then(function (data) {
        callback(null, {
            response: "Parametro " + EXPORT_RANGE_PARAMETER_NAME + " actualizado a "+exportRange
        });
    }).catch(function (err) {
        console.error(err, err.stack);
        callback(err);
    });
};