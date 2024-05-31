import { Request, Response } from 'express';
import ComercialController from "./comercial";
import ResidencialController from "./residencial";
import LandFinderController from "./landFinder";


export default class ScrapperController {
    
    static async modelAsigment(req: Request, res: Response): Promise<Response> {
        try {
            const { tipo_de_busqueda } = req.body;
            if (tipo_de_busqueda === "Comercial") {
                await ComercialController.scrap(req,res);
            } else if(tipo_de_busqueda === "Residencial"){
                await ResidencialController.scrap(req,res);
            }else if(tipo_de_busqueda === "Land Finder"){
                await LandFinderController.scrap(req,res);
                
            }else{
                return res.status(400).json({ error: 'el tipo de busqueda no existe', tipo_de_busqueda: ["Comercial","Residencial","Land Finder"] });
            }
            return res.status(200).json({ message: 'Scraping Completado con exito' });
        } catch (error) {
            console.error('Error in modelAsigment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}
