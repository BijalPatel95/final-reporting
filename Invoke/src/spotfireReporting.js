require('dotenv').config();
async function scrollExportSettings(frame) {
    try {
        let i = 0;
        while (i < 10) {
            const [scroll] = await frame.$x('//*[@class="sf-export-view-container"]/div/div[1]/div[2]/div[2]');
            scroll.click();
            i++;
        }
    } catch (e) {
        throw e;
    }
}
async function spotfireReport(page, link1, pageType, pageNumbers) {
    await page.goto(process.env.portalAnalysis + link1);
    await page.waitForSelector('mat-icon#downloadPDF.material-icon.cursor-pointer.mat-icon.notranslate.material-icons.mat-icon-no-color.ng-star-inserted');
    await page.$eval('mat-icon#downloadPDF.material-icon.cursor-pointer.mat-icon.notranslate.material-icons.mat-icon-no-color.ng-star-inserted', form => form.click());
    await page.waitFor(15000);
    const elementHandle = await page.$('iframe');
    const frame = await elementHandle.contentFrame();
    console.log(`Setting parameters in Iframe`);
    let currentOperation = "Setting Parameters In Iframe";
    try {

        currentOperation = "Set Page Type";
        await getExportWhatValue(pageType, pageNumbers);
        currentOperation = "Click What to include";
        const [include] = await frame.$x('//div[text()="What to include"]');
        await include.click();
        currentOperation = "Unselect Page Titles";
        const [page_title] = await frame.$x('//div[text()="Page titles"]');
        await page_title.click();
        currentOperation = "Unselect Annotations";
        const [annotations] = await frame.$x('//div[text()="Annotations"]');
        await annotations.click();
        currentOperation = "Click What To Include";
        const [to_include] = await frame.$x('//div[text()="What to include"]');
        await to_include.click();
        currentOperation = "Click A4";
        const [a4] = await frame.$x('//div[text()="A4"]');
        await a4.click();
        currentOperation = "Select A3";
        const [a3] = await frame.$x('//div[text()="A3"]');
        await a3.click();

        currentOperation = "Click Fit To Page";
        try {
            const [fit] = await frame.$x('//div[text()="Fit to PDF page"]');
            await fit.click();
        } catch (e) {
            await scrollExportSettings(frame);
            const [fit] = await frame.$x('//div[text()="Fit to PDF page"]');
            await fit.click();
        }

        currentOperation = "Click On More Settings";
        try {
            const [more_settings] = await frame.$x('//div[text()="More settings"]');
            await more_settings.click();
        } catch (e) {
            await scrollExportSettings(frame);
            const [more_settings] = await frame.$x('//div[text()="More settings"]');
            await more_settings.click();
        }

        currentOperation = "Select Normal To Change Margin";
        try {
            const [normal] = await frame.$x('//div[text()="Normal"]');
            await normal.click();
            await page.waitFor(5000);
        } catch (e) {
            await scrollExportSettings(frame);
            const [normal] = await frame.$x('//div[text()="Normal"]');
            await normal.click();
            // await page.waitFor(5000);
        }

        currentOperation = "Set Margin To Wide";
        try {
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
       
        } catch (e) {
            await scrollExportSettings(frame);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
        }

        await page.waitFor(8000);
        const [download] = await frame.$x('/html/body/div[5]/div[3]/div[1]/button[1]');
        if (download) await download.click();
        await page.waitFor(5000);
        await page.waitFor(10000);


    } catch (e) {
        throw new Error(`Operation :  ${currentOperation} . Error :${e}`);
    }

    async function getExportWhatValue(pageType, pageNumbers) {
        const [specific_page] = await frame.$x('//div[text()="Specific pages"]');
        specific_page.click();
        const values = {
            "ActivePage": `//div[text()="Current page"]`,
            "ActivePageOnePagePerVisualization": `//div[text()="Current page"]`,
            "AllPages": `//div[text()="All pages"]`,
            "AllPagesOnePagePerVisualization": `//div[text()="All pages"]`
        };

        try {
            if (pageType == 'AllPages' && pageNumbers != null) {
                console.log("Page Numbers Detected To Export : " + pageNumbers);
                const [page_num] = await frame.$x('//*[@class="sf-export-view-container"]/div/div[1]/div[1]/div[2]/div/div[4]/div[2]/div/input');
                await page_num.click();
                await page.keyboard.type(pageNumbers);
                await page.waitFor(5000);
                const [include] = await frame.$x('//div[text()="What to include"]');
                await include.click();
            } else {
                const [pg_typ] = await frame.$x(values[pageType]);
                await pg_typ.click();
            }

            if (pageType == 'ActivePageOnePagePerVisualization') {
                const [active_page] = await frame.$x('//div[text()="Create one PDF page per visualization"]');
                await active_page.click();
            }

        } catch (e) {
            throw e;
        }
    }
}

exports.spotfireReport = spotfireReport;