import { BigQueryService } from '../services/bigQueryService';
import logger from '../utils/logger';
import { DatasetInitializer } from './datasetInitializer';
import { MigrationApplier } from './migrationApplier';
import { MigrationTableInitializer } from './migrationTableInitializer';
import { PendingMigrationRetriever } from './pendingMigrationRetriever';

export class MigrationRunner {
  private bigQueryService: BigQueryService;
  private migrationsTableName: string;

  constructor(bigQueryService: BigQueryService) {
    this.migrationsTableName = 'migrations';
    this.bigQueryService = bigQueryService;
  }

  public async runMigrations(datasetId: string): Promise<any> {
    try {
      await this.initDataset(datasetId);
      await this.initMigrationTable(datasetId);
      const pendingMigrations: string[] = await this.getPendingMigrations(datasetId);
      await this.applyMigrations(datasetId, pendingMigrations);
      logger.info('migrations applied');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private initDataset(datasetId: string) {
    return new DatasetInitializer(this.bigQueryService).initDataset(datasetId);
  }

  private initMigrationTable(datasetId: string) {
    return new MigrationTableInitializer(this.bigQueryService, this.migrationsTableName).initMigrationTable(datasetId);
  }

  private applyMigrations(datasetId: string, pendingMigrations: string[]) {
    return new MigrationApplier(this.bigQueryService, this.migrationsTableName).applyMigrations(datasetId, pendingMigrations);
  }

  private getPendingMigrations(datasetId: string): Promise<string[]> {
    return new PendingMigrationRetriever(this.bigQueryService, this.migrationsTableName).getPendingMigrations(datasetId);
  }
}
export default MigrationRunner;
