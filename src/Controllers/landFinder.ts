import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/landFinder/argenprop';
import { scrapZonaprop } from '../Service/landFinder/zonaprop';
import { scrapMercadoLibre } from '../Service/landFinder/meli';
// import { adaptArgenprop, adaptZonaprop, adaptMeli } from '../Service/Adapter';
// import { Filters } from '../Service/Filters';
import { ColumnIds } from '../Service/landFinder/ColumnsIds';

const LandFinderController = {
    async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // const argenpropParams: Filters = adaptArgenprop(req);
            // const zonapropParams: Filters = adaptZonaprop(req);
            // const meliParams: Filters = adaptMeli(req);

            const argenpropData: ColumnIds[] = await scrapArgenprop(req.body.argenprop);
            const zonapropData: ColumnIds[] = await scrapZonaprop(req.body.zonaprop);
            const meliData: ColumnIds[] = await scrapMercadoLibre(req.body.meli);
            
            //simulteaneo
            // const [argenpropData, zonapropData, meliData]: [ColumnIds[], ColumnIds[], ColumnIds[]] = await Promise.all([
            //     scrapArgenprop(argenpropParams),
            //     scrapZonaprop(zonapropParams),
            //     scrapMercadoLibre(meliParams)
            // ]);
            

            const combinedData = [
                ...argenpropData,
                ...zonapropData,
                ...meliData
            ];

            // console.log("Resultado final: ", combinedData);

            if (combinedData.length === 0) {
                return res.status(200).json({ message: 'El escrapeo no resulto, se encontraron 0 resultados. Deberias reducir el filtrado.', data: combinedData });
            }

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default LandFinderController;
