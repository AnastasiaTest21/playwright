const { test, expect } = require('@playwright/test');

test('Order self cach', async ({ page }) => {
    await page.goto('https://www.vseinstrumenti.ru/represent/change/?represent_id=1&represent_type=common&url_to_redirect=https://www.vseinstrumenti.ru/&regionAutocomplete=');
    await page.goto('https://www.vseinstrumenti.ru/pcabinet/registration/');
    await page.waitForSelector('[data-tab-name="email"]');
    await page.click('[data-tab-name="email"]');
    // Ввод логина и пароля, логин
    await page.locator('#login-email').fill('vseins_site_day983@mail.ru');
    await page.locator('#login-password').fill('111111');
    await page.waitForSelector('#login-btn');
    await page.click('#login-btn');
    const title = page.locator('[data-qa="user"]');
    await expect(title).toHaveText('Здравствуйте, Тест');

    // Добавление товара в Корзину
    await page.goto('https://www.vseinstrumenti.ru/instrument/dreli/bezudarnye/aeg/drel_aeg_be_750_r_449160/');
    // Клик на кнопку "В корзину"
    await page.waitForSelector('.product-price [data-behavior="add-to-cart"]');
    await page.click('.product-price [data-behavior="add-to-cart"]');
    await page.waitForSelector('[data-behavior="go-to-cart"]');
    await page.click('[data-behavior="go-to-cart"]');
    await expect(page.locator('[data-behavior="cart-title"]')).toHaveText('Корзина');

});