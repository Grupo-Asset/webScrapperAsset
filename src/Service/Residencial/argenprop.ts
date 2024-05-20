import puppeteer from 'puppeteer';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

export const scrapArgenprop = async (req: ScrapeRequest): Promise<void> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`;

    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.listing__items');

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.listing__item'));
            return products.map(p => ({
                link: p.querySelector('a')?.getAttribute('href') || '',
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.argenprop.com${element.link}`);

            const titulo = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.titlebar__price-mobile p', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');
            const ubicacion = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const servicios = await page.$eval('#section-datos-basicos strong', el => el.textContent?.trim() || '');
            const caracteristicas = await page.$$eval('#section-caracteristicas li p', elements => {
                return elements.map(el => {
                    let texto = el.textContent?.trim() || '';
                    texto = texto.replace(/\n/g, '');
                    texto = texto.replace(/\s*:/g, ':');
                    texto = texto.replace(/\s+/g, ' ');
                    return texto;
                });
            });


            const tipo_ambientes = null
            const instalaciones = null
            const caracteristicasDepto = null
            const serviciosDepto = null
            const instalacionesEdificio = null
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const m2 = await page.$eval('.desktop .strong', el => el.textContent?.match(/\d+/g)?.join('') || '0');
            const dormitorio = null
            const banos = await page.$eval('li[title="Baños"] .strong', el => el.textContent?.match(/\d+/g)?.join('') || '0');
            const ambientes = null
            const url = `https://www.argenprop.com${element.link}`;
            const m2Cubiertos = null
            const adicional = await page.$eval('.property-features-item', el => el.textContent?.trim() || '');
            const fechaDePublicacion = null;
            const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => el.textContent?.trim() || '');
            });
            const cantPlantas = null
            const orientacion = null 

            console.log(
                "precio", precio.toString() || "0",
                "Moneda", moneda,
                "titulo", titulo,
                "m2", Number(m2) || 1,
                "ubicacion", ubicacion,
                "adicional", adicional,
                "descripcion", descripcion,
                "alternativo", alternativo,
                "url", url,
                "servicios", servicios,
                "fechaDePublicacion", fechaDePublicacion,
                "publicador", publicador,


                "caracteristicas", caracteristicas,
                "tipo_ambientes", tipo_ambientes,
                "instalaciones", instalaciones,
                "caracteristicasDepto", caracteristicasDepto,
                "serviciosDepto", serviciosDepto,
                "instalacionesEdificio", instalacionesEdificio,
                "dormitorio", dormitorio,
                // "banos", banos,
                "ambientes", ambientes,
            );

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

scrapArgenprop({ propertyType: 'terrenos', transactionType: 'venta' });
