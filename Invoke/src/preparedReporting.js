require('dotenv').config();
async function preparedReport(page,link1,preparedReportName) {
    await page.waitFor(15000);
    await page.goto(process.env.portalAnalysis+link1);
    await page.waitForSelector('mat-icon#downloadPDF.material-icon.cursor-pointer.mat-icon.notranslate.material-icons.mat-icon-no-color.ng-star-inserted');
    await page.$eval( 'mat-icon#downloadPDF.material-icon.cursor-pointer.mat-icon.notranslate.material-icons.mat-icon-no-color.ng-star-inserted', form => form.click() );
    await page.waitFor(25000);
    const elementHandle = await page.$('iframe');
    const frame = await elementHandle.contentFrame();
    const [dropdown] = await frame.$x('//*[@class="sf-export-view-container"]/div/div[1]/div[1]/div[2]/div/div[12]/div[2]/div/div/div[1]/div[1]/div');
    if(dropdown) dropdown.click();
    await page.waitFor(3000);
    const [name] = await frame.$x(`//Div[text()="${preparedReportName}"]`);
    if(name) name.click();
    await page.waitFor(3000);
    const [download] = await frame.$x('/html/body/div[5]/div[3]/div[1]/button[1]');
    if(download) download.click();
    await page.waitFor(5000);
    await page.waitFor(10000);
    console.log('download preparedReport');
}

exports.preparedReport = preparedReport;