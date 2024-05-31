import puppeteer from 'puppeteer';
import { Terreno } from '../../Models/Terreno';

export const scrapMercadoLibre = async (): Promise<Terreno[]> => {
    const link = 'https://inmuebles.mercadolibre.com.ar/terrenos-lotes/villa-elisa_NoIndex_True#applied_filter_id%3DPROPERTY_TYPE%26applied_filter_name%3DInmueble%26applied_filter_order%3D4%26applied_value_id%3D242071%26applied_value_name%3DTerrenos+y+lotes%26applied_value_order%3D11%26applied_value_results%3D350%26is_custom%3Dfalse';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const terrenos: Terreno[] = [];

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

            const fechaDePublicacionTimestamp = await page.$eval('.ui-pdp-header .ui-pdp-header__bottom-subtitle', el => {
                const text = el.textContent?.trim() || '';
                const numberMatch = text.match(/\d+/);
                const unidadMatch = text.match(/días|meses|año|años/);

                if (!numberMatch || !unidadMatch) {
                    return new Date().getTime();
                }

                const number = parseInt(numberMatch[0], 10);
                const unidad = unidadMatch[0];
                const fechaActual = new Date().getTime();

                let fechaPublicacion;
                switch (unidad) {
                    case 'días':
                        fechaPublicacion = fechaActual - (number * 24 * 60 * 60 * 1000);
                        break;
                    case 'meses':
                        // Restar el número de meses a la fecha actual
                        const fechaMeses = new Date();
                        fechaMeses.setMonth(fechaMeses.getMonth() - number);
                        fechaPublicacion = fechaMeses.getTime();
                        break;
                    case 'año':
                    case 'años':
                        // Restar el número de años a la fecha actual
                        const fechaAños = new Date();
                        fechaAños.setFullYear(fechaAños.getFullYear() - number);
                        fechaPublicacion = fechaAños.getTime();
                        break;
                    default:
                        // Si no se reconoce la unidad, devolver la fecha actual
                        fechaPublicacion = fechaActual;
                        break;
                }
            
                return fechaPublicacion;
            });
            
            // const fechaDePublicacion = new Date(fechaDePublicacionTimestamp);
            

            // Establece todas las propiedades del terreno
            terreno.setTitulo(titulo);
            terreno.setPrecio(precio);
            terreno.setMoneda(moneda);
            terreno.setM2(m2);
            terreno.setUbicacion(ubicacion);
            terreno.setDescripcion(descripcion);
            terreno.setUrl(element.link);
            // terreno.setFechaDePublicacion(fechaDePublicacion);

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