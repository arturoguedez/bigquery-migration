'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import MigrationTableInitializer from './migrationTableInitializer';

describe('data/migrationTableInitializer', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('initMigrationTable()', () => {
        it('Unable to list tables.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.reject('Unable to list tables');
            });

            const datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('Unable to list tables');
                    done();
                });
        });

        it('Migration Table exists.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['migration']);
            });
            const datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Migration Table does not exists. Unable to create.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['not_migration']);
            });

            bigQueryServiceStub.createTable.restore();
            sandbox.stub(bigQueryServiceStub, 'createTable').callsFake(() => {
                return Promise.reject('Unable to create table');
            });

            const datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('Unable to create table');
                    done();
                });
        });

        it('Migration Table does not exists. Creation succeeds.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['migration']);
            });

            bigQueryServiceStub.createTable.restore();
            sandbox.stub(bigQueryServiceStub, 'createTable').callsFake(() => {
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .then(() => {
                    done();
                });
        });
    });
});
