'use strict';
const AWS = require('aws-sdk');
var sns = new AWS.SNS();
const TOPIC_ARN = process.env.TOPIC_ARN;
const DEFAULT_SUBJECT = 'Export Logs Notification'

exports.main = function (event, context, callback) {
    console.log(event)
    var subject = 'subject' in event ? event.subject : DEFAULT_SUBJECT;
    var message = '';
    var response = {};
    if('error_data' in event){
        let error = JSON.stringify(event['error_data'], undefined, 4);
        message = 'La exportación del log group a S3 ha fallado.\n\nDETALLES DEL ERROR:\n\n'+error;
        if(event['error_data'].error.Error === 'LimitExceededException'){
            response = {
                logGroupName: event['error_data'].logGroupName,
                retentionInDays: event['error_data'].retentionInDays,
                storedBytes: event['error_data'].storedBytes
            }
            message += "\n\nLos errores de tipo \"LimitExceededException\" se pondran en lista de pendiente para ejecutar en la siguiente iteración."
        } else {
            response = {}
        }
    } else {
        message = event.message;
        response.message = 'Se ha enviado la notificación';
    }
    var params = {
        Message: message,
        Subject: subject,
        TopicArn: TOPIC_ARN
    };
    var publishPromise = sns.publish(params).promise();
    publishPromise.then(function (data) {
        callback(null, response);
    }).catch(function (err) {
        console.error(err, err.stack);
        callback(Error(err));
    });
};
