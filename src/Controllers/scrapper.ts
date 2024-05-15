// import { Request, Response } from 'express';
// import { scrapArgenprop } from './models/argenprop';
// import { scrapZonaprop } from './models/zonaprop';
// import { scrapMeli } from './models/meli';
// import { scrapTerreno } from './models/terreno';

// export default class ScrapperController {
    
//     static async modelAsigment(req: Request, res: Response): Promise<Response> {
//         try {
//             const { oferta } = req.body;
//             if (oferta === 1) {
//                 await ScrapperController.scrapOferta(req);
//             } else {
//                 await ScrapperController.scrapTerreno(req);
//             }
//             return res.status(200).json({ message: 'Scraping completed successfully' });
//         } catch (error) {
//             console.error('Error in modelAsigment:', error);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }
//     }

//     static async scrapOferta(req: Request): Promise<void> {
//         try {
//             await Promise.all([
//                 scrapArgenprop(req),
//                 scrapZonaprop(req),
//                 scrapMeli(req)
//             ]);
//         } catch (error) {
//             console.error('Error in scrapOferta:', error);
//             throw error;
//         }
//     }

//     static async scrapTerreno(req: Request): Promise<void> {
//         try {
//             await scrapTerreno(req);
//         } catch (error) {
//             console.error('Error in scrapTerreno:', error);
//             throw error;
//         }
//     }
// }
