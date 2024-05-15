import puppeteer from 'puppeteer';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

export const scrapArgenprop = async (req: ScrapeRequest): Promise<void> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`;

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.listing__items');

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.listing__item'));
            return products.map((p: any) => ({
                link: p.querySelector('a').getAttribute('href'),
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            await page.goto(`https://www.argenprop.com${element.link}`);

            const titulo = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.titlebar__price-mobile p', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z , \.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 , \.]+/g, '');

            const m2 = await page.$eval('li[title="Superficie Total"] .strong', el => el.textContent?.replace(/\D/g, '')) || '0';
            const ubicacion = await page.$eval('li[title="Ubicación"] .strong', el => el.textContent?.trim() || '');
            const adicional = await page.$eval('li[title="Adicional"] .strong', el => el.textContent?.trim() || '');
            const descripcion = await page.$eval('li[title="Descripción"] .strong', el => el.textContent?.trim() || '');
            const alternativo = await page.$eval('li[title="Alternativo"] .strong', el => el.textContent?.trim() || '');
            const url = await page.$eval('li[title="URL"] .strong', el => el.textContent?.trim() || '');
            const servicios = await page.$eval('li[title="Servicios"] .strong', el => el.textContent?.trim() || '');
            const fechaDePublicacion = await page.$eval('li[title="Fecha de Publicación"] .strong', el => el.textContent?.trim() || '');
            const publicador = await page.$eval('li[title="Publicador"] .strong', el => el.textContent?.trim() || '');

            console.log({
                precio,
                moneda,
                titulo,
                m2: Number(m2),
                ubicacion,
                adicional,
                descripcion,
                alternativo,
                url,
                servicios,
                fechaDePublicacion,
                publicador
            });

            await page.goBack();
        }

        await browser.close();
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    }
};


scrapArgenprop({ propertyType: 'terrenos', transactionType: 'venta' });
