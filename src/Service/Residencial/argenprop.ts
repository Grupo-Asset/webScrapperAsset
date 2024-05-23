import puppeteer, { Page } from 'puppeteer';

interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

const getElementText = async (page: Page, selector: string): Promise<string> => {
    const element = await page.$(selector);
    return element ? await page.evaluate(el => (el as HTMLElement).textContent?.trim() || '', element) : 'Elemento no encontrado';
};

export const scrapArgenprop = async (req: ScrapeRequest): Promise<void> => {
    const { propertyType, transactionType } = req;
    const link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`;

    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.listing__items');

        const rawElements = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll('.listing__item'));
            return products.map(p => ({
                link: (p.querySelector('a') as HTMLAnchorElement)?.getAttribute('href') || '',
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.argenprop.com${element.link}`);

            const titulo = await getElementText(page, '.titlebar__address');
            const precioRaw = await getElementText(page, '.titlebar__price-mobile p');
            const precio = parseFloat(precioRaw.replace(/[A-Z ,\.]+/g, ''));
            const moneda = precioRaw.replace(/[0-9 ,\.]+/g, '');
            const ubicacion = await getElementText(page, '.titlebar__address');
            const servicios = await getElementText(page, '#section-datos-basicos strong');
            const caracteristicas = await page.$$eval('#section-caracteristicas li p', elements => {
                return elements.map(el => {
                    let texto = (el as HTMLElement).textContent?.trim() || '';
                    texto = texto.replace(/\n/g, '');
                    texto = texto.replace(/\s*:/g, ':');
                    texto = texto.replace(/\s+/g, ' ');
                    return texto;
                });
            });
            const descripcion = await getElementText(page, '.section-description--content');
            const m2 = await page.$eval('li[title="Superficie Total"] .strong', el => {
                const text = (el as HTMLElement).textContent?.trim();
                const match = text ? text.match(/\d+/g) : null;
                return match ? Number(match.join('')) : 0;
            }).catch(() => 0);

            const banos = await page.$eval('li[title="Baños"] .strong', el => {
                const match = (el as HTMLElement).textContent?.match(/\d+/g);
                return match ? match.join('') : null;
            }).catch(() => null);

            const url = `https://www.argenprop.com${element.link}`;
            const adicional = await getElementText(page, '.property-features-item');
            const publicador = await getElementText(page, '.form-details-heading');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => (el as HTMLElement).textContent?.trim() || '');
            });

            const tipo_ambientes = await getElementText(page, '#section-ambientes-local .property-features-item');
            const instalaciones = await getElementText(page, '#section-instalaciones-local .property-features-item');
            const serviciosDepto = await getElementText(page, '#section-servicios-depto .property-features-item');
            const instalacionesEdificio = await getElementText(page, '#section-ambientes-local .property-features-item');

            const dormitorioPrimeraSeccion = await page.$eval('li[title="Dormitorios"] .strong', el => {
                const text = (el as HTMLElement).textContent?.trim();
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
            const dormitorio = dormitorioPrimeraSeccion || dormitorioSegundaSeccion;

            const ambientesPrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = (el as HTMLElement).textContent?.trim();
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
            const ambientes = ambientesPrimeraSeccion || ambientesSegundaSeccion;

            const m2PrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = (el as HTMLElement).textContent?.trim();
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

            const fechaDePublicacion = null;
            const cantPlantas = await getElementText(page, '#section-ambientes-local .property-features-item');
            const orientacion = await getElementText(page, '#section-ambientes-local .property-features-item');

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
                "publicador", publicador,
                "caracteristicas", caracteristicas,
                "orientacion", orientacion,
                "cantPlantas", cantPlantas,
                "m2Cubiertos", m2Cubiertos,
                "tipo_ambientes", tipo_ambientes,
                "instalaciones", instalaciones,
                "serviciosDepto", serviciosDepto,
                "instalacionesEdificio", instalacionesEdificio,
                "dormitorio", dormitorio,
                "banos", banos,
                "ambientes", ambientes,
            );

            await page.goBack();
        }
    } catch (error) {
        console.error('Error in scrapArgenprop:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

scrapArgenprop({ propertyType: 'terrenos', transactionType: 'venta' });
