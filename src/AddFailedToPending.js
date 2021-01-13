'use strict';

exports.main = function (event, context, callback) {
  let failed = event.failedLogGroups;
  let pending = [];
  if ("pendingLogGroups" in event) {
    pending = event.pendingLogGroups;
  }
  Array.prototype.push.apply(pending, failed);
  callback(null, {
    pendingLogGroups: pending
  });
};
