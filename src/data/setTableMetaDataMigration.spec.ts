'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';

describe('data/setTableMetaDataMigration', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('up()', () => {
        it('missing table id', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new SetTableMetaDataMigration('name', { schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('missing schema', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new SetTableMetaDataMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.setTableMetaData.restore();
            sandbox.stub(stub, 'setTableMetaData').callsFake(() => {
                return Promise.resolve();
            });

            const migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.setTableMetaData.restore();
            sandbox.stub(stub, 'setTableMetaData').callsFake(() => {
                return Promise.reject('error from stub');
            });

            const migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done();
            });
        });
    });

    // The Down function doesn't do anything by default. So it always resolves.
    describe('down()', () => {
        it('missing table id', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new SetTableMetaDataMigration('name', { schema: 'schame' });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });
    });
});
