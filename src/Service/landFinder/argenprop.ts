import puppeteer from 'puppeteer';
import { Filters } from '../Filters';
import { ColumnIds } from './ColumnsIds';

export const scrapArgenprop = async (req: Filters): Promise<ColumnIds[]> => {
    const { tipos_de_propiedad, tipos_de_transaccion, lista_de_barrios, m2 } = req;

    const link = `https://www.argenprop.com/${tipos_de_propiedad}/${tipos_de_transaccion}/${lista_de_barrios}?${m2}`;
    let elements: ColumnIds[] = [];

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
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

            const m2 = await page.$eval('.desktop .strong', el => el.textContent?.match(/\d+/g)?.join('') || '0');
            const ubicacion = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const url = `https://www.argenprop.com${element.link}`;
            const servicios = await page.$eval('#section-datos-basicos strong', el => el.textContent?.trim() || '');

            const adicional = await page.$eval('.property-features-item', el => el.textContent?.trim() || '');
            // const fechaDePublicacion = null;
            // const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => el.textContent?.trim() || '').join(', ');
            });

            const residenciaJson: ColumnIds = {
                Titulo: titulo,
                Precio: precio.toString(),
                Moneda: moneda,
                Descripcion: descripcion,
                URL: url,
                Ubicacion: ubicacion,
                Servicios: servicios,
                M2: m2,
                Adicional: adicional,
                Alternativo: alternativo,
                Localidad: '', // Agrega el valor correspondiente
                Barrio: '', // Agrega el valor correspondiente
                PrecioPorM2: '', // Agrega el valor correspondiente
                Validacion: '', // Agrega el valor correspondiente
                Electrecidad: '', // Agrega el valor correspondiente
                Gas: '', // Agrega el valor correspondiente
                Agua: '', // Agrega el valor correspondiente
                Claca: '', // Agrega el valor correspondiente
            };

            console.log(residenciaJson);

            elements.push(residenciaJson);

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    return elements;
};
