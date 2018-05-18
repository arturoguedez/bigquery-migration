'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import DatasetInitializer from './datasetInitializer';
import MigrationApplier from './migrationApplier';
import { MigrationRunner } from './migrationRunner';
import MigrationTableInitializer from './migrationTableInitializer';
import PendingMigrationRetriever from './pendingMigrationRetriever';

describe('data/migrationRunner', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('runMigrations()', () => {
        it('Unable to initialize DataSet.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.reject('Unable to initialize dataset');
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to initialize dataset');
                done();
            });
        });

        it('Unable to initialize Migrations Table', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.reject('Unable to initialize migration table');
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to initialize migration table');
                done();
            });
        });

        it('No Pending Migrations Found.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve([]);
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Unable to get Pending Migrations.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.reject('unable to get pending migrations');
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('unable to get pending migrations');
                    done();
                });
        });

        it('Applying Migration succeeds', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve(['migration_1', 'migration_2']);
            });

            sandbox.stub(MigrationApplier.prototype, 'applyMigrations').callsFake(() => {
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Applying Migration fails', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve(['migration_1', 'migration_2']);
            });

            sandbox.stub(MigrationApplier.prototype, 'applyMigrations').callsFake(() => {
                return Promise.reject('unable to apply migrations');
            });

            const datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('unable to apply migrations');
                    done();
                });
        });
    });
});
