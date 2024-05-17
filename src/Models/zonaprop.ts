import puppeteer from 'puppeteer';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

export const scrapZonaprop = async (req: ScrapeRequest): Promise<void> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.zonaprop.com.ar/${propertyType}-${transactionType}-villa-elisa.html?hasta=40000-dolares`;

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.CardContainer-sc-1tt2vbg-5');

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.PostingCardLayout-sc-i1odl-0'));
            return products.map(p => ({
                link: p.getAttribute('data-to-posting') || '',
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.zonaprop.com${element.link}`);

            const titulo = await page.$eval('.title-type-sup-property', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.price-value span span', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');

            const m2 = await page.$$eval('#section-icon-features-property li', elements => {
                const li = elements.find(el => el.textContent?.includes('m²'));
                if (li) {
                    const match = li.textContent?.match(/\d+/g);
                    return match ? match.join('') : '0';
                }
                return '0';
            });
            
            // const ubicacion = await page.$eval('.section-location-property h4', el => el.textContent?.trim() || '');
            // const descripcion = await page.$eval('#longDescription div', el => el.textContent?.trim() || '');
            // const url = `https://www.zonaprop.com${element.link}`;
            // const servicios = await page.$eval('#section-datos-basicos strong', el => el.textContent?.trim() || '');

            // const adicional = await page.$eval('.property-features-item', el => el.textContent?.trim() || '');
            // const fechaDePublicacion = null;
            // const publicador = await page.$eval('.InfoName-sc-orxlzl-4', el => el.textContent?.trim() || '');
            // const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
            //     return elements.map(el => el.textContent?.trim() || '');
            // });

            console.log(
                "precio", precio.toString() || "0",
                "Moneda", moneda,
                "titulo", titulo,
                "m2", Number(m2) || 1,
                // "ubicacion", ubicacion,
                // "adicional", adicional,
                // "descripcion", descripcion,
                // "alternativo", alternativo,
                // "url", url,
                // "servicios", servicios,
                // "fechaDePublicacion", fechaDePublicacion,
                // "publicador", publicador
            );

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapZonaprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

scrapZonaprop({ propertyType: 'terrenos', transactionType: 'venta' });
