import puppeteer, { Page } from 'puppeteer-core';
import { Filters } from '../Filters';
import { ColumnIds } from './ColumnsIds';


const getElementText = async (page: Page, selector: string): Promise<string> => {
    const element = await page.$(selector);
    return element ? await page.evaluate(el => (el as HTMLElement).textContent?.trim() || '', element) : 'Elemento no encontrado';
};

export const scrapArgenprop = async (req: Filters): Promise<ColumnIds[]> => {
    const { tipos_de_propiedad, tipos_de_transaccion, lista_de_barrios, m2 } = req;
    const link = `https://www.argenprop.com/${tipos_de_propiedad}/${tipos_de_transaccion}/${lista_de_barrios}?${m2}`;

    let browser;
    let elements: ColumnIds[] = [];
    try {
        browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
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



            const residenciaJson = {
                Titulo: titulo,
                Descripcion: descripcion,
                Alternativo: String(publicador), // Agrega el valor correspondiente
                Adicional: String(banos), // Agrega el valor correspondiente
                URL: url,
                Ubicacion: ubicacion,
                Localidad: '', // Agrega el valor correspondiente
                Barrio: '', // Agrega el valor correspondiente
                CantDormitorios: String(cantDormitorios),
                TipoTransaccion: String(tipos_de_transaccion),
                Precio: String(precio),
                Moneda: moneda,
                M2Cubiertos: String(m2Cubiertos),
                Caractersiticas: '', // Agrega el valor correspondiente
                CantPlantas: String(cantPlantas),
                CantAmbientes: String(cantAmbientes),
                Cochera: '', // Agrega el valor correspondiente
                Orientacion: orientacion,
                Estado: '', // Agrega el valor correspondiente
            };
            
            // Agregar el objeto JSON al array elements
            elements.push(residenciaJson);
            

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Imprimir resultados antes de retorn
    return elements;
};
