import { Request, Response } from 'express';
import argenprop, { scrapArgenprop } from "../Service/Comercial/argenprop"
import zonaprop from "../Service/Comercial/zonaprop"
import meli from "../Service/Comercial/meli"

export default class ComercialController {
    
    private propertyTypeAdapter = (separator: string,wordSeparator:string, args:string[]): string => {

        const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
        return formattedArgs.join(separator);
      }
    private transactionTypeAdapter = (separator: string,wordSeparator:string, args:string[]): string => {
        const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
        return formattedArgs.join(separator);
      }
4
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {
            const { oferta } = req.body;
            const arngeprop = scrapArgenprop(req)
            return res.status(200).json({ message: 'Scraping completed successfully' });
        } catch (error) {
            console.error('Error in modelAsigment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}
