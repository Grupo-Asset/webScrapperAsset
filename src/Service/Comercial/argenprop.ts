import puppeteer, { TimeoutError } from 'puppeteer';
import { ColumnIds } from './ColumnsIds';
export const scrapArgenprop = async (link: string): Promise<ColumnIds[]> => {
    console.log(link)

    let browser;
    let elements: ColumnIds[] = [];
    
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link);  
        await page.waitForSelector('.listing__items',{ timeout: 10000 });

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.listing__item'));
            return products.map(p => ({
                link: p.querySelector('a')?.getAttribute('href') || '',
            }));
        });

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
                titulo: titulo,
                precio: precio.toString(),
                moneda: moneda,
                m2: m2 || 0,
                m2Cubiertos: 0,
                ubicacion: ubicacion,
                adicional: String(adicional),
                descripcion: descripcion,
                alternativo: String(alternativo),
                url: url,
                operacion: operacion,
                fechaDePublicacion: fechaDePublicacion,
                publicador: publicador
            });
            

            console.log({
                "Titulo": titulo,
                "Precio": precio.toString(),
                "Moneda": moneda,
                "M2": m2 || 0,
                "Ubicacion": ubicacion,
                "Adicional": String(adicional),
                "Descripcion": descripcion,
                "Alternativo": String(alternativo),
                "URL": url,
                "Operacion": operacion,
                "FechaDePublicacion": fechaDePublicacion,
                "Publicador": publicador
            });
            await page.goBack();
        }
    } catch (error) {
        if (error instanceof TimeoutError){
            console.log("Argenprop no encontro ningun resultado")
            return []
        }
        console.error('Error in scrapArgenprop:', error);
    } 
    finally {
        if (browser) {
            await browser.close();  
        }
    }

    return elements;
};