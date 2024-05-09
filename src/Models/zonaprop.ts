import puppeteer from "puppeteer";

let scrap = async () => {
    try {
        let link = `https://www.zonaprop.com.ar/terrenos-alquiler.html`
        const chrome = await puppeteer.launch({ headless: false })
        const page = await chrome.newPage()
        await page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 1
        })

        await page.goto(link, { waitUntil: 'networkidle2' })

        // Hacer clic en el elemento div
        await page.click('.DropDownContainer-sc-l2lttx-0.jWupWL');

        // Esperar un momento para que aparezca el dropdown
        await page.waitForSelector('.DropDownOption-sc-l2lttx-4'); // Espera a que aparezcan las opciones del dropdown

        // Seleccionar una opción del dropdown
        await page.click('.DropDownOption-sc-l2lttx-4'); // Por ejemplo, se puede hacer clic en la primera opción del dropdown

        // Seleccionar el input y establecer un valor
        await page.evaluate(() => {
            const inputElement = document.querySelector<HTMLInputElement>('#search-location-input');
            if (inputElement) {
                inputElement.value = "pileta";
            }
        });

        // Realizar búsqueda u otras operaciones aquí si es necesario

    } catch (error) {
        console.log(error)
    }
}

let scrapLoop = async () => {
    await scrap()
}

scrapLoop()

export { scrapLoop }
