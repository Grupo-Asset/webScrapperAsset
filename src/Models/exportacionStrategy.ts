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

class MondayStrategy implements IExportationStrategy {
    private readonly apiKey = process.env.MONDAY_API_KEY;
    private readonly url = 'https://api.monday.com/v2';

    public async execute(params: { data: object[], templateBoardId: string }): Promise<Exportation> {
        const { data, templateBoardId } = params;
        if (data.length === 0) {
            throw new Error("No data to export");
        }

        
        const boardId = await this.cloneTemplateBoard(templateBoardId);

        const results = await this.addItemsToBoard(boardId, data);

        return new Exportation(results);
    }

    private async cloneTemplateBoard(templateBoardId: string): Promise<number> {
        const query = `
            mutation {
                duplicate_board (board_id: ${templateBoardId}, duplicate_type: duplicate_with_items) {
                    board {
                        id
                    }
                }
            }
        `;

        try {
            const response = await axios.post(this.url, { query }, {
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

            return response.data.data.duplicate_board.board.id;
        } catch (error) {
            console.error('Error in cloneTemplateBoard:', error); // Debugging line
            throw error;
        }
    }

    private async addItemsToBoard(boardId: number, data: any[]): Promise<any> {
        const batchSize = 50; // Define el tamaño del lote
        const results = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await this.sendBatchToMonday(boardId, batch);
            results.push(...batchResults);
        }

        return results;
    }

    private async sendBatchToMonday(boardId: number, batch: any[]): Promise<any> {
        const query = `
            mutation ($boardId: Int!, $items: [CreateItemInput!]!) {
                create_items (board_id: $boardId, items: $items) {
                    id
                }
            }
        `;

        const items = batch.map(item => ({
            item_name: item.name,
            column_values: JSON.stringify(item)
        }));

        const variables = {
            boardId,
            items
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

            return response.data.data.create_items;
        } catch (error) {
            console.error('Error in sendBatchToMonday:', error); // Debugging line
            throw error;
        }
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