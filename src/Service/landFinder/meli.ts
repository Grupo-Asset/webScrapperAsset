import puppeteer from 'puppeteer';
import { Terreno } from '../../Models/terreno';

export const scrapMercadoLibre = async (): Promise<Terreno[]> => {
    const link = 'https://inmuebles.mercadolibre.com.ar/terrenos-lotes/villa-elisa_NoIndex_True#applied_filter_id%3DPROPERTY_TYPE%26applied_filter_name%3DInmueble%26applied_filter_order%3D4%26applied_value_id%3D242071%26applied_value_name%3DTerrenos+y+lotes%26applied_value_order%3D11%26applied_value_results%3D350%26is_custom%3Dfalse';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const terrenos: Terreno[] = [];

    // const formatFechaArgentina = (fecha: Date): string => {
    //     const dia = fecha.getDate().toString().padStart(2, '0');
    //     const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    //     const anio = fecha.getFullYear();
    //     return `${dia}/${mes}/${anio}`;
    // };

    try {
        await page.goto(link);
        await page.waitForSelector('.ui-search-layout.ui-search-layout--grid');

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

            const terreno = new Terreno();

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

            terreno.setTitulo(titulo);
            terreno.setPrecio(precio);
            terreno.setMoneda(moneda);
            terreno.setM2(m2);
            terreno.setUbicacion(ubicacion);
            terreno.setDescripcion(descripcion);
            terreno.setUrl(element.link);
            terreno.setFechaDePublicacion(null);
            // Ajusta estas propiedades según sea necesario
            terreno.setPublicador('');

            // Agrega el terreno al array de terrenos
            terrenos.push(terreno);

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapMercadoLibre:', error);
    } finally {
        await browser.close();
    }

    return terrenos;
};

scrapMercadoLibre().then(terrenos => {
    console.log('Terrenos:', terrenos);
});
