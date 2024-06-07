import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Comercial/argenprop';
import { scrapZonaprop } from '../Service/Comercial/zonaprop';
import { scrapMercadoLibre } from '../Service/Comercial/meli';
import { Adapter } from '../Service/Adapter';
import { Filters } from '../Service/Filters';
import { ColumnIds } from '../Service/Comercial/ColumnsIds';
import { Exportation, MondayStrategy } from '../Models/exportacionStrategy';

export default class ComercialController {
    static async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // Validar la entrada
            const { oferta } = req.body;
            if (!oferta) {
                return res.status(400).json({ error: 'Oferta is required' });
            }

            // Adaptar la solicitud para cada servicio de scraping
            const argenpropParams: Filters = Adapter.argenprop(req);
            const zonapropParams: Filters = Adapter.zonaprop(req);
            const meliParams: Filters = Adapter.meli(req);

            // Ejecutar los servicios de scraping
            const argenpropData: ColumnIds[] = await scrapArgenprop(argenpropParams);
            const zonapropData: ColumnIds[] = await scrapZonaprop(zonapropParams);
            const meliData: ColumnIds[] = await scrapMercadoLibre(meliParams);

            // Combinar los datos obtenidos utilizando spread
            const combinedData = {
                ...argenpropData,
                ...zonapropData,
                ...meliData
            };
                    
        const exportation = new Exportation(combinedData);
        const mondayExport = await exportation.export(new MondayStrategy(), { data: combinedData, templateBoardId :"6342801927"});
        console.log("Monday exportado:", mondayExport);

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
