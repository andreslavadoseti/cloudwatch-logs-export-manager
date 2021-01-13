'use strict';

exports.main = function (event, context, callback) {
  if("failedLogGroups" in event){
    let failed = event.failedLogGroups.filter((item) => Object.keys(item).length);
    let pending = [];
    if ("pendingLogGroups" in event) {
      pending = event.pendingLogGroups;
    }
    Array.prototype.push.apply(pending, failed);
    if(pending.length > 0){
      event = {
        pendingLogGroups: pending
      }
    } else {
      event = {}
    }
  }
  callback(null, event);
};
