'use strict'; 
require('dotenv').config();
const uuidv1 = require('uuid/v1')
const notify = require("./src/notifySlack");
const reportingActions = require('./src/reportingActions');
const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();
const ssm = new AWS.SSM();

exports.handler = async (event, context, callback) => {
    const asyncFunctions = [];
    const reportList = await reportingActions.getReportsList('Daily', '8AM', undefined);

    let i = 0;
    for (let report of reportList){
        i = i+1;
        var uuid1 = uuidv1();
        asyncFunctions.push(
            startExecution(`Report_${i}_${(new Date().toISOString().split('T')[0])}_${uuid1}`, report)
        )
    }

    try {
        const results = await Promise.all(asyncFunctions);
        return results;    
    } catch (e) {
        throw new Error(e);
    }
};


const startExecution = async (name, input) => {
    return new Promise((resolve, reject) => {
        var params = {
            stateMachineArn: process.env.stepFunction,
            input: JSON.stringify(input),
            name: name
        };
        stepfunctions.startExecution(params, function (err, data) {
            if (err) {
                reject(err);
            }
            describeExecution(data.executionArn)
            // resolve(data)
        });
    });
}


const describeExecution = async (name) => {
    var params = {
        executionArn: name
    };
    var finalResponse =  new Promise(function(resolve,reject){
        var checkStatusOfStepFunction =  setInterval(function(){
            stepfunctions.describeExecution(params, function(err, data) {
                if (err){
                    clearInterval(checkStatusOfStepFunction);
                    reject(err); 
                }
                else {
                    if(data.status !== 'RUNNING'){
                      clearInterval(checkStatusOfStepFunction);
                      resolve(data.output);
                    } 
                    if(data.status === 'FAILED')
                    {
                        notify.notifyErrorOnSlack('Error while calling Executor Lambda');
                    }
                }
            }); 
        },200);
    });
    return finalResponse
}


