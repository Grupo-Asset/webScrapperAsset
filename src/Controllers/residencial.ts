import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Residencial/argenprop';
import { scrapZonaprop } from '../Service/Residencial/zonaprop';
import { scrapMercadoLibre } from '../Service/Residencial/meli';
import { Adapter } from '../Service/Adapter';
import { Filters } from '../Service/Filters';


export default class ResidencialController {
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // Validar la entrada
            const { oferta } = req.body;
            if (!oferta) {
                return res.status(400).json({ error: 'Oferta is required' });
            }

            // Adaptar la solicitud para cada servicio de scraping
            const argenpropParams: Filters = Adapter.argenprop(req);
            const zonapropParams:Filters = Adapter.zonaprop(req);
            const meliParams:Filters = Adapter.meli(req);

            // Ejecutar los servicios de scraping
            const argenpropData = await scrapArgenprop(argenpropParams);
            const zonapropData = await scrapZonaprop(zonapropParams);
            const meliData = await scrapMercadoLibre(meliParams);

            // Aquí puedes combinar, procesar o guardar los datos obtenidos si es necesario
            const combinedData = {
                argenprop: argenpropData,
                zonaprop: zonapropData,
                meli: meliData
            };

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
