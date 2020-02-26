const query = require("./query");
const Database = require("./database")

async function getReportingUsers(queryToExecute) {
    try {
        const recordSet = await Database.runQuery(queryToExecute)
        return recordSet;
    } catch (e) {
        throw e;
    }
}

exports.getReportsList = async function (reportType, reportingPreference, reportId = undefined) {

    let reportList = [];

    let queryToExecute = '';
    queryToExecute = reportType === 'SI' ? query.NASDAQ_REPORTING_QUERY : query.DAILY_REPORTING_QUERY;

    if (reportId !== undefined) {
        queryToExecute = queryToExecute.concat(` and ur.id in  (${reportId.toString()})`);
    } else {
        let schedulingCriteria = ` AND  urs.schedule ='${reportingPreference}'`;
            
        if(reportingPreference == '8AM'){
            schedulingCriteria = `AND urs.schedule IS NULL`;
        }
        queryToExecute = queryToExecute.concat(schedulingCriteria);
    }

   // console.log(queryToExecute)
    reportList = await getReportingUsers(queryToExecute)
    return reportList
}