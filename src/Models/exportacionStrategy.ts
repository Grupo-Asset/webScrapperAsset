import axios from 'axios';
import 'dotenv/config'
import ExcelJS from 'exceljs';

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

// interface ColumnIds {
//     Precio: string;
//     Moneda: string;
//     M2: string;
//     Ubicacion: string;
//     Adicional: string;
//     Descripcion: string;
//     Alternativo: string;
//     URL: string;
//     Operacion: string;
//     Publicador: string;
// }

class MondayStrategy implements IExportationStrategy {
    private readonly apiKey = process.env.MONDAY_API_KEY;
    private readonly url = 'https://api.monday.com/v2';

    public async execute(params: { data: object[], templateBoardId: string }): Promise<Exportation> {
        const { data, templateBoardId } = params;
        if (data.length === 0) {
            throw new Error("No data to export");
        }

        const { boardId, columns } = await this.cloneTemplateBoard(templateBoardId);
        const results = await this.addItemsToBoard(boardId, data, columns);

        return new Exportation(results);
    }

    private async cloneTemplateBoard(templateBoardId: string): Promise<{ boardId: number, columns: Column[] }> {
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
            console.log("response data data", response.data.data.duplicate_board.board)
            if (response.data.errors) {
                console.error('Errors from Monday API:', response.data.errors); // Debugging line
                throw new Error(response.data.errors[0].message);
            }

            if (!response.data.data || !response.data.data.duplicate_board) {
                throw new Error("Unexpected response structure");
            }

            const board = response.data.data.duplicate_board.board;
            const columns : Column[] = board.columns

            

            return { boardId: board.id, columns: columns };
        } catch (error: any) {
            console.error('Error in cloneTemplateBoard:', error); // Debugging line
            throw new Error(`Error cloning template board: ${error.message}`);
        }
    }


    private async addItemsToBoard(boardId: number, data: any[], columns: Column[]): Promise<any> {
        const batchSize = 50; // Define el tamaño del lote
        const results = [];
        console.log("llego al add items y este es el valor de data: ",data)
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await this.sendBatchToMonday(boardId, batch, columns);
            results.push(...batchResults);
        }

        return results;
    }

    private async sendBatchToMonday(boardId: number, batch: any[], columns: Column[]): Promise<any> {
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
                [columns[0].id]: item.titulo || "?titulo",
                [columns[2].id]: item.precio || "?precio",
                [columns[3].id]: item.Moneda || "?moneda",
                [columns[4].id]: item.m2,
                [columns[6].id]: item.ubicacion || "?ubic",
                [columns[10].id]: JSON.stringify(item.adicional) || "adicional?",
                [columns[7].id]: item.descripcion || "desc?",
                [columns[12].id]: JSON.stringify(item.alternativo) || "alt?",
                [columns[8].id]: item.url || "url?",
                [columns[9].id]: item.operacion || "oper?",
                [columns[11].id]: item.publicador || "pub?"
            };
            console.log("column values justo antes de mandarse", columnValues)
            const variables = {
                boardId,
                itemName: item.titulo || "test",
                // columnValues: JSON.stringify({
                //     [columns[0].id] : "esto es un column value",
                //     [columns[2].id]: item.precio,
                //     [columns[2].id]: item.moneda,
                //     [columns[4].id]: "1234?",

                // })
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
