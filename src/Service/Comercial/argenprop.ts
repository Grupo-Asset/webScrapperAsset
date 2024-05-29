import puppeteer from 'puppeteer';
import { Exportation, MondayStrategy } from '../../Models/exportacionStrategy';
interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}
const propertyTypeAdapter = (separator: string,wordSeparator:string, args:string[]): string => {
    const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
    return formattedArgs.join(separator);
  }

export const scrapArgenprop = async (req: ScrapeRequest): Promise<void> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa`;

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
        let elements= []
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
            const operacion = await page.$eval('[property="name"]', el => el.textContent?.trim() || '');
            // const barrio
            // const localidad
            
            const adicional = await page.$$eval('.property-features p', elements => {
                return elements.map(el => {
                    let texto = el.textContent?.trim() || '';
                    texto = texto.replace(/\n/g, '');
                    texto = texto.replace(/\s*:/g, ':');
                    texto = texto.replace(/\s+/g, ' ');
                    return texto;
                });
            });
            const fechaDePublicacion = null;
            const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => el.textContent?.trim() || '');
            });
            elements.push(
                {"precio": precio.toString() || "0",
            "Moneda": moneda,
            "titulo": titulo,
            "m2": Number(m2) || 1,
            "ubicacion": ubicacion,
            "adicional": adicional,
            "descripcion": descripcion,
            "alternativo": alternativo,
            "url": url,
            "operacion": operacion,
            "fechaDePublicacion": fechaDePublicacion,
            "publicador": publicador})

            console.log(
                "Precio", precio.toString() || "0",
                "Moneda", moneda,
                "titulo", titulo,
                "m2", Number(m2) || 1,
                // "ubicacion", ubicacion,
                // "adicional", adicional,
                // "descripcion", descripcion,
                // "alternativo", alternativo,
                // "url", url,
                // "operacion", operacion,
                // "fechaDePublicacion", fechaDePublicacion,
                // "publicador", publicador
            );

            await page.goBack();
        }
        const exportation = new Exportation(elements);
        const mondayExport = await exportation.export(new MondayStrategy(), { data: elements, templateBoardId :"6342801927"});
        console.log("Monday exportado:", mondayExport);
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
const propertyType = propertyTypeAdapter("-o-","-",["cocheras", "fondos de comercio", "galpones", "locales", "negocios especiales"])
scrapArgenprop({ propertyType: propertyType, transactionType: 'venta' });
