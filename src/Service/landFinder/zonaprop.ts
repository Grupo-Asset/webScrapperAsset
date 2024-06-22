import puppeteer, { TimeoutError } from 'puppeteer';
import { ColumnIds } from './ColumnsIds';

export const scrapZonaprop = async (link:string): Promise<ColumnIds[]> => {
    console.log("zonaprop scraping...", link)

    let browser;
    let elements: ColumnIds[] = [];

    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.postings-container');

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.CardContainer-sc-1tt2vbg-5'));
            return products.map(p => ({
                link: p.getAttribute('data-to-posting') || p.querySelector(".PostingCardLayout-sc-i1odl-0")?.getAttribute("data-to-posting"),
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.zonaprop.com.ar${element.link}`);
            

            const titulo = await page.$eval('.title-type-sup-property', el => el.textContent?.trim() || '');
            const precioRaw = await page.$eval('.price-value span span', el => el.textContent?.trim() || '');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');

            const m2 = await page.$$eval('#section-icon-features-property li', elements => {
                const li = elements.find(el => el.textContent?.includes('m²'));
                if (li) {
                    const match = li.textContent?.match(/\d+/g);
                    return match ? match.join('') : '0';
                }
                return '0';
            });
            
            const ubicacion = await page.$eval('.section-location-property h4', el => el.textContent?.trim() || '');
            const descripcion = await page.$eval('#longDescription div', el => el.textContent?.trim() || '');
            const url = `https://www.zonaprop.com${element.link}`;
            

            const adicional = await page.$$eval('.sc-hwdzOV span', elements => elements.map(el => el.textContent?.trim() || ''));
            const fechaDePublicacionTimestamp = await page.$eval('.view-users-container div div p', el => {
                const text = el.textContent?.trim() || '';
                const numeroDeDias = parseInt(text.replace(/\D/g, ''), 10);
                const fechaActual = new Date().getTime();
                const fechaPublicacion = fechaActual - (numeroDeDias * 24 * 60 * 60 * 1000);
                return fechaPublicacion;
            });
            const fechaDePublicacion = new Date(fechaDePublicacionTimestamp);
            const servicios = await page.$eval('#section-datos-basicos strong', el => el.textContent?.trim() || '');

            const publicador = await page.$eval('.InfoName-sc-orxlzl-4', el => el.textContent?.trim() || '');
            const alternativo = null;
            
            elements.push(
                {
                    "Titulo": String(titulo),
                    "Precio": precio.toString(),
                    "Moneda": moneda,
                    "M2": m2,
                    "Ubicacion": ubicacion,
                    "Adicional": String(adicional),
                    "Descripcion": descripcion,
                    "Alternativo": alternativo||"",
                    "URL": url,
                    "Servicios": servicios|| "",
                    // "FechaDePublicacion": fechaDePublicacion,
                    // "Publicador": publicador,
                }
            )
            
            console.log(
                "precio", precio.toString() || "0",
                "Moneda", moneda,
                "titulo", titulo,
                "m2", Number(m2) || 1,
                "ubicacion", ubicacion,
                "adicional", adicional,
                "descripcion", descripcion,
                "alternativo", alternativo,
                "url", url,
                "servicios", servicios,
                "fechaDePublicacion", fechaDePublicacion,
                "publicador", publicador
            );
            await page.goBack();
        }
    } catch (error) {
        if (error instanceof TimeoutError){
            console.log("Zonaprop no encontro ningun resultado")
            return []
        }
        console.error('Error in scrapZonaprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    return elements
};
