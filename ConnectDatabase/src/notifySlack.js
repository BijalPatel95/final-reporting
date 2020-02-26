var Lambda = require('aws-sdk/clients/lambda');

exports.notifyErrorOnSlack = (error) => {
    if (process.env.stage === 'local') {
        console.log(error);
    } else {
        const event = {
            channel: 'eds-reporting',
            message: JSON.stringify(error),
            type: 'error',
            title: process.env.stage + '-eds-reporting'
        }
        invokeLambda(event);
    }
}

exports.notifyProcessOnSlack = async (message) => {
    if (process.env.stage === 'local') {
        console.log(message);
    } else {
        const lambda = new Lambda({ region: 'us-east-1' });
        const event = {
            channel: 'eds-reporting',
            'message': message,
            type: 'message',
            title: process.env.stage + '-eds-reporting'
        };
        invokeLambda(event);
    }
}

function invokeLambda(event){
    const lambda = new Lambda({ region: 'us-east-1' });
    const lambdaParams = {
        FunctionName: 'slack-notification',
        InvokeArgs: JSON.stringify(event)
    }
    lambda.invokeAsync(lambdaParams, (error, data) => {
        if (error) {
            console.log('error while calling lambda');
            console.log(error);
        }
    });
}