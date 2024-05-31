import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Comercial/argenprop';
// import { scrapZonaprop } from '../Service/Comercial/zonaprop';
// import { scrapMercadoLibre } from '../Service/Comercial/meli';
import { Adapter } from '../Service/Adapter';

export default class ComercialController {
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {            
            await scrapArgenprop(Adapter.argenprop(req));
            // const zonaprop = await scrapZonaprop(Adapter.zonaprop(req));
            // const meli = await scrapMercadoLibre(Adapter.meli(req));
            
            return res.status(200).json({ message: 'Scraping completed successfully' });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
