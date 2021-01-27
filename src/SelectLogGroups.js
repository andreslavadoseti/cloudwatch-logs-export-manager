'use strict';
const SELECT_COUNT = parseInt(process.env.SELECT_COUNT);
const LOG_GROUP_MIN_AGE = parseInt(process.env.LOG_GROUP_MIN_AGE);

exports.main = function (event, context, callback) {
  if ("logGroups" in event) {
    let currentTimeMillis = new Date().getTime();
    let logGroups = event.logGroups
      .filter(logGroup => {
        return (logGroup.storedBytes > 0) && ((currentTimeMillis - logGroup.creationTime) >= LOG_GROUP_MIN_AGE)
      })
      .sort((logGroupA, logGroupB) => logGroupB.storedBytes - logGroupA.storedBytes);
    let selectedList = [];
    for (let index = 0; index < SELECT_COUNT; index++) {
      let selected = logGroups.shift();
      if (typeof selected !== "undefined") {
        if (selected.storedBytes > 0) {
          selectedList.push(selected);
        }
      } else {
        break;
      }
    }
    let response = {
      "selectedLogGroups": selectedList
    };
    if (logGroups.length > 0){
      response["pendingLogGroups"] = logGroups;
    }
    callback(null, response);
  } else {
    callback(Error("Error: No hay log groups"));
  }
};
