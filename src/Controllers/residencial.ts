import { Request, Response } from 'express';

export default class ResidencialController {
    
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // const { oferta } = req.body;
   
            return res.status(200).json({ message: 'Scraping completed successfully' });
        } catch (error) {
            console.error('Error in modelAsigment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}
