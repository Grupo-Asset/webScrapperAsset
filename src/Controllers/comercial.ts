import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Residencial/argenprop';
import { scrapZonaprop } from '../Service/Residencial/zonaprop';
import { scrapMercadoLibre } from '../Service/Residencial/meli';
import { Adapter } from '../Service/Adapter';
import { ScrapeRequest, Filters } from '../Service/types';

export default class ResidencialController {
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
            const meliParams: ScrapeRequest = Adapter.meli(req);

            // Ejecutar los servicios de scraping
            const argenpropData: Filters = await scrapArgenprop(argenpropParams);
            const zonapropData: Filters = await scrapZonaprop(zonapropParams);
            const meliData: Filters = await scrapMercadoLibre(meliParams);

            // Combinar los datos obtenidos utilizando spread
            const combinedData = {
                ...argenpropData,
                ...zonapropData,
                ...meliData
            };

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
