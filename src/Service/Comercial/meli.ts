import puppeteer, { TimeoutError } from 'puppeteer';
import { ColumnIds } from './ColumnsIds';



export const scrapMercadoLibre = async (link: string): Promise<ColumnIds[]> => {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let elements: ColumnIds[] = [];

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


            const m2Totales = await page.$$eval('.ui-pdp-highlighted-specs-res__icon-label', elements => {
                for (const el of elements) {
                    const textContent = el.textContent || '';
                    if (textContent.includes('m²')) {
                        const value = textContent.match(/\d+/)?.[0];
                        return parseFloat(value || '0');
                    }
                }
                return 0;
            });


            const m2Cubiertos = await page.$$eval('.ui-vip-specs__table tr', elements => {
                for (const el of elements) {
                    const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
                    const value = el.querySelector('td')?.textContent?.trim();
                    if (key && key.includes('metros cubiertos')) {
                        return parseFloat(value?.replace(/\D/g, '') || '0');
                    }
                }
                return 0;
            });
            
            elements.push({
                "titulo": titulo,
                "precio": precio.toString(),
                "moneda": moneda,
                "m2": m2Totales || 0,
                "m2Cubiertos": m2Cubiertos,
                "ubicacion": ubicacion,
                "adicional": "",
                "descripcion": descripcion,
                "alternativo": "",
                "url": element.link,
                "operacion": "",
                "fechaDePublicacion": "",
                "publicador": ""
            });

            // residencia.setTitulo(titulo);
            // residencia.setPrecio(precio);
            // residencia.setMoneda(moneda);
            // residencia.setM2(m2Totales);
            // residencia.setM2Cubiertos(m2Cubiertos);
            // residencia.setUbicacion(ubicacion);
            // residencia.setDescripcion(descripcion);
            // residencia.setUrl(element.link);
            // residencia.setOperacion('venta');
            // residencia.setFechaDePublicacion(null);
            // residencia.setPublicador('');

            // elements.push(residencia);

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

