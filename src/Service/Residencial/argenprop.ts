import puppeteer from 'puppeteer';
// titulo:
// ubicacion
// descripcion
// cant dormitorios
// cant banos
// cant ambientes
// servicios
// m2 totales
// m2 m2Cubiertos
// precio
// moneda
// transaccion
// url
// caracteristicas
// alternativo
// precio por m2 m2Cubiertos
// precio por m2
// validacion 


interface ScrapeRequest {
    propertyType: string;
    transactionType: string;
}

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
                link: p.querySelector('a')?.getAttribute('href') || '',
            }));
        });

        console.log('raw', rawElements);

        for (const element of rawElements) {
            if (!element.link) continue;
            await page.goto(`https://www.argenprop.com${element.link}`);

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
            });
            const descripcion = await page.$eval('.section-description--content', el => el.textContent?.trim() || '');
            const m2 = await page.$eval('.desktop .strong', el => el.textContent?.match(/\d+/g)?.join('') || '0');
            const banos = await page.$eval('li[title="Baños"] .strong', el => el.textContent?.match(/\d+/g)?.join('') || '0');
            const url = `https://www.argenprop.com${element.link}`;
            const adicional = await page.$eval('.property-features-item', el => el.textContent?.trim() || '');
            const publicador = await page.$eval('.form-details-heading', el => el.textContent?.trim() || '');
            const alternativo = await page.$$eval('ul.property-main-features li p.strong', elements => {
                return elements.map(el => el.textContent?.trim() || '');
            });

            // nuevo
            const tipo_ambientes = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const instalaciones = await page.$eval('#section-instalaciones-local .property-features-item', el => el.textContent?.trim() || '');
            const serviciosDepto = await page.$eval('#section-servicios-depto .property-features-item', el => el.textContent?.trim() || '');
            const instalacionesEdificio = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');


            const dormitorioPrimeraSeccion = await page.$eval('li[title="Dormitorios"] .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const dormitorioSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                  const text = el.textContent?.trim().toLowerCase();
                  if (text && (text.includes('dormitorio') || text.includes('dormitorios'))) {
                    const match = text.match(/\d+/);
                    return match ? match[0] : null;
                  }
                }
                return null;
              }).catch(() => null);
            const dormitorio = dormitorioPrimeraSeccion || dormitorioSegundaSeccion;

            const ambientesPrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const ambientesSegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                  const text = el.textContent?.trim().toLowerCase();
                  if (text && (text.includes('ambiente') || text.includes('ambientes'))) {
                    const match = text.match(/\d+/);
                    return match ? match[0] : null;
                  }
                }
                return null;
              }).catch(() => null);
            const ambientes = ambientesPrimeraSeccion || ambientesSegundaSeccion;

            const m2PrimeraSeccion = await page.$eval('.desktop .strong', el => {
                const text = el.textContent?.trim();
                const match = text ? text.match(/\d+/) : null;
                return match ? match[0] : null;
            }).catch(() => null);
            const m2SegundaSeccion = await page.$$eval('#section-caracteristicas li', elements => {
                for (const el of elements) {
                  const text = el.textContent?.trim().toLowerCase();
                  if (text && (text.includes('cubierta'))) {
                    const match = text.match(/\d+/);
                    return match ? match[0] : null;
                  }
                }
                return null;
              }).catch(() => null);
            const m2Cubiertos = m2PrimeraSeccion || m2SegundaSeccion;

            const fechaDePublicacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const cantPlantas = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || '');
            const orientacion = await page.$eval('#section-ambientes-local .property-features-item', el => el.textContent?.trim() || ''); 

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
