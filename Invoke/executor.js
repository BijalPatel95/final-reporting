require('dotenv').config();
var AWS = require('aws-sdk');
var ssm = new AWS.SSM();

const notify = require("./src/notifySlack");
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const reportingActions = require('./src/reportingActions');
const impersonate = require('./src/impersonate');
const construction = require('./src/constructionReporting');
const prepared = require('./src/preparedReporting');
const spotfire = require('./src/spotfireReporting');
const superImpose = require('./src/mergePdf');
const mail = require('./src/mailAttachment');
const s3 = require('./src/s3Actions');
const slack = require("./src/slackNotifier");

var uname,pass;


async function handler(event) {
    
    var params = {
        Names: ['/dev/edsAdmin/username','/dev/edsAdmin/password'],
        WithDecryption: true
        };
     
    var request = await ssm.getParameters(params).promise();
    
    var parameters = request.Parameters;
    parameters.forEach(function (value) {
    switch (value.Name) {
        case "/dev/edsAdmin/username":
            uname = value.Value;
            break;
        case '/dev/edsAdmin/password':
            pass = value.Value;
            break;
    }
    });
                
    //Impersonate
    
    // const report = JSON.parse(event.Records[0].body);
    const report = event
    console.log(report);
    const username = report.scheduledBy;
    const reportType = report.reportType;
    const preparedReportName = report.preparedReportName;
    const link = report.link;
    const pageType = report.pageType;
    const pageNumbers = report.pageNumbers;
    const changed_filename = `${report.fileName}.pdf`;
    // const browser = await puppeteer.launch({ headless: false, defaultViewport: null });

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
    });
    const page = await browser.newPage();
    fs.mkdirSync('/tmp/downloads', { recursive: true });
    try {
        await impersonate.login(page, username, uname, pass);
    } catch (e) {
        console.log(e);
        // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : Impersonate was not done - ${e}`);
        notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : Impersonate was not done - ${e}`);
    }
    console.log(reportType);
    //Generate Report
    try {
        if (reportType == 'construction') {
            await construction.constructionReport(page,link);
        } else if (reportType == 'prepared') {
            await prepared.preparedReport(page, link, preparedReportName);
        } else if (reportType == 'spotfire') {
            await spotfire.spotfireReport(page, link, pageType, pageNumbers);
        }
    } catch (e) {
        console.log(e);
        // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error :${e}`);
         notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : Impersonate was not done - ${e}`);
        
    }
    //Rename
    try {
        fs.readdirSync('/tmp/downloads').forEach(file => {
            fs.renameSync('/tmp/downloads/' + file, '/tmp/downloads/' + changed_filename);
            console.log(file);
            console.log('rename done');
        });
    } catch (e) {
        console.log(e);
        // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not renamed - ${e} `);
        notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not renamed - ${e} `);
        
    }
    //Super Impose
    if (reportType == 'spotfire') {
        try {
            await superImpose.superImpose('/tmp/downloads/' + changed_filename);
        } catch (e) {
            console.log(e);
            // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error :${e}`);
             notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error :${e}`);
            
        }
    }
    //upload
    try {
        await reportingActions.uploadReport(report);
    } catch (e) {
        console.log(e);
        // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not uploaded - ${e} `);
        notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not uploaded - ${e} `);
        
    }
    const objectExist = await s3.objectExist(`${report.fund}/${changed_filename}`);

    // mail
    if (objectExist) {
        try {
            console.log('obj exist');
            await mail.mail(report, changed_filename, reportType);
            console.log('mail sent');
        } catch (e) {
            console.log(e);
            // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : Mail was not send. - ${e} `);
            notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : Mail was not send. - ${e} `);
        }
    }

    //delete
    try {
        await fs.unlinkSync('/tmp/downloads/' + changed_filename);
    } catch (e) {
        console.log(e);
        // slack.notifyError(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not deleted - ${e} `);
        notify.notifyErrorOnSlack(`Id: ${report.id}, User:  ${username}, Link: ${link}, Report Type: ${reportType} . Error : File was not deleted - ${e} `);
        
    }

    //logout from portal
    await page.goto(process.env.portal+'/logout');
    //logout from eds admin
    await page.goto(process.env.edsAdmin+'logout');

    await browser.close();
}
exports.handler = handler;