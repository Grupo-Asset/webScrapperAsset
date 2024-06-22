// import puppeteer from 'puppeteer-core';
// import { Residencia } from '../../Models/Residencia';
import { Filters } from '../Filters';
import { ColumnIds } from './ColumnsIds';
export const scrapMercadoLibre = async (req: Filters): Promise<ColumnIds[]> => {
    // const link = 'https://listado.mercadolibre.com.ar/villa-elisa#D[A:villa%20elisa]';
    // const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
    // const page = await browser.newPage();
    // const residencias: Residencia[] = [];

    // try {
    //     await page.goto(link);
    //     await page.waitForSelector('.ui-search-layout.ui-search-layout--grid');

    //     const rawElements = await page.evaluate(() => {
    //         const products = Array.from(document.querySelectorAll('.ui-search-layout__item'));
    //         return products.map(p => ({
    //             link: p.querySelector('a')?.getAttribute('href') || '',
    //         }));
    //     });

    //     console.log('raw', rawElements);

    //     for (const element of rawElements) {
    //         if (!element.link) continue;
    //         await page.goto(element.link);

    //         const residencia = new Residencia();

    //         const titulo = await page.$eval('.ui-pdp-title', el => el.textContent?.trim() || '');


    //         const precioRaw = await page.$eval('.andes-money-amount__fraction', el => el.textContent?.trim() || '');
    //         const precio = parseFloat(precioRaw.replace(/[A-Z ,.]+/g, '').replace(',', '.'));

    //         const moneda = await page.$eval('.andes-money-amount__currency-symbol', el => el.textContent?.trim() || '');


    //         const ubicacion = await page.$eval('.ui-seller-info__status-info', el => el.textContent?.trim() || '');
    //         const descripcion = await page.$eval('.ui-pdp-description__content', el => el.textContent?.trim() || '');
    //         const caracteristicas = await page.$$eval('.ui-vip-specs__table tr', elements => {
    //             return elements.map(el => {
    //                 const key = el.querySelector('th')?.textContent?.trim();
    //                 const value = el.querySelector('td')?.textContent?.trim();
    //                 return key && value ? `${key}: ${value}` : '';
    //             }).filter(text => text).join(', ');
    //         });

    //         const m2Totales = await page.$$eval('.ui-pdp-highlighted-specs-res__icon-label', elements => {
    //             for (const el of elements) {
    //                 const textContent = el.textContent || '';
    //                 if (textContent.includes('m²')) {
    //                     const value = textContent.match(/\d+/)?.[0];
    //                     return parseFloat(value || '0');
    //                 }
    //             }
    //             return 0;
    //         });


    //         const m2Cubiertos = await page.$$eval('.ui-vip-specs__table tr', elements => {
    //             for (const el of elements) {
    //                 const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
    //                 const value = el.querySelector('td')?.textContent?.trim();
    //                 if (key && key.includes('metros cubiertos')) {
    //                     return parseFloat(value?.replace(/\D/g, '') || '0');
    //                 }
    //             }
    //             return 0;
    //         });

    //         const cantDormitorios = await page.$$eval('.ui-pdp-highlighted-specs-res__icon-label', elements => {
    //             for (const el of elements) {
    //                 const textContent = el.textContent || '';
    //                 if (textContent.includes('dormitorio') || textContent.includes('dormitorios')) {
    //                     const value = textContent.match(/\d+/)?.[0];
    //                     return parseFloat(value || '0');
    //                 }
    //             }
    //             return 0;
    //         });

    //         const cantBanos = await page.$$eval('.ui-vip-specs__table tr', elements => {
    //             for (const el of elements) {
    //                 const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
    //                 const value = el.querySelector('td')?.textContent?.trim();
    //                 if (key && key.includes('baños')) {
    //                     return parseFloat(value?.replace(/\D/g, '') || '0');
    //                 }
    //             }
    //             return 0;
    //         });

    //         const cantAmbientes = await page.$$eval('.ui-vip-specs__table tr', elements => {
    //             for (const el of elements) {
    //                 const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
    //                 const value = el.querySelector('td')?.textContent?.trim();
    //                 if (key && key.includes('ambientes')) {
    //                     return parseFloat(value?.replace(/\D/g, '') || '0');
    //                 }
    //             }
    //             return 0;
    //         });

    //         residencia.setTitulo(titulo);
    //         residencia.setPrecio(precio);
    //         residencia.setMoneda(moneda);
    //         residencia.setUbicacion(ubicacion);
    //         residencia.setDescripcion(descripcion);
    //         residencia.setCaracteristicas(caracteristicas);
    //         residencia.setM2Totales(m2Totales);
    //         residencia.setM2Cubiertos(m2Cubiertos);
    //         residencia.setCantDormitorios(cantDormitorios);
    //         residencia.setCantBanos(cantBanos);
    //         residencia.setCantAmbientes(cantAmbientes);
    //         residencia.setTransaccion('venta');
    //         residencia.setUrl(element.link);

    //         // Ajusta estas propiedades según sea necesario
    //         residencia.setOrientacion('');
    //         residencia.setCantPlantas(0);
    //         residencia.setServicios('');
    //         residencia.setTipoAmbientes('');
    //         residencia.setInstalaciones('');
    //         residencia.setPublicador('');
    //         residencia.setFechaPublicacion('');

    //         residencias.push(residencia);

    //         await page.goBack();
    //     }
    // } catch (error) {
    //     console.error('Error in scrapMercadoLibre:', error);
    // } finally {
    //     await browser.close();
    // }

    // return residencias;
    return []
};


