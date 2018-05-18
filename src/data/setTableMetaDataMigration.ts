import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';

export class SetTableMetaDataMigration extends Migration {
    private tableId: string;
    private schema: string;
    private tableName: string;
    private description: string;

    constructor(name: string, content: any) {
        super(name);
        this.tableId = content.tableId;
        this.schema = content.schema;
        this.tableName = content.name;
        this.description = content.description;
    }

    public up(bigQueryService: BigQueryService, dataSet: string): Promise<any> {
        if (!this.tableId || !this.schema) {
            return Promise.reject('Table id or schema not defined');
        }
        return bigQueryService.setTableMetaData(dataSet, this.tableId, this.schema, this.tableName, this.description);
    }

    public down(bigQueryService: BigQueryService, dataSet: string): Promise<any> {
        return Promise.resolve();
    }
}

export default SetTableMetaDataMigration;
