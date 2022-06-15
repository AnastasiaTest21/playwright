const {test, expect, chromium} = require('@playwright/test');

test('Order self cach', async ({}) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage()
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
    // Очищаем корзину
    await page.goto('https://www.vseinstrumenti.ru/run/PCabinet/MyCart/clearCart');
    await page.goto('https://www.vseinstrumenti.ru/instrument/shlifmashiny/bolgarka_ushm/');
    // Клик на первую кнопку "В корзину"
    await page.waitForSelector('.buttons [data-behavior="add-to-cart"]');
    await page.click('.buttons [data-behavior="add-to-cart"]');
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

    // Ассерты
    await expect(price).toEqual(totalSum);
    await expect(pvzName).toEqual(deliveryAddress);
    //Выбор спопоба оплаты Наличными
    await page.waitForSelector('[data-qa="ordering-payment-type-cash"]');
    await page.click('[data-qa="ordering-payment-type-cash"]');
    //Проверка отображения выбранного способа оплаты в блоке ИТОГО
    await page.waitForFunction(
        'document.querySelector("[data-qa=\'checkout-total-payment\'] span").innerText.includes("Наличными")'
    );
    //Проверка отображения ФИО покупателя
    await page.waitForFunction(
        'document.querySelector("[data-qa=\'checkout-contractor-select\']").innerText.includes("Тест Тестов")'
    );
    //Подтвеждение заказа
    await page.waitForSelector('[data-qa="ordering-total-order-create-button"]');
    await page.click('[data-qa="ordering-total-order-create-button"]');
    //Получение номера заказа на ThankYouPage
    const orderNumberLoc = await page.waitForSelector('[data-qa="thanks-page-order-number"]');
    let orderNumberRaw = await orderNumberLoc.evaluate(el => el.textContent);
    let orderNumber = (orderNumberRaw.replace(/(\r\n|\n|\r)/gm, '')).trim();
    // Получение данных с текущей датой
    let date = new Date;
    let month = "0" + (date.getMonth() + 1);
    let fullYear = date.getFullYear();
    let year = fullYear.toString().slice(-2);
    // Составление шаблона номера заказа (регулярки) с актуальным месяцем и годом
    let pattern = '№' + year + month + '-' + '2' + '[0-9]{5}-[0-9]{5}';
    // Поиск совпадений
    let matches = await orderNumber.match(pattern)
    await expect(matches.length).toEqual(1);
    // Проверка отображения кнопки онлайн-оплаты
    await page.waitForSelector('[data-qa="thanks-page-pay-online"]');
    // Проверка отображения суммы заказа на ThankYouPage в блоке ИТОГО
    const sumBlockLocOnTYP = await page.waitForSelector('[data-qa="thanks-total-price"]');
    let sumRaw = await sumBlockLocOnTYP.evaluate(el => el.textContent);
    let sumOnTYP = sumRaw.replace(/\D/g, '');
    await expect(sumOnTYP).toEqual(price);
    // Проверка отображения суммы заказа на ThankYouPage в строке после "Спасибо за заказ"
    const sumStringLocOnTYP = await page.waitForSelector('[data-qa="thanks-page-price"]');
    let sumStringRaw = await sumStringLocOnTYP.evaluate(el => el.textContent);
    let sumStringOnTYP = sumStringRaw.replace(/\D/g, '');
    await expect(sumStringOnTYP).toEqual(price);

    // Клик на ссылку с номером заказа с последующим редиректом в ЛК
    await page.waitForSelector('[data-qa="thanks-page-order-number"]');

    // Создание объекта страницы в появившейся после редиректа вкладке
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('[data-qa="thanks-page-order-number"]'),
    ])
    await newPage.waitForLoadState();

    // Проверка отображения номера созданного заказа в ЛК
    const orderNumberInLKLoc = await newPage.waitForSelector('[data-qa="order-card"]:nth-child(1) [data-qa="number"]');
    let orderNumberInLK = await orderNumberInLKLoc.evaluate(el => el.textContent);
    await expect(orderNumberInLK).not.toEqual('0000-000000-00000');
    // Проверка наличия id созданного заказа в ЛК
    await newPage.waitForSelector('[data-qa="order-card"]:nth-child(1)');
    let orderIdInLK = await newPage.evaluate(() => document.querySelector('[data-qa="order-card"]:nth-child(1)').getAttribute("data-order-id"));
    await expect(orderIdInLK).not.toEqual('');
    // Проверка отображения статуса созданного заказа в ЛК
    const orderStatusInLKLoc = await newPage.waitForSelector('[data-qa="order-card"]:nth-child(1) [data-qa="status"]');
    let orderStatusInLKRaw = await orderStatusInLKLoc.evaluate(el => el.textContent);
    let orderStatusInLk = orderStatusInLKRaw.trim();
    await expect(orderStatusInLk).toEqual('В обработке');
    // Проверка отображения ПВЗ для созданного заказа в ЛК
    const pvzInfoLoc = await newPage.waitForSelector('[data-qa="order-card"]:nth-child(1) [data-qa="delivery-address"]');
    let pvzInfoInLKRaw = await pvzInfoLoc.evaluate(el => el.textContent);
    let pvzInfoInLK = pvzInfoInLKRaw.trim();
    await expect(pvzInfoInLK).toContain("Самовывоз из офиса: ");
    await expect(pvzInfoInLK).toContain(pvzName);
});