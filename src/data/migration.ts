import { BigQueryService } from '../services/bigQueryService';
import { IMigration } from './migrationInterface';

export class Migration implements IMigration {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public up(bigQueryService: BigQueryService, dataSet: string) {
        return Promise.resolve();
    }

    public down(bigQueryService: BigQueryService, dataSet: string) {
        return Promise.resolve();
    }

    public getName() {
        return this.name;
    }
}
