'use strict';
const AWS = require('aws-sdk');
const describeExportTask = require('./DescribeExportTask')
const moment = require('moment-timezone');
const TIME_ZONE = process.env.TIME_ZONE;
const s3 = new AWS.S3();
var functionCallback = null;
var moveParameters = {};
const DESCRIBE_MAX_TRIES = 3;
var DESCRIBE_CURRENT_TRY = 1;
const DATE_FORMAT = process.env.DATE_FORMAT;
const DATE_FOLDER_DELIMITER = process.env.DATE_FOLDER_DELIMITER;

function copyFiles() {
  let params = {
    Bucket: moveParameters.bucketName,
    CopySource: moveParameters.bucketName + '/' + moveParameters.sourcePath,
    Key: moveParameters.destinationPath
  };
  console.log('Copying file from %s, to %s', params.CopySource, params.Key);
  let copyPromise = s3.copyObject(params).promise();
  copyPromise.then(function (data) {
    deleteFiles();
  }).catch(function (err) {
    console.error(err, err.stack);
    functionCallback(err);
  });
}

function deleteFiles() {
  let params = {
    Bucket: moveParameters.bucketName,
    Key: moveParameters.sourcePath
  };
  console.log('Deleting file %s, from bucket %s', params.Key, params.Bucket);
  let deletePromise = s3.deleteObject(params).promise();
  deletePromise.then(function (data) {
    functionCallback(null, {
      message: "Se han movido los archivos con éxito"
    });
  }).catch(function (err) {
    console.error(err, err.stack);
    functionCallback(err);
  });
}

function callToDescribeExport(){
  let describePayload = {
    taskId: moveParameters.pathArray[moveParameters.taskIdIndex]
  };
  describeExportTask.main(describePayload, null, manageResponseAndMove);
}

var manageResponseAndMove = function (err, data) {
  if (err) {
    console.error(err);
    if (DESCRIBE_CURRENT_TRY <= DESCRIBE_MAX_TRIES) {
      DESCRIBE_CURRENT_TRY++;
      callToDescribeExport();
    } else {
      functionCallback(new Error('Describe task fail'));
    }
  }
  else {
    let from = moment(data.from).tz(TIME_ZONE);
    let to = moment(data.to).tz(TIME_ZONE);
    let folder = from.format(DATE_FORMAT) + DATE_FOLDER_DELIMITER + to.format(DATE_FORMAT);
    moveParameters.pathArray[moveParameters.taskIdIndex] = folder;
    let destinationPath = moveParameters.pathArray.join('/');
    if (moveParameters.sourcePath.startsWith("/") && !destinationPath.startsWith("/")) {
      destinationPath = "/" + destinationPath;
    }
    moveParameters['destinationPath'] = destinationPath;
    copyFiles();
  }
}

exports.main = function (event, context, callback) {
  functionCallback = callback;
  event.Records.forEach(function (record) {
    let bucketName = record.s3.bucket.name;
    let sourcePath = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    let pathArray = sourcePath.split('/');
    let index = pathArray.length - 3;
    moveParameters = {
      bucketName: bucketName,
      sourcePath: sourcePath,
      pathArray: pathArray,
      taskIdIndex: index
    }
    callToDescribeExport();
  })
};
