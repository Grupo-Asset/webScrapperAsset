import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/Comercial/argenprop';
import { scrapZonaprop } from '../Service/Comercial/zonaprop';
import { scrapMercadoLibre } from '../Service/Comercial/meli';
import { adaptArgenprop, adaptZonaprop, adaptMeli } from '../Service/Adapter';
import { Filters } from '../Service/Filters';
import { ColumnIds } from '../Service/Comercial/ColumnsIds';
import { Exportation, MondayStrategy } from '../Models/exportacionStrategy';

const ComercialController = {
    async scrap(req: Request, res: Response): Promise<Response> {
        try {
            const argenpropParams: Filters = adaptArgenprop(req);
            console.log("argen exitoso, req: ", req.body);
            const zonapropParams: Filters = adaptZonaprop(req);
            const meliParams: Filters = adaptMeli(req);

            const argenpropData: ColumnIds[] = await scrapArgenprop(argenpropParams);
            const zonapropData: ColumnIds[] = await scrapZonaprop(zonapropParams);
            const meliData: ColumnIds[] = await scrapMercadoLibre(meliParams);

            const combinedData = [
                ...argenpropData,
                ...zonapropData,
                ...meliData
            ]
            console.log("combined data: ",combinedData)
            if (combinedData.length === 0) {
                return res.status(200).json({ message: 'El escrapeo no resulto, se encontraron 0 resultados. Deberias reducir el filtrado.', data: combinedData });
            }

            const exportation = new Exportation(combinedData);
            const mondayExport = await exportation.export(new MondayStrategy(), { data: combinedData, templateBoardId: "6342801927" });
            console.log("Monday exportado:", mondayExport);

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default ComercialController;
