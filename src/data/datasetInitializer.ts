import { BigQueryService } from '../services/bigQueryService';

export class DatasetInitializer {
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService) {
        this.bigQueryService = bigQueryService;
    }

    public initDataset(datasetId: string) {
        return this.bigQueryService.listDatasets()
            .then((dataSets) => {
                const dataSetExists: boolean = dataSets.some((dataSet) => {
                    return dataSet === datasetId;
                });

                if (dataSetExists) {
                    return Promise.resolve();
                } else {
                    return this.bigQueryService.createDateSet(datasetId);
                }
            }).catch((err) => {
                return Promise.reject(err);
            });
    }
}

export default DatasetInitializer;
