require('dotenv').config();
async function constructionReport(page,link1) {
    await page.goto(process.env.portal+link1);
    
    await page.waitFor(15000);
    await page.waitForSelector('button#multi-download.mat-menu-trigger.mat-icon-button.mat-button-base');
    await page.$eval( 'button#multi-download.mat-menu-trigger.mat-icon-button.mat-button-base', form => form.click() );
    await page.$eval( 'button#summary-download.mat-menu-item', form => form.click() );
    await page.waitFor(25000);
    console.log('download construction');
}

exports.constructionReport = constructionReport;