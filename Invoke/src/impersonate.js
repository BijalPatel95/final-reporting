require('dotenv').config();
async function login(page, user,uname,pass) {
    const link = process.env.edsAdminImpersonateURL+user;
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: '/tmp/downloads'});    
    await page.goto(process.env.edsAdmin);
    await page.type('input[name=username]', uname, {delay: 20});
    await page.type('input[name=password]', pass, {delay: 20});
    await page.keyboard.press('Enter');
    await page.waitFor(25000);
    await page.goto(link);
    await page.waitFor(30000);
    console.log('impersonate done')
}

exports.login = login;