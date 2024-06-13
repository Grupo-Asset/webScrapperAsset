import puppeteer, { TimeoutError } from 'puppeteer';

import { Filters } from '../Filters';
import { ColumnIds } from './ColumnsIds';



export const scrapMercadoLibre = async (req: Filters): Promise<ColumnIds[]> => {
    const { tipos_de_propiedad, tipos_de_transaccion, lista_de_barrios, m2 } = req;
    const link = `https://listado.mercadolibre.com.ar/${tipos_de_propiedad}/${tipos_de_transaccion}/${lista_de_barrios}_ITEM*CONDITION_2230581_NoIndex_True_TOTAL*AREA_${m2}`;
    //https://inmuebles.mercadolibre.com.ar/villa-elisa-terrenos_NoIndex_True_TOTAL*AREA_123-321#applied_filter_id%3DTOTAL_AREA%26applied_filter_name%3DSuperficie+total%26applied_filter_order%3D10%26applied_value_id%3D123-321%26applied_value_name%3D123-321%26applied_value_order%3D5%26applied_value_results%3DUNKNOWN_RESULTS%26is_custom%3Dtrue
  //https://inmuebles.mercadolibre.com.ar/venta/bsas-gba-sur/la-plata/villa-elisa-o-city-bell/_ITEM*CONDITION_2230581_NoIndex_True#applied_filter_id%3Dneighborhood%26applied_filter_name%3DBarrios%26applied_filter_order%3D6%26applied_value_id%3DTUxBQkNJVDQ2Mjda%26applied_value_name%3DCity+Bell%26applied_value_order%3D7%26applied_value_results%3D985%26is_custom%3Dfalse
  //https://inmuebles.mercadolibre.com.ar/venta/villa-elisa_COVERED*AREA_123-*_ITEM*CONDITION_2230581_NoIndex_True#applied_filter_id%3DCOVERED_AREA%26applied_filter_name%3DSuperficie+cubierta%26applied_filter_order%3D14%26applied_value_id%3D123-*%26applied_value_name%3D123-*%26applied_value_order%3D5%26applied_value_results%3DUNKNOWN_RESULTS%26is_custom%3Dtrue
  //https://inmuebles.mercadolibre.com.ar/venta/villa-elisa-o-altos-de-san-lorenzo_ITEM*CONDITION_2230581_NoIndex_True#applied_filter_id%3Dneighborhood%26applied_filter_name%3DBarrios%26applied_filter_order%3D6%26applied_value_id%3DTVhYQWx0b3MgZGUgU2FuIExvcmVuem9UVXhCU0%26applied_value_name%3DAltos+de+San+Lorenzo%26applied_value_order%3D2%26applied_value_results%3D23%26is_custom%3Dfalse
  //https://inmuebles.mercadolibre.com.ar/venta/bsas-gba-sur/la-plata/villa-elisa-o-altos-de-san-lorenzo/_ITEM*CONDITION_2230581_NoIndex_True_TOTAL*AREA_123-321  


// se te ocurre alguna forma de obtener la parte de subdominio que agrega meli para poder hacer la busqueda? lo unico que se me ocurrio fue hacer una solicitud a 
// google maps y que me devuelva la provincia de el primer barrio 
// ej meli:
// https://inmuebles.mercadolibre.com.ar/venta/bsas-gba-sur/la-plata/villa-

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
                "operacion": String(tipos_de_transaccion),
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

