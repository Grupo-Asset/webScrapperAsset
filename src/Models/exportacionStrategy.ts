import axios from 'axios';
import 'dotenv/config'
import ExcelJS from 'exceljs';
import { ColumnIds as ComercialColumnIds } from '../Service/Comercial/ColumnsIds';
import { ColumnIds as ResidencialColumnIds } from '../Service/Residencial/ColumnsIds';
import { ColumnIds as LandFinderColumnIds } from '../Service/landFinder/ColumnsIds';
class Exportation {
    data: any;

    constructor(data: any) {
        this.data = data;
    }

    export(strategy: IExportationStrategy, params: any): Promise<Exportation> {
        return strategy.execute(params);
    }
}

interface IExportationStrategy {
    execute(params: { data: object[], templateBoardId: string }): Promise<Exportation>;
}

interface Column {
    id: string;
    title: string;
    type: string;
}


class MondayStrategy implements IExportationStrategy {
    
    private readonly apiKey = process.env.MONDAY_API_KEY;
    private readonly url = 'https://api.monday.com/v2';


    public async execute(params: { data: object[], templateBoardId: string }): Promise<Exportation> {

        const { data, templateBoardId } = params;

        if (data.length === 0) {
            throw new Error("No data to export");
        }

        let results;

        if(templateBoardId==="6342801927"){//Comercial
            const { boardId, columnIds } = await this.cloneTemplateBoard(templateBoardId);
            results = await this.addItemsToBoard(boardId, data, columnIds);
        }else if(templateBoardId==="6728241756"){//LandFinder
            const { boardId, columnIds } = await this.cloneTemplateBoardLandFinder(templateBoardId);
            results = await this.addItemsToBoardLandFinder(boardId, data, columnIds);
        }else if(templateBoardId==="6728279849"){//Residencial
            const { boardId, columnIds } = await this.cloneTemplateBoardResidencial(templateBoardId);
            results = await this.addItemsToBoardResidencial(boardId, data, columnIds);
        }else{
            throw new Error("Template board ID not supported");
        }

    return new Exportation(results);
    }


    private async cloneTemplateBoard(templateBoardId: string): Promise<{ boardId: number, columnIds: ComercialColumnIds }> {

        const query = `
            mutation DuplicateBoard($boardId: ID!) { 
                duplicate_board(board_id: $boardId, duplicate_type: duplicate_board_with_structure) { 
                    board { 
                        id 
                        columns {
                            id
                            title
                            type
                        }
                    } 
                } 
            }
        `;

        const variables = { boardId: templateBoardId };
        const requestBody = { query, variables };

        try {
            
            const response = await axios.post(this.url, requestBody, {
                headers: {
                    Authorization: this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Monday API:', response.data); // Debugging line

            if (response.data.errors) {
                console.error('Errors from Monday API:', response.data.errors); // Debugging line
                throw new Error(response.data.errors[0].message);
            }

            if (!response.data.data || !response.data.data.duplicate_board) {
                throw new Error("Unexpected response structure");
            }

            const board = response.data.data.duplicate_board.board;
            const columns = board.columns.filter((col: Column) => col.type !== 'autonumber');

            const columnIds: ComercialColumnIds = {
                titulo: "",
                precio: this.getColumnId(columns, 'texto5__1'),
                moneda: this.getColumnId(columns, 'moneda3__1'),
                m2: Number(this.getColumnId(columns, 'm23__1')),
                m2Cubiertos: Number(this.getColumnId(columns, 'm2_cubiertos__1')),
                ubicacion: this.getColumnId(columns, 'texto0__1'),
                adicional: this.getColumnId(columns, 'adicional__1'),
                descripcion: this.getColumnId(columns, 'descripcion__1'),
                alternativo: this.getColumnId(columns, 'alternativo__1'),
                url: this.getColumnId(columns, 'texto7__1'),
                operacion: this.getColumnId(columns, 'texto9__1'),
                publicador: this.getColumnId(columns, 'texto8__1'),
                fechaDePublicacion: ""
            };
            

            return { boardId: board.id, columnIds };
        } catch (error: any) {
            console.error('Error in cloneTemplateBoard:', error); // Debugging line
            throw new Error(`Error cloning template board: ${error.message}`);
        }
    }
    private async cloneTemplateBoardResidencial(templateBoardId: string): Promise<{ boardId: number, columnIds: ResidencialColumnIds }> {

        const query = `
            mutation DuplicateBoard($boardId: ID!) { 
                duplicate_board(board_id: $boardId, duplicate_type: duplicate_board_with_structure) { 
                    board { 
                        id 
                        columns {
                            id
                            title
                            type
                        }
                    } 
                } 
            }
        `;

        const variables = { boardId: templateBoardId };
        const requestBody = { query, variables };

        try {
            const response = await axios.post(this.url, requestBody, {
                headers: {
                    Authorization: this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Monday API:', response.data);

            if (response.data.errors) {
                console.error('Errors from Monday API:', response.data.errors);
                throw new Error(response.data.errors[0].message);
            }

            if (!response.data.data || !response.data.data.duplicate_board) {
                throw new Error("Unexpected response structure");
            }

            const board = response.data.data.duplicate_board.board;
            const columns = board.columns.filter((col: Column) => col.type !== 'autonumber');

            const columnIds: ResidencialColumnIds = {
                Titulo: this.getColumnId(columns, 'titulo__1'),
                Descripcion: this.getColumnId(columns, 'descripcion__1'),
                Alternativo: this.getColumnId(columns, 'alternativo__1'),
                Adicional: this.getColumnId(columns, 'adicional__1'),
                URL: this.getColumnId(columns, 'url__1'),
                Ubicacion: this.getColumnId(columns, 'ubicacion__1'),
                Localidad: this.getColumnId(columns, 'localidad__1'),
                Barrio: this.getColumnId(columns, 'barrio__1'),
                CantDormitorios: this.getColumnId(columns, 'cant_dormitorios__1'),
                TipoTransaccion: this.getColumnId(columns, 'tipo_transaccion__1'),
                Precio: this.getColumnId(columns, 'precio__1'),
                Moneda: this.getColumnId(columns, 'moneda__1'),
                M2Cubiertos: this.getColumnId(columns, 'm2_cubiertos__1'),
                Caractersiticas: this.getColumnId(columns, 'caracteristicas__1'),
                CantPlantas: this.getColumnId(columns, 'cant_plantas__1'),
                CantAmbientes: this.getColumnId(columns, 'cant_ambientes__1'),
                Cochera: this.getColumnId(columns, 'cochera__1'),
                Orientacion: this.getColumnId(columns, 'orientacion__1'),
                Estado: this.getColumnId(columns, 'estado__1')
            };

            return { boardId: board.id, columnIds };
        } catch (error: any) {
            console.error('Error in cloneTemplateBoard:', error);
            throw new Error(`Error cloning template board: ${error.message}`);
        }
    }
    private async cloneTemplateBoardLandFinder(templateBoardId: string): Promise<{ boardId: number, columnIds: LandFinderColumnIds }> {

        const query = `
            mutation DuplicateBoard($boardId: ID!) { 
                duplicate_board(board_id: $boardId, duplicate_type: duplicate_board_with_structure) { 
                    board { 
                        id 
                        columns {
                            id
                            title
                            type
                        }
                    } 
                } 
            }
        `;

        const variables = { boardId: templateBoardId };
        const requestBody = { query, variables };

        try {
            const response = await axios.post(this.url, requestBody, {
                headers: {
                    Authorization: this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Monday API:', response.data);

            if (response.data.errors) {
                console.error('Errors from Monday API:', response.data.errors);
                throw new Error(response.data.errors[0].message);
            }

            if (!response.data.data || !response.data.data.duplicate_board) {
                throw new Error("Unexpected response structure");
            }

            const board = response.data.data.duplicate_board.board;
            const columns = board.columns.filter((col: Column) => col.type !== 'autonumber');

            const columnIds: LandFinderColumnIds = {
                Descripcion: this.getColumnId(columns, 'descripcion__1'),
                Alternativo: this.getColumnId(columns, 'alternativo__1'),
                Adicional: this.getColumnId(columns, 'adicional__1'),
                URL: this.getColumnId(columns, 'url__1'),
                Ubicacion: this.getColumnId(columns, 'ubicacion__1'),
                Localidad: this.getColumnId(columns, 'localidad__1'),
                Barrio: this.getColumnId(columns, 'barrio__1'),
                Titulo: this.getColumnId(columns, 'titulo__1'),
                Precio: this.getColumnId(columns, 'precio__1'),
                Moneda: this.getColumnId(columns, 'moneda__1'),
                M2: this.getColumnId(columns, 'm2__1'),
                PrecioPorM2: this.getColumnId(columns, 'precio_por_m2__1'),
                Validacion: this.getColumnId(columns, 'validacion__1'),
                Servicios: this.getColumnId(columns, 'servicios__1'),
                Electrecidad: this.getColumnId(columns, 'electrecidad__1'),
                Gas: this.getColumnId(columns, 'gas__1'),
                Agua: this.getColumnId(columns, 'agua__1'),
                Claca: this.getColumnId(columns, 'claca__1')
            };

            return { boardId: board.id, columnIds };
        } catch (error: any) {
            console.error('Error in cloneTemplateBoard:', error);
            throw new Error(`Error cloning template board: ${error.message}`);
        }
    }

    private getColumnId(columns: Column[], id: string): string {
        const column = columns.find(col => col.id === id);
        if (!column) {
            throw new Error(`Column with id '${id}' not found`);
        }
        return column.id;
    }

    private async addItemsToBoard(boardId: number, data: any[], columnIds: ComercialColumnIds): Promise<any> {
        const batchSize = 50; // Define el tamaño del lote
        const results = [];
        console.log("llego al add items y este es el valor de data: ",data)
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await this.sendBatchToMonday(boardId, batch, columnIds);
        console.log("batch result: ",batchResults)

            results.push(...batchResults);
        }
        console.log("result (fin add items to board): ",results)

        return results;
    }

    private async addItemsToBoardResidencial(boardId: number, data: any[], columnIds: ResidencialColumnIds): Promise<any> {
        const batchSize = 50; // Define el tamaño del lote
        const results = [];
        console.log("llego al add items y este es el valor de data: ",data)
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await this.sendBatchToMondayResidencial(boardId, batch, columnIds);
            results.push(...batchResults);
        }

        return results;
    }
    private async addItemsToBoardLandFinder(boardId: number, data: any[], columnIds: LandFinderColumnIds): Promise<any> {
        const batchSize = 50; // Define el tamaño del lote
        const results = [];
        console.log("llego al add items y este es el valor de data: ",data)
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await this.sendBatchToMondayLandFinder(boardId, batch, columnIds);
            results.push(...batchResults);
        }

        return results;
    }

    private async sendBatchToMonday(boardId: number, batch: any[], columnIds: ComercialColumnIds): Promise<any> {
        const query = `
            mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }
        `;

        const results = [];

        for (const item of batch) {
            const columnValues = {
                [columnIds.precio]: item.precio || "?titulo",
                [columnIds.moneda]: item.moneda || "?precio",
                [String(columnIds.m2)]: item.m2 || 1,
                [columnIds.ubicacion]: item.ubicacion || "?ubic",
                [columnIds.adicional]: JSON.stringify(item.adicional) || "?adicional",
                [columnIds.descripcion]: item.descripcion || "?desc",
                [columnIds.alternativo]: JSON.stringify(item.alternativo) || "?alt",
                [columnIds.url]: item.url || "?url",
                [columnIds.operacion]: item.operacion || "?ope",
                [columnIds.publicador]: item.publicador || "?pub"
            };
            console.log("column values justo antes de mandarse", columnValues)
            const variables = {
                boardId,
                itemName: item.titulo || "test",
                columnValues: JSON.stringify(columnValues)
            };

            try {
                const response = await axios.post(this.url, { query, variables }, {
                    headers: {
                        Authorization: this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response from Monday API (add items):', response.data); // Debugging line

                if (response.data.errors) {
                    console.error('Errors from Monday API (add items):', response.data.errors); // Debugging line
                    throw new Error(response.data.errors[0].message);
                }

                if (response.data.data && response.data.data.create_item) {
                    results.push(response.data.data.create_item);
                } else {
                    throw new Error("Unexpected response structure");
                }
            } catch (error: any) {
                console.error('Error in sendBatchToMonday:', error); // Debugging line
                throw new Error(`Error sending batch to Monday: ${error.message}`);
            }
        }

        return results;
    }

    private async sendBatchToMondayResidencial(boardId: number, batch: any[], columnIds: ResidencialColumnIds): Promise<any> {
        const query = `
            mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }
        `;

        const results = [];

        for (const item of batch) {
            const columnValues = {
                [columnIds.Titulo]: item.titulo || "?titulo",
                [columnIds.Descripcion]: item.descripcion || "?desc",
                [columnIds.Alternativo]: JSON.stringify(item.alternativo) || "?alt",
                [columnIds.Adicional]: JSON.stringify(item.adicional) || "?adicional",
                [columnIds.URL]: item.url || "?url",
                [columnIds.Ubicacion]: item.ubicacion || "?ubic",
                [columnIds.Localidad]: item.localidad || "?localidad",
                [columnIds.Barrio]: item.barrio || "?barrio",
                [columnIds.CantDormitorios]: item.cantDormitorios || "?cantDormitorios",
                [columnIds.TipoTransaccion]: item.tipoTransaccion || "?tipoTransaccion",
                [columnIds.Precio]: item.precio || "?precio",
                [columnIds.Moneda]: item.moneda || "?moneda",
                [columnIds.M2Cubiertos]: item.m2Cubiertos || "?m2Cubiertos",
                [columnIds.Caractersiticas]: item.caractersiticas || "?caractersiticas",
                [columnIds.CantPlantas]: item.cantPlantas || "?cantPlantas",
                [columnIds.CantAmbientes]: item.cantAmbientes || "?cantAmbientes",
                [columnIds.Cochera]: item.cochera || "?cochera",
                [columnIds.Orientacion]: item.orientacion || "?orientacion",
                [columnIds.Estado]: item.estado || "?estado"
            };

            console.log("column values justo antes de mandarse", columnValues)
            const variables = {
                boardId,
                itemName: item.titulo || "test",
                columnValues: JSON.stringify(columnValues)
            };

            try {
                const response = await axios.post(this.url, { query, variables }, {
                    headers: {
                        Authorization: this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response from Monday API (add items):', response.data);

                if (response.data.errors) {
                    console.error('Errors from Monday API (add items):', response.data.errors);
                    throw new Error(response.data.errors[0].message);
                }

                if (response.data.data && response.data.data.create_item) {
                    results.push(response.data.data.create_item);
                } else {
                    throw new Error("Unexpected response structure");
                }
            } catch (error: any) {
                console.error('Error in sendBatchToMonday:', error);
                throw new Error(`Error sending batch to Monday: ${error.message}`);
            }
        }

        return results;
    }
    private async sendBatchToMondayLandFinder(boardId: number, batch: any[], columnIds: LandFinderColumnIds): Promise<any> {
        const query = `
            mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }
        `;

        const results = [];

        for (const item of batch) {
            const columnValues : LandFinderColumnIds= {
                [columnIds.Descripcion]: item.descripcion || "?desc",
                [columnIds.Alternativo]: JSON.stringify(item.alternativo) || "?alt",
                [columnIds.Adicional]: JSON.stringify(item.adicional) || "?adicional",
                [columnIds.URL]: item.url || "?url",
                [columnIds.Ubicacion]: item.ubicacion || "?ubic",
                [columnIds.Localidad]: item.localidad || "?localidad",
                [columnIds.Barrio]: item.barrio || "?barrio",
                [columnIds.Titulo]: item.titulo || "?titulo",
                [columnIds.Precio]: item.precio || "?precio",
                [columnIds.Moneda]: Number(item.moneda) || "?moneda",
                [columnIds.M2]: item.m2 || "?m2",
                [columnIds.PrecioPorM2]: item.precioPorM2 || "?precioPorM2",
                [columnIds.Validacion]: item.validacion || "?validacion",
                [columnIds.Servicios]: item.servicios || "?servicios",
                [columnIds.Electrecidad]: item.electrecidad || "?electrecidad",
                [columnIds.Gas]: item.gas || "?gas",
                [columnIds.Agua]: item.agua || "?agua",
                [columnIds.Claca]: item.claca || "?claca"
            };

            console.log("column values justo antes de mandarse", columnValues)
            const variables = {
                boardId,
                itemName: item.titulo || "test",
                columnValues: JSON.stringify(columnValues)
            };

            try {
                const response = await axios.post(this.url, { query, variables }, {
                    headers: {
                        Authorization: this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response from Monday API (add items):', response.data);

                if (response.data.errors) {
                    console.error('Errors from Monday API (add items):', response.data.errors);
                    throw new Error(response.data.errors[0].message);
                }

                if (response.data.data && response.data.data.create_item) {
                    results.push(response.data.data.create_item);
                } else {
                    throw new Error("Unexpected response structure");
                }
            } catch (error: any) {
                console.error('Error in sendBatchToMonday:', error);
                throw new Error(`Error sending batch to Monday: ${error.message}`);
            }
        }

        return results;
    }
}
class JsonStrategy implements IExportationStrategy {
    public async execute(params: { data: object[] }): Promise<Exportation> {
        const jsonData = JSON.stringify(params.data, null, 2);
        return new Exportation(jsonData);
    }
}

class ExcelStrategy implements IExportationStrategy {
    public async execute(params: object): Promise<Exportation> {
        const data = params as any[];

        // Crear libro de Excel y hoja de cálculo
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Añadir filas desde los datos
        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        worksheet.addRows(data);

        // Guardar el archivo Excel en un buffer
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Aquí puedes guardar el buffer en un archivo o devolverlo como necesites
        // Por simplicidad, devolvemos el buffer envuelto en un Exportation
        return new Exportation(excelBuffer);
    }
}
export {Exportation, MondayStrategy,JsonStrategy, ExcelStrategy}