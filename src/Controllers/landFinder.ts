import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Comercial/argenprop';
import { scrapZonaprop } from '../Service/Comercial/zonaprop';
// import { scrapMercadoLibre } from '../Service/Comercial/meli';
import { Adapter } from '../Service/Adapter';
import { ScrapeRequest, Filters } from '../Service/types';

export default class LandFinderController {
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // Validar la entrada
            const { oferta } = req.body;
            if (!oferta) {
                return res.status(400).json({ error: 'Oferta is required' });
            }

            // Adaptar la solicitud para cada servicio de scraping
            const argenpropParams: ScrapeRequest = Adapter.argenprop(req);
            const zonapropParams: ScrapeRequest = Adapter.zonaprop(req);
            // const meliParams: ScrapeRequest = Adapter.meli(req);

            // Ejecutar los servicios de scraping y obtener los datos
            const argenpropData: Filters = await scrapArgenprop(argenpropParams);
            const zonapropData: Filters = await scrapZonaprop(zonapropParams);
            // const meliData: Filters = await scrapMercadoLibre(meliParams);

            // Aquí puedes combinar, procesar o guardar los datos obtenidos si es necesario
            const combinedData = {
                argenprop: { ...argenpropData },
                zonaprop: { ...zonapropData },
                // meli: { ...meliData }
            };

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
