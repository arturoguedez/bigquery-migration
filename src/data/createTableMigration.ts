import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';

export class CreateTableMigration extends Migration {
    private tableId: string;
    private schema: string;

    constructor(name: string, content: any) {
        super(name);
        this.tableId = content.tableId;
        this.schema = content.schema;
    }

    public up(bigQueryService: BigQueryService, dataSet: string): Promise<any> {
        if (!this.tableId || !this.schema) {
            return Promise.reject('Table id or schema not defined');
        }
        return bigQueryService.createTable(dataSet, this.tableId, this.schema);
    }

    public down(bigQueryService: BigQueryService, dataSet: string): Promise<any> {
        if (!this.tableId || !this.schema) {
            return Promise.reject('Table id or schema not defined');
        }
        return bigQueryService.deleteTable(dataSet, this.tableId);
    }
}

export default CreateTableMigration;
