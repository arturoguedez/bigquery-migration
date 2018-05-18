'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';
import MigrationUpHandler from './migrationUpHandler';

describe('data/migrationUpHandler', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('handleUp()', () => {
        it('Successful. Inserting record of migration succeeds.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.up.restore();
            sandbox.stub(migrationStub, 'up').callsFake(() => {
                return Promise.resolve();
            });

            migrationStub.getName.restore();
            sandbox.stub(migrationStub, 'getName').callsFake(() => {
                return 'migration_name';
            });

            bigQueryServiceStub.insert.restore();
            sandbox.stub(bigQueryServiceStub, 'insert').callsFake(() => {
                return Promise.resolve();
            });

            new MigrationUpHandler(bigQueryServiceStub, 'migration').handleUp(datasetId, migrationStub)
                .then(() => {
                    done();
                });
        });

        it('Successful. Inserting record of migration fails.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.up.restore();
            sandbox.stub(migrationStub, 'up').callsFake(() => {
                return Promise.resolve();
            });

            migrationStub.getName.restore();
            sandbox.stub(migrationStub, 'getName').callsFake(() => {
                return 'migration_name';
            });

            bigQueryServiceStub.insert.restore();
            sandbox.stub(bigQueryServiceStub, 'insert').callsFake(() => {
                return Promise.reject('There was an error');
            });

            new MigrationUpHandler(bigQueryServiceStub, 'migration').handleUp(datasetId, migrationStub)
                .catch((err) => {
                    expect(err).to.be.equals('Errors found while recording the migration history: "There was an error"');
                    done();
                });
        });

        it('fails', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.up.restore();
            sandbox.stub(migrationStub, 'up').callsFake(() => {
                return Promise.reject('There was an error');
            });

            migrationStub.getName.restore();
            sandbox.stub(migrationStub, 'getName').callsFake(() => {
                return 'migration_name';
            });

            new MigrationUpHandler(bigQueryServiceStub, 'migration').handleUp(datasetId, migrationStub)
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });
    });
});
