'use strict';
const moment = require('moment-timezone');
const TIME_ZONE = process.env.TIME_ZONE;
const SELECT_COUNT = parseInt(process.env.SELECT_COUNT);

exports.main = function (event, context, callback) {
  if ("logGroups" in event) {
    let endOfLastMonth = moment().tz(TIME_ZONE).subtract(1, 'months').endOf('month').valueOf();
    let logGroups = event.logGroups
      .filter(logGroup => {
        return (logGroup.storedBytes > 0) && (logGroup.creationTime < endOfLastMonth)
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
