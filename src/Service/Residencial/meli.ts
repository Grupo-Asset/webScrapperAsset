import puppeteer from 'puppeteer';
import { Residencia } from '../../Models/Residencia';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

export const scrapMercadoLibre = async (): Promise<Residencia[]> => {
    const link = 'https://listado.mercadolibre.com.ar/villa-elisa#D[A:villa%20elisa]';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const residencias: Residencia[] = [];

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

            let residencia = new Residencia();

            const titulo = await page.$eval('.ui-pdp-title', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.ui-pdp-price__second-line .price-tag-fraction', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = await page.$eval('.ui-pdp-price__second-line .price-tag-symbol', el => el.textContent?.trim() || '');
            const ubicacion = await page.$eval('.ui-seller-info__status-info', el => el.textContent?.trim() || '');
            const descripcion = await page.$eval('.ui-pdp-description__content', el => el.textContent?.trim() || '');
            const caracteristicas = await page.$$eval('.ui-vip-specs__table tr', elements => {
                return elements.map(el => {
                    const key = el.querySelector('th')?.textContent?.trim();
                    const value = el.querySelector('td')?.textContent?.trim();
                    return key && value ? `${key}: ${value}` : '';
                }).filter(text => text).join(', ');
            });

            const m2Totales = await page.$$eval('.ui-vip-specs__table tr', elements => {
                for (const el of elements) {
                    const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
                    const value = el.querySelector('td')?.textContent?.trim();
                    if (key && key.includes('metros totales')) {
                        return parseFloat(value?.replace(/\D/g, '') || '0');
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

            const cantDormitorios = await page.$$eval('.ui-vip-specs__table tr', elements => {
                for (const el of elements) {
                    const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
                    const value = el.querySelector('td')?.textContent?.trim();
                    if (key && key.includes('dormitorios')) {
                        return parseFloat(value?.replace(/\D/g, '') || '0');
                    }
                }
                return 0;
            });

            const cantBanos = await page.$$eval('.ui-vip-specs__table tr', elements => {
                for (const el of elements) {
                    const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
                    const value = el.querySelector('td')?.textContent?.trim();
                    if (key && key.includes('baños')) {
                        return parseFloat(value?.replace(/\D/g, '') || '0');
                    }
                }
                return 0;
            });

            const cantAmbientes = await page.$$eval('.ui-vip-specs__table tr', elements => {
                for (const el of elements) {
                    const key = el.querySelector('th')?.textContent?.trim().toLowerCase();
                    const value = el.querySelector('td')?.textContent?.trim();
                    if (key && key.includes('ambientes')) {
                        return parseFloat(value?.replace(/\D/g, '') || '0');
                    }
                }
                return 0;
            });

            const orientacion = ''; 
            const cantPlantas = 'andes-table__column--value'; 
            const servicios = 'ui-vpp-striped-specs__table'; 
            const tipoAmbientes = ''; 
            const instalaciones = ''; 
            const serviciosDepto = 'andes-table__column--value'; 
            const instalacionesEdificio = '';
            const publicador = ''; 
            const fechaPublicacion = ''; 

            residencia.setTitulo(titulo);
            residencia.setPrecio(precio);
            residencia.setMoneda(moneda);
            residencia.setUbicacion(ubicacion);
            residencia.setDescripcion(descripcion);
            residencia.setCantDormitorios(cantDormitorios);
            residencia.setCantBanos(cantBanos);
            residencia.setCantAmbientes(cantAmbientes);
            residencia.setCantPlantas(parseFloat(cantPlantas));
            residencia.setOrientacion(orientacion);
            residencia.setServicios(servicios);
            residencia.setM2Totales(m2Totales);
            residencia.setM2Cubiertos(m2Cubiertos);
            residencia.setTipoAmbientes(tipoAmbientes);
            residencia.setTransaccion('venta');
            residencia.setUrl(element.link);
            residencia.setCaracteristicas(caracteristicas);
            residencia.setInstalaciones(instalaciones);
            residencia.setPublicador(publicador);
            residencia.setFechaPublicacion(fechaPublicacion);

            residencias.push(residencia);

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapMercadoLibre:', error);
    } finally {
        await browser.close();
    }

    return residencias;
};

scrapMercadoLibre().then(residencias => {
    console.log('Residencias:', residencias);
});
