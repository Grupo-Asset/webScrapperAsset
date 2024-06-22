import puppeteer, { TimeoutError } from 'puppeteer';
import { ColumnIds } from '../landFinder/ColumnsIds';

export const scrapMercadoLibre = async (link: string): Promise<ColumnIds[]> => {
    console.log('Meli scraping...', link)
    if(!link){
        console.log("Meli no encontro ningun resultado")
        return []}
    const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
    const page = await browser.newPage();
    let elements: ColumnIds[] = [];

    // const formatFechaArgentina = (fecha: Date): string => {
    //     const dia = fecha.getDate().toString().padStart(2, '0');
    //     const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    //     const anio = fecha.getFullYear();
    //     return `${dia}/${mes}/${anio}`;
    // };

    try {
        await page.goto(link);
        await page.waitForSelector('.ui-search-layout.ui-search-layout--grid',{ timeout: 10000 });

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.ui-search-layout__item'));
            return products.map(p => ({
                link: p.querySelector('a')?.getAttribute('href') || '',
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(element.link);
            const titulo = await page.$eval('.ui-pdp-title', el => el.textContent?.trim() || '');

            const precioRaw = await page.$eval('.andes-money-amount__fraction', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,.]+/g, '').replace(',', '.'));

            const moneda = await page.$eval('.andes-money-amount__currency-symbol', el => el.textContent?.trim() || '');

            const ubicacion = await page.$eval('.ui-pdp-media.ui-vip-location__subtitle', el => el.textContent?.trim() || '');

            const descripcion = await page.$eval('.ui-pdp-description__content', el => el.textContent?.trim() || '');

            const m2 = await page.$$eval('.ui-pdp-highlighted-specs-res__icon-label', elements => {
                for (const el of elements) {
                    const textContent = el.textContent || '';
                    if (textContent.includes('m²')) {
                        const value = textContent.match(/\d+/)?.[0];
                        return parseFloat(value || '0');
                    }
                }
                return 0;
            });

            // const selector = '.ui-pdp-seller-validated .ui-pdp-color--GRAY.ui-pdp-size--XSMALL.ui-pdp-family--REGULAR';

            // const fechaDePublicacion = await page.$eval(selector, el => {
            //     const text = el.textContent?.trim() || '';
            //     const numberMatch = text.match(/\d+/);
            //     const unidadMatch = text.match(/días|meses|año|años/);

            //     if (!numberMatch || !unidadMatch) {
            //         return new Date().toISOString();
            //     }

            //     const number = parseInt(numberMatch[0]);
            //     const unidad = unidadMatch[0];
            //     const fechaActual = new Date();

            //     switch (unidad) {
            //         case 'días':
            //             fechaActual.setDate(fechaActual.getDate() - number);
            //             break;
            //         case 'meses':
            //             fechaActual.setMonth(fechaActual.getMonth() - number);
            //             break;
            //         case 'año':
            //         case 'años':
            //             fechaActual.setFullYear(fechaActual.getFullYear() - number);
            //             break;
            //         default:
            //             console.warn('Unidad de tiempo desconocida:', unidad);
            //             break;
            //     }

            //     return fechaActual.toISOString();
            // });
            // const fechaDePublicacionDate = new Date(fechaDePublicacion);

            // const fechaDePublicacionFormatted = formatFechaArgentina(fechaDePublicacionDate);
            const landfiderObt: ColumnIds ={
                "Titulo": titulo,
                "Precio": precio,
                "Moneda": moneda,
                "M2": m2,
                "Ubicacion": ubicacion,
                "Descripcion": descripcion,
                "URL":element.link,
                Adicional: "",
                Alternativo: "",
                Servicios: "",

            }

            elements.push(landfiderObt);

            await page.goBack();
        }
    } catch (error) {
        if (error instanceof TimeoutError){
            console.log("Meli no encontro ningun resultado")
            return []
        }
        console.error('Error in scrapMercadoLibre:', error);
    } finally {
        await browser.close();
    }

    return elements;
};
