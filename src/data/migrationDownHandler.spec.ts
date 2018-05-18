'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';
import MigrationDownHandler from './migrationDownHandler';

describe('data/migrationDownHandler', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('handleDown()', () => {
        it('Successful', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.down.restore();
            sandbox.stub(migrationStub, 'down').callsFake(() => {
                return Promise.resolve();
            });

            new MigrationDownHandler(bigQueryServiceStub).handleDown(datasetId, migrationStub)
                .then(() => {
                    done();
                });
        });

        it('fails', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.down.restore();
            sandbox.stub(migrationStub, 'down').callsFake(() => {
                return Promise.reject('There was an error');
            });

            migrationStub.getName.restore();
            sandbox.stub(migrationStub, 'getName').callsFake(() => {
                return 'migration_name';
            });

            new MigrationDownHandler(bigQueryServiceStub).handleDown(datasetId, migrationStub)
                .catch((err) => {
                    expect(err).to.be.equals(`Rollback failed for migration 'migration_name'. Error: "There was an error"`);
                    done();
                });
        });
    });
});
