import puppeteer, { Page } from 'puppeteer';
import { Residencia } from '../../Models/Residencia';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

const getElementText = async (page: Page, selector: string): Promise<string> => {
    const element = await page.$(selector);
    return element ? await page.evaluate(el => (el as HTMLElement).textContent?.trim() || '', element) : 'Elemento no encontrado';
};

export const scrapArgenprop = async (req: ScrapeRequest): Promise<Residencia[]> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`;

    let browser;
    let residencias: Residencia[] = [];
    try {
        browser = await puppeteer.launch({ headless: false });
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
            await page.waitForSelector('.titlebar__address'); // Espera a que el contenido principal se cargue

            let residencia = new Residencia();

            const titulo = await getElementText(page, '.titlebar__address');
            const precioRaw = await getElementText(page, '.titlebar__price-mobile p');
            let precio: number | null = 0;
            let moneda = 'No indica';

            if (precioRaw) {
                const parsedPrecio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
                if (!isNaN(parsedPrecio)) {
                    precio = parsedPrecio;
                    moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');
                }
            }

            const ubicacion = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');

            const serviceSelectors = [
                '#section-servicios-local',
                '#section-servicios-casa',
                '#section-servicios-depto',
            ];
            let servicios: string | undefined;
            
            for (const selector of serviceSelectors) {
                const exists = await page.$(selector);
                if (exists) {
                    servicios = await page.$eval(selector, el => {
                        const items = Array.from(el.querySelectorAll('.property-features-item'));
                        return items.map(item => item.textContent?.trim()).filter(Boolean).join(', ');
                    }).catch((error) => {
                        return undefined;
                    });
                    if (servicios && servicios.trim() !== '') {
                        break;
                    }
                }
            }
            if (!servicios || servicios.trim() === '') {
                servicios = 'No indica';
            }          


            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            let m2: number | null = null;

            // Buscar en li[title="Superficie Total"] .strong
            m2 = await page.$eval('li[title="Superficie Total"] .strong', el => {
                const text = el?.textContent?.trim();
                const match = text ? text.match(/\d+/g) : null;
                return match ? Number(match.join('')) : null;
            }).catch(() => null);
            
            // Si no se encuentra en li[title="Superficie Total"] .strong, buscar en #section-superficie
            if (m2 === null) {
                m2 = await page.$eval('#section-superficie', el => {
                    const items = el.querySelectorAll('li');
                    for (const item of items) {
                        const text = item.textContent?.trim() || '';
                        if (text.includes('Sup. Terreno')) {
                            const match = text.match(/\d+/g);
                            return match ? Number(match.join('')) : null;
                        }
                    }
                    return null;
                }).catch(() => null);
            }            
            
            // Si no se encuentra en #section-superficie, buscar en la descripción
            if (m2 === null) {
                const description = await page.$eval('.section-description--content', el => el.textContent?.trim() ?? '').catch(() => '');
                const regex = /\b(\d+)\s*(metros|mts|metros\s+cuadrados|m²|m2)\b/gi;
                const matches = description.matchAll(regex);
                let extractedM2: number | null = null;
                for (const match of matches) {
                    const startIndex = match.index ? match.index - 10 : 0;
                    const endIndex = match.index ? match.index + match[0].length + 10 : description.length;
                    const context = description.substring(Math.max(0, startIndex), Math.min(description.length, endIndex));
                    const numberContext = context.replace(/[^\d]/g, '');
                    if (!isNaN(Number(numberContext)) && numberContext.length > 0) {
                        extractedM2 = Number(numberContext);
                        break;
                    }
                }
                m2 = extractedM2;
            }

            const banos = await page.$eval('li[title="Baños"] .strong', el => {
                const match = el.textContent?.match(/\d+/g);
                return match ? match.join('') : null;
            }).catch(() => null);

            const url = `https://www.argenprop.com${element.link}`;
            const publicador = await getElementText(page, '.form-details-heading');

            const dormitorioPrimeraSeccion = await page.$eval('li[title="Dormitorios"] .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const dormitorioSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = (el as HTMLElement).textContent?.trim().toLowerCase();
                    if (text && (text.includes('dormitorio') || text.includes('dormitorios'))) {
                        const match = text.match(/\d+/);
                        return match ? match[0] : null;
                    }
                }
                return null;
            }).catch(() => null);
            const cantDormitorios = dormitorioPrimeraSeccion || dormitorioSegundaSeccion;

            const ambientesPrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : 0;
                return match ? match[0] : 0;
            }).catch(() => 0);
            const ambientesSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = (el as HTMLElement).textContent?.trim().toLowerCase();
                    if (text && (text.includes('ambiente') || text.includes('ambientes'))) {
                        const match = text.match(/\d+/);
                        return match ? match[0] : 0;
                    }
                }
                return 0;
            }).catch(() => 0);
            const cantAmbientes = ambientesPrimeraSeccion || ambientesSegundaSeccion;

            const m2PrimeraSeccion = await page.$eval('li[title="Sup. cubierta"] .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const m2SegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = (el as HTMLElement).textContent?.trim().toLowerCase();
                    if (text && (text.includes('cubierta'))) {
                        const match = text.match(/\d+/);
                        return match ? match[0] : null;
                    }
                }
                return null;
            }).catch(() => null);
            const m2Cubiertos = m2PrimeraSeccion || m2SegundaSeccion;

            // Verificar y manejar el selector que puede no estar presente
            const cantPlantas = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '').catch(() => '0');
            const orientacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '').catch(() => 'No indica');

            residencia.setTitulo(titulo);
            residencia.setPrecio(precio);
            residencia.setMoneda(moneda);
            residencia.setUbicacion(ubicacion);
            residencia.setDescripcion(descripcion);
            residencia.setCantDormitorios(Number(cantDormitorios));
            residencia.setCantBanos(Number(banos));
            residencia.setCantAmbientes(Number(cantAmbientes));
            residencia.setCantPlantas(parseFloat(cantPlantas));
            residencia.setOrientacion(orientacion);
            residencia.setServicios(servicios);
            residencia.setM2Totales(Number(m2));
            residencia.setM2Cubiertos(Number(m2Cubiertos));
            residencia.setTransaccion(transactionType);
            residencia.setUrl(url);
            residencia.setPublicador(publicador);

            residencias.push(residencia);

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Imprimir resultados antes de retornar
    console.log('Residencias:', residencias);
    return residencias;
};

// Llamar a la función y manejar la promesa
scrapArgenprop({ propertyType: 'casas', transactionType: 'venta' })
    .then(residencias => console.log('Scraping completado. Resultados:', residencias))
    .catch(error => console.error('Error durante el scraping:', error));
