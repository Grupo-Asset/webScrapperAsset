import puppeteer, { Page } from 'puppeteer';
import { Filters } from '../Filters';
import { ColumnIds } from './ColumnsIds';


const getElementText = async (page: Page, selector: string): Promise<string> => {
    const element = await page.$(selector);
    return element ? await page.evaluate(el => (el as HTMLElement).textContent?.trim() || '', element) : 'Elemento no encontrado';
};

export const scrapZonaprop = async (req: Filters): Promise<ColumnIds[]> => {
    const { tipos_de_propiedad, tipos_de_transaccion, lista_de_barrios, m2 } = req;

    const link = `https://www.zonaprop.com.ar/${tipos_de_propiedad}-${tipos_de_transaccion}-${lista_de_barrios}-${m2}.html`;

    let browser;
    let elements: ColumnIds[] = [];
    try {
        browser = await puppeteer.launch({ headless: true });
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
            await page.goto(`https://www.zonaprop.com${element.link}`);
            const titulo = await getElementText(page, '.titlebar__address');
            const precioRaw = await getElementText(page, '.titlebar__price-mobile p');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');
            const ubicacion = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const servicios = await page.$eval('#section-datos-basicos strong', el => el.textContent?.trim() || '');
            // const caracteristicas = await page.$$eval('#section-caracteristicas li p', elements => {
            //     return elements.map(el => {
            //         let texto = el.textContent?.trim() || '';
            //         texto = texto.replace(/\n/g, '');
            //         texto = texto.replace(/\s*:/g, ':');
            //         texto = texto.replace(/\s+/g, ' ');
            //         return texto;
            //     });
            // });
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const m2 = await page.$eval('li[title="Superficie Total"] .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/g) : null;
                return match ? Number(match.join('')) : 0;
            }).catch(() => 0);
            const banos = await page.$eval('li[title="Baños"] .strong', el => {
                const match = el.textContent?.match(/\d+/g);
                return match ? match.join('') : null;
            }).catch(() => null);
            
            const url = `https://www.zonaprop.com${element.link}`;
            // const adicional = await getElementText(page, '.property-features-item');
            const publicador = await getElementText(page, '.form-details-heading');
            // const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
            //     return elements.map(el => (el as HTMLElement).textContent?.trim() || '');
            // });

            // const tipo_ambientes = await getElementText(page, '#section-ambientes-local .property-features-item');
            // const instalaciones = await getElementText(page, '#section-instalaciones-local .property-features-item');
            // const serviciosDepto = await getElementText(page, '#section-servicios-depto .property-features-item');
            // const instalacionesEdificio = await getElementText(page, '#section-ambientes-local .property-features-item');

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
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const ambientesSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                    const text = (el as HTMLElement).textContent?.trim().toLowerCase();
                    if (text && (text.includes('ambiente') || text.includes('ambientes'))) {
                        const match = text.match(/\d+/);
                        return match ? match[0] : null;
                    }
                }
                return null;
            }).catch(() => null);
            const cantAmbientes = ambientesPrimeraSeccion || ambientesSegundaSeccion;

            const m2PrimeraSeccion = await page.$eval('.desktop .strong', el => {
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

            // const fechaDePublicacion = null;
            const cantPlantas = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const orientacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || ''); 

            const residenciaJson = {
                Titulo: titulo,
                Descripcion: descripcion,
                Alternativo: String(m2 + publicador), // Agrega el valor correspondiente
                Adicional: servicios, // Si "servicios" corresponde a "Adicional"
                URL: url,
                Ubicacion: ubicacion,
                Localidad: String(banos), // Agrega el valor correspondiente
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
                // Caracteristicas: caracteristicas, // Descomentar si es necesario
                // Instalaciones: instalaciones // Descomentar si es necesario
            };
            
            // Agregar el objeto JSON al array residencias
            elements.push(residenciaJson);
            

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapZonaprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    } return elements;
};

