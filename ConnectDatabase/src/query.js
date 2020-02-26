const dailyCondition = `
AND (
  ur.reportType = 'Daily' 
  OR dayOfWeek = DATENAME(WEEKDAY,GETDATE()) 
  OR (dayOfMonth = 'FirstDay' AND DATEPART(DAY,GETDATE()) = 1) 
  OR (dayOfMonth = 'LastDay' AND DATEPART(DAY,GETDATE()+1) = 1) 
  OR (reportType LIKE '%13F%' AND CAST(GETDATE()-1 AS DATE) IN (select scheduledDate FROM reportingSchedules where scheduleName = '13F'))
  )
`

const nasdaqCondition = `
AND ur.reportType LIKE '%SI%' 
AND ( 
  CONVERT (date,  GETDATE()+2) IN  (select DISTINCT CAST (fsirdanyexchg_1 AS DATE) from DailyAggNewNasdaq where fsirdanyexchg_1 IS NOT NULL) 
  OR 
  CONVERT (date,  GETDATE()-0) IN  (select DISTINCT CAST (fsirdanyexchg AS DATE) from DailyAggNewNasdaq where fsirdanyexchg IS NOT NULL)
)
`
const reportingQuery = `
select

CASE 
WHEN pr.id IS NOT NULL THEN 'prepared' 
WHEN pb.id IS NOT NULL THEN 'construction'
WHEN ub.bookmarkId  IS NOT NULL THEN 'spotfire'
WHEN n.title = 'Construction' THEN 'construction'
ELSE 'spotfire'
END as reportType,

ur.id,
ur.pageType,
ur.bookmarkId,
ur.analysisName,
ur.scheduledBy, 
uf.firstName,
uf.email,
ur.cc,
ef.trial,
ef.fund,
ur.scheduledBy+'_report_'+CAST(CAST(GETDATE() AS DATE) AS nvarchar)+'_'+CAST(ur.id as nvarchar) fileName,


CASE
WHEN ef.logoUrl IS NOT NULL THEN ef.logoUrl 
ELSE
'https://edsprod.s3.amazonaws.com/home/img/ms-icon-310x310.png'
END logoUrl,

CASE
WHEN ef.logoHeight IS NOT NULL THEN ef.logoHeight 
ELSE
100
END logoHeight,

CASE
WHEN ef.logoWidth IS NOT NULL THEN ef.logoWidth 
ELSE
100
END logoWidth,

CASE
WHEN fi.url IS NOT NULL THEN fi.url 
ELSE
'https://edsprod.s3.amazonaws.com/home/img/ms-icon-310x310.png'
END logo2Url,

CASE
WHEN fi.height IS NOT NULL THEN fi.height 
ELSE
0
END logo2Height,

CASE
WHEN fi.Width IS NOT NULL THEN fi.Width 
ELSE
0
END logo2Width,

CASE 
WHEN pr.id IS NOT NULL THEN n.title 
WHEN pb.id IS NOT NULL THEN 'Construction'
WHEN ub.bookmarkId  IS NOT NULL THEN n.title
ELSE n.title
END as moduleName,

CASE 
WHEN pr.id IS NOT NULL THEN n.link 
WHEN pb.id IS NOT NULL THEN '/poe?bookmark='+CAST(pb.id as nvarchar)
WHEN ub.bookmarkId  IS NOT NULL THEN n.link+'?bookmark='+ub.bookmarkId
ELSE n.link
END as link,

CASE 
WHEN pr.id IS NOT NULL THEN pr.reportName 
WHEN pb.id IS NOT NULL THEN pb.bookmarkName 
WHEN ub.bookmarkId IS NOT NULL THEN ub.bookmarkName 
ELSE ur.analysisName 
END as reportName,

CASE
WHEN apu.path IS NOT NULL THEN apu.pageNumbers
WHEN apf.path IS NOT NULL THEN apf.pageNumbers
ELSE apc.pageNumbers
END pageNumbers,

pr.reportName preparedReportName,

uf.attachment,
pr.messageQuery

from userReport ur
LEFT JOIN user_report_schedule urs ON ur.id = urs.report_id
LEFT JOIN userFund uf ON ur.scheduledBy = uf.username
LEFT JOIN edsFunds ef ON uf.Fund = ef.fund
LEFT JOIN fund_images fi ON fi.fund = ef.fund AND fi.type = 'reportingMail'
LEFT JOIN preparedReports pr ON  pr.id = ur.itemId
LEFT JOIN poeBookmark pb ON CAST(pb.id as nvarchar) = ur.bookmarkId
LEFT JOIN userBookmark ub ON (ur.itemId = ub.itemId OR ur.bookmarkId = ub.bookmarkId)

LEFT JOIN analysisPath ap ON (ub.path = ap.path AND ap.analysisName = ub.analysis AND (ap.fund IS NULL OR ap.fund = ef.fund)) OR (pr.analysisPathId = ap.id)
LEFT JOIN analysisPath apu ON apu.analysisName = ur.analysisName AND apu.fund = uf.Fund AND apu.username = apu.username
LEFT JOIN analysisPath apf ON apf.analysisName = ur.analysisName AND apf.fund = uf.Fund AND apf.username IS NULL
LEFT JOIN analysisPath apc ON apc.analysisName = ur.analysisName AND apc.fund IS NULL AND apc.username IS NULL
        
LEFT JOIN access a ON a.title = ur.analysisName 
LEFT JOIN navbar n ON n.accessId = a.accessId OR ap.accessId = n.accessId

WHERE 
ur.id IS NOT NULL AND ur.disabled = 0 AND uf.deleted = 0 AND scheduledBy = 'test'

`

exports.DAILY_REPORTING_QUERY = `
${reportingQuery}

${dailyCondition}
`
exports.NASDAQ_REPORTING_QUERY = `
${reportingQuery}

${nasdaqCondition}
`