// Imports the Google Cloud client library
import BigQuery = require('@google-cloud/bigquery');
import config = require('config');
import { IGoogleConfig } from '../utils/configs';
import logger from '../utils/logger';

export class BigQueryService {
  // Your Google Cloud Platform project ID
  private projectId: string;
  private datasetId: string;
  private bigquery;

  constructor() {
    this.projectId = config.get<IGoogleConfig>('google').bigQuery.projectId;
    this.datasetId = config.get<IGoogleConfig>('google').bigQuery.dataSet;
    this.bigquery = new BigQuery({
      projectId: this.projectId
    });
  }

  public createDateSet(datasetId: string) {
    return this.bigquery
      .createDataset(datasetId)
      .then((results) => {
        return Promise.resolve();
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  public query(datasetId: string, query: string, options?) {
    const dataset = this.bigquery.dataset(datasetId);

    if (!options) {
      options = {
        query,
        useLegacySql: false
      };
    }
    return dataset.query(options)
      .then((results) => {
        return Promise.resolve(results[0]);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  public listDatasets() {
    return this.bigquery
      .getDatasets()
      .then((results) => {
        const datasets = results[0];
        const dataSetsArray = [];
        datasets.forEach((dataset) => {
          dataSetsArray.push(dataset.id);
        });
        return Promise.resolve(dataSetsArray);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  // https://cloud.google.com/nodejs/docs/reference/bigquery/1.2.x/Table#insert
  public insert(datasetId: string, tableId: string, rows, options) {
    const dataset = this.bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    if (!options) {
      options = {};
    }

    return table.insert(rows, options)
      .then((data) => {
        logger.debug(`Inserted Data to table ${tableId} \n ${JSON.stringify(rows)}`);
        return Promise.resolve(data[0]);
      })
      .catch((err) => Promise.reject(err));
  }

  public deleteDataset(datasetId) {
    const dataset = this.bigquery.dataset(datasetId);
    return dataset.delete();
  }

  public createTable(datasetId: string, tableId: string, schema: any) {
    const options = {
      schema
    };
    // Create a new table in the dataset
    return this.bigquery
      .dataset(datasetId)
      .createTable(tableId, options)
      .then((results) => {
        logger.debug(`Created Created: ${tableId} with result ${JSON.stringify(results)}`);
        return Promise.resolve(results[0]);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  public setTableMetaData(datasetId: string, tableId: string, schema: string, name: string, description: string): Promise<any> {
    const metadata = {
      description,
      name,
      schema
    };
    return this.bigquery
      .dataset(datasetId)
      .table(tableId)
      .setMetadata(metadata)
      .then((results) => {
        return Promise.resolve(results[0]);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  public getRows(datasetId: string, tableId: string): Promise<any> {
    return this.bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows()
      .then((results) => {
        const rows = results[0];
        return Promise.resolve(rows);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }
  public listTables(datasetId: string) {
    return this.bigquery
      .dataset(datasetId)
      .getTables()
      .then((results) => {
        const tables = results[0];
        const tablesArray = [];
        tables.forEach((table) => {
          tablesArray.push(table.id);
        });

        return Promise.resolve(tablesArray);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  public deleteTable(datasetId: string, tableId: string): Promise<any> {
    // Deletes the table
    return this.bigquery
      .dataset(datasetId)
      .table(tableId)
      .delete()
      .then(() => {
        return Promise.resolve();
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

}
export default BigQueryService;
