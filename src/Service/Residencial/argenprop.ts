import puppeteer from 'puppeteer';
import { Residencia } from '../../Models/Residencia';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

export const scrapArgenprop = async (req: ScrapeRequest): Promise<Residencia[]> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const residencias: Residencia[] = [];
    
    try {
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

            let residencia = new Residencia();

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
            }).then(arr => arr.join(', '));
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const m2Totales = await page.$eval('.desktop .strong', el => parseFloat(el.textContent?.match(/\d+/g)?.join('') || '0'));
            const banos = await page.$eval('li[title="Baños"] .strong', el => parseFloat(el.textContent?.match(/\d+/g)?.join('') || '0'));
            const url = `https://www.argenprop.com${element.link}`;
            const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const tipoAmbientes = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const instalaciones = await page.$eval('#section-instalaciones-local .property-features-item', el => el.textContent?.trim() || '');
            // const serviciosDepto = await page.$eval('#section-servicios-depto .property-features-item', el => el.textContent?.trim() || '');
            // const instalacionesEdificio = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');

            const dormitorioPrimeraSeccion = await page.$eval('li[title="Dormitorios"] .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? parseFloat(match[0]) : null;
            }).catch(() => null);
            const dormitorioSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = el.textContent?.trim().toLowerCase();
                    if (text && (text.includes('dormitorio') || text.includes('dormitorios'))) {
                        const match = text.match(/\d+/);
                        return match ? parseFloat(match[0]) : null;
                    }
                }
                return null;
            }).catch(() => null);
            const cantDormitorios = dormitorioPrimeraSeccion || dormitorioSegundaSeccion;

            const ambientesPrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? parseFloat(match[0]) : null;
            }).catch(() => null);
            const ambientesSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = el.textContent?.trim().toLowerCase();
                    if (text && (text.includes('ambiente') || text.includes('ambientes'))) {
                        const match = text.match(/\d+/);
                        return match ? parseFloat(match[0]) : null;
                    }
                }
                return null;
            }).catch(() => null);
            const cantAmbientes = ambientesPrimeraSeccion || ambientesSegundaSeccion;

            const m2PrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? parseFloat(match[0]) : null;
            }).catch(() => null);
            const m2SegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = el.textContent?.trim().toLowerCase();
                    if (text && (text.includes('cubierta'))) {
                        const match = text.match(/\d+/);
                        return match ? parseFloat(match[0]) : null;
                    }
                }
                return null;
            }).catch(() => null);
            const m2Cubiertos = m2PrimeraSeccion || m2SegundaSeccion;

            const fechaPublicacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const cantPlantas = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const orientacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');

            residencia.setTitulo(titulo);
            residencia.setPrecio(precio);
            residencia.setMoneda(moneda);
            residencia.setUbicacion(ubicacion);
            residencia.setDescripcion(descripcion);
            residencia.setCantDormitorios(cantDormitorios);
            residencia.setCantBanos(banos);
            residencia.setCantAmbientes(cantAmbientes);
            residencia.setCantPlantas(parseFloat(cantPlantas));
            residencia.setOrientacion(orientacion);
            residencia.setServicios(servicios);
            residencia.setM2Totales(m2Totales);
            residencia.setM2Cubiertos(m2Cubiertos);
            residencia.setTipoAmbientes(tipoAmbientes);
            residencia.setTransaccion(transactionType);
            residencia.setUrl(url);
            residencia.setCaracteristicas(caracteristicas);
            residencia.setInstalaciones(instalaciones);
            residencia.setPublicador(publicador);
            residencia.setFechaPublicacion(fechaPublicacion);

            residencias.push(residencia);

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        await browser.close();
    }

    return residencias;
};

scrapArgenprop({ propertyType: 'terrenos', transactionType: 'venta' }).then(residencias => {
    console.log('Residencias:', residencias);
});
