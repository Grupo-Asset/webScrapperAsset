import puppeteer from 'puppeteer';
import { Exportation, MondayStrategy } from '../../Models/exportacionStrategy';
import { Filters } from '../Filters';

export const scrapArgenprop = async (req: Filters): Promise<void> => {
    const { tipos_de_propiedad, tipos_de_transaccion,lista_de_barrios, m2} = req;
    const link = `https://www.argenprop.com/${tipos_de_propiedad}/${tipos_de_transaccion}/${lista_de_barrios}?${m2}`;

    let browser;
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
        let elements = [];
        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.argenprop.com${element.link}`);
            
            const titulo = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.titlebar__price-mobile p', el => el.textContent?.trim() || '');
            let precio: number | null = 0;
            let moneda = 'No indica';

            if (precioRaw) {
                const parsedPrecio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
                if (!isNaN(parsedPrecio)) {
                    precio = parsedPrecio;
                    moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');
                }
            }

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

            const ubicacion = await page.$eval('.titlebar__address', el => el.textContent?.trim() || '');
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const url = `https://www.argenprop.com${element.link}`;
            const operacion = await page.$eval('[property="name"]', el => el.textContent?.trim() || '');

            const adicional = await page.$$eval('.property-features p', elements => {
                return elements.map(el => {
                    let texto = el.textContent?.trim() || '';
                    texto = texto.replace(/\n/g, '');
                    texto = texto.replace(/\s*:/g, ':');
                    texto = texto.replace(/\s+/g, ' ');
                    return texto;
                });
            });
            const fechaDePublicacion = null;
            const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => el.textContent?.trim() || '');
            });
            elements.push({
                "precio": precio.toString() || "0",
                "Moneda": moneda,
                "titulo": titulo,
                "m2": Number(m2) || 0,
                "ubicacion": ubicacion,
                "adicional": adicional,
                "descripcion": descripcion,
                "alternativo": alternativo,
                "url": url,
                "operacion": operacion,
                "fechaDePublicacion": fechaDePublicacion,
                "publicador": publicador
            });

            console.log(
                "Precio", precio.toString() || "0",
                "Moneda", moneda,
                "titulo", titulo,
                "m2", Number(m2) || 0,
                "ubicacion", ubicacion,
                "adicional", adicional,
                "descripcion", descripcion,
                "alternativo", alternativo,
                "url", url,
                "operacion", operacion,
                "fechaDePublicacion", fechaDePublicacion,
                "publicador", publicador
            );
            await page.goBack();
        }
        
        const exportation = new Exportation(elements);
        const mondayExport = await exportation.export(new MondayStrategy(), { data: elements, templateBoardId :"6342801927"});
        console.log("Monday exportado:", mondayExport);
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();  
        }
    }
};

