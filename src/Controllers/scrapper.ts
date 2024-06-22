import { Request, Response } from 'express';
import ComercialController from "./comercial";
import ResidencialController from "./residencial";
import LandFinderController from "./landFinder";
export default class ScrapperController {

    static async modelAsigment(req: Request, res: Response): Promise<Response> {
        try {
            console.log("Model Asigning for: ",req.body)
            let resultado
            const { tipo_de_busqueda } = req.body;
            if (tipo_de_busqueda === "Comercial") {
                resultado = await ComercialController.scrap(req,res);
            } else if(tipo_de_busqueda === "Residencial"){
                resultado = await ResidencialController.scrap(req,res);
            }else if(tipo_de_busqueda === "Land finder"){
                resultado = await LandFinderController.scrap(req,res);
            }else{
                return res.status(400).json({ error: 'el tipo de busqueda no existe', tipo_de_busqueda: ["comercial","residencial","land finder"] });
            }
            return resultado
        } catch (error) {
            console.error('Error in modelAsigment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}