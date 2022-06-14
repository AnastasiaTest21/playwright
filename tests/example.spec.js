const { test, expect } = require('@playwright/test');

test.use({ viewport: {  width: 1820, height: 1070 }});

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

    await page.goto('https://www.vseinstrumenti.ru/instrument/shurupoverty/akkumulyatornye-dreli/');
    // Клик на первую кнопку "В корзину"
    await page.waitForSelector('[data-behavior="add-to-cart"]');
    await page.click('[data-behavior="add-to-cart"]', 1);
    await page.waitForSelector('[data-behavior="go-to-cart"]');
    await page.click('[data-behavior="go-to-cart"]');
    await expect(page.locator('[data-behavior="cart-title"]')).toHaveText('Корзина');

    // Получаем стоимость товара в корзине
    const priceLoc = await page.waitForSelector('[data-qa="cart-total-sum-value"] span');
    let priceRaw = await priceLoc.evaluate(el => el.textContent);
    let price = priceRaw.replace(/\D/g, '');
    // Кликаем на "Изменить данные"
    await page.waitForSelector('[data-qa="cart-total-change-data-button"]');
    await page.click('[data-qa="cart-total-change-data-button"]');
    // Выбираем Самовывоз
    await page.waitForSelector('[data-qa="ordering-delivery-type-self"]');
    //await page.click('[data-qa="ordering-delivery-type-self"]');
    // Ожидаем карту
    await expect(page.locator('.ymap-container')).toBeVisible;
    await page.waitForFunction(
        'document.querySelector(".main-container h1").innerText.includes("Оформление заказа")'
    );

    // Получение адреса ПВЗ на одностраничнике
    const pvzNameLoc = await page.waitForSelector('[data-qa="order-point-info"][data-is-active="true"] [data-qa="order-point-address"]');
    let pvzNameRaw = await pvzNameLoc.evaluate(el => el.textContent);
    let pvzName = pvzNameRaw.trim();
    // Получение суммы заказа на одностраничнике
    const totalSumLoc = await page.waitForSelector('[data-qa="checkout-total-total-price"]');
    let totalSumRaw = await totalSumLoc.evaluate(el => el.textContent);
    let totalSum = totalSumRaw.replace(/\D/g, '');
    // Получение адреса в блоке ИТОГО
    const deliveryAddressLoc = await page.waitForSelector('[data-qa="checkout-total-delivery"] span');
    let deliveryAddress = await deliveryAddressLoc.evaluate(el => el.textContent);
});