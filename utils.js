module.exports.variables = (serverless) => {
    serverless.cli.consoleLog('Processing variables in utils.js');
    serverless.cli.consoleLog(serverless.cli);
    return {
        retentionInDays: parseInt(serverless.provider.retentionInDays)
    };
};