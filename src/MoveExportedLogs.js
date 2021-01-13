'use strict';
const AWS = require('aws-sdk');
var s3 = new AWS.S3();

function copyFiles(parameters, callback) {
  let params = {
    Bucket: parameters.bucketName,
    CopySource: parameters.bucketName+'/'+parameters.sourcePath,
    Key: parameters.destinationPath
  };
  console.log('Copying file from %s, to %s', params.CopySource, params.Key);
  let copyPromise = s3.copyObject(params).promise();
  copyPromise.then(function (data) {
    deleteFiles(parameters, callback);
  }).catch(function (err) {
    console.error(err, err.stack);
    callback(err);
  });
}

function deleteFiles(parameters, callback){
  let params = {
    Bucket: parameters.bucketName, 
    Key: parameters.sourcePath
   };
   console.log('Deleting file %s, from bucket %s', params.Key, params.Bucket);
   let deletePromise = s3.deleteObject(params).promise();
   deletePromise.then(function (data) {
      callback(null, {
        message: "Se han movido los archivos con éxito"
      });
    }).catch(function (err) {
      console.error(err, err.stack);
      callback(err);
    });
}

exports.main = function (event, context, callback) {
  event.Records.forEach(function (record) {
    let bucketName = record.s3.bucket.name;
    let sourcePath = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    let pathArray = sourcePath.split('/');
    let index = pathArray.length - 3;
    pathArray.splice(index, 1);
    let destinationPath = pathArray.join('/');
    if(sourcePath.startsWith("/") && !destinationPath.startsWith("/")){
      destinationPath = "/"+destinationPath;
    }
    let parameters = {
      bucketName: bucketName,
      sourcePath: sourcePath,
      destinationPath: destinationPath
    }
    copyFiles(parameters, callback);
  })
};
