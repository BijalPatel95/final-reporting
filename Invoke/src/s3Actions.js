require('dotenv').config();
const AWS = require('aws-sdk')
const fs = require('fs');
const slack = require("./slackNotifier");
const notify = require("./notifySlack");
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucketName = process.env.bucketName;

async function uploadFile(src, dest, tags) {
    try {

        const data = await fs.readFileSync(src);
        var base64data = new Buffer.from(data, 'binary');

        const params = {
            Body: base64data,
            Bucket: bucketName,
            Key: dest,
            Tagging: tags
        };
        console.log('put obj')
        await s3.putObject(params, (err, data) => {
            if (err) notify.notifyErrorOnSlack(`Error Uploading File ${dest} : ${err}`)
        }).promise();
        return true;
    } catch (err) {
        console.log(`${src} \n ${err}`);
        notify.notifyErrorOnSlack(`Object Not uploaded to s3 : ${dest}`)
        return false;
    }
}

async function objectExist(key) {
    const params = {
        Bucket: bucketName,
        Key: key
    };

    try {
        await s3.headObject(params).promise();
        return true;
    } catch (err) {
        // slack.notifyError(`Object Not Found On s3 : ${key}`)
        return false;
    }
}

exports.objectExist = objectExist;
exports.uploadFile = uploadFile;