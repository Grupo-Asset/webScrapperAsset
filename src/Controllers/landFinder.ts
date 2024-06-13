import { Request, Response } from 'express';
import { scrapArgenprop } from '../Service/landFinder/argenprop';
// import { scrapZonaprop } from '../Service/landFinder/zonaprop';
// import { scrapMercadoLibre } from '../Service/Comercial/meli';
import { adaptArgenprop } from '../Service/Adapter';
import { Filters } from '../Service/Filters';
import { ColumnIds } from '../Service/landFinder/ColumnsIds';

const LandFinderController = {
    async scrap(req: Request, res: Response): Promise<Response> {
        try {
            // Validar la entrada
            // const { oferta } = req.body;
            // if (!oferta) {
            //     return res.status(400).json({ error: 'Oferta is required' });
            // } que chota es oferta??

            // Adaptar la solicitud para cada servicio de scraping
            const argenpropParams: Filters = adaptArgenprop(req);
            // const zonapropParams: Filters = adaptZonaprop(req);
            // const meliParams: Filters = adaptMeli(req);

            // Ejecutar los servicios de scraping y obtener los datos
            const argenpropData: ColumnIds[] = await scrapArgenprop(argenpropParams);
            // const zonapropData: ColumnIds[] = await scrapZonaprop(zonapropParams);
            // const meliData: ColumnIds[] = await scrapMercadoLibre(meliParams);

            // Aquí puedes combinar, procesar o guardar los datos obtenidos si es necesario
            const combinedData = {
                argenprop: { ...argenpropData },
                // zonaprop: { ...zonapropData },
                // meli: { ...meliData }
            };

            return res.status(200).json({ message: 'Scraping completed successfully', data: combinedData });
        } catch (error) {
            console.error('Error in scrap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default LandFinderController;
