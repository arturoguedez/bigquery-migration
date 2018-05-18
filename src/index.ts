
import { BigQueryService } from './services/bigQueryService';
import config = require('config');
import { IGoogleConfig } from './utils/configs';
import { MigrationRunner } from './data/migrationRunner';

const bigQueryService = new BigQueryService();
new MigrationRunner(bigQueryService).runMigrations(config.get<IGoogleConfig>('google').bigQuery.dataSet);

/**
TODO:
* Migrations fail when running them twice in a row, when the first one ran as a
clean run. It looks like the first migration does not get recorded into the history
*/
