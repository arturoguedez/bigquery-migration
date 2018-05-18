'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { InsertTableMigration } from './insertTableMigration';

describe('data/insertTableMigration', () => {
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
            const migration = new InsertTableMigration('name', { rows: [] });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id is not defined');
                done();
            });
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.insert.restore();
            sandbox.stub(stub, 'insert').callsFake(() => {
                return Promise.resolve();
            });

            const migration = new InsertTableMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.insert.restore();
            sandbox.stub(stub, 'insert').callsFake(() => {
                return Promise.reject('error from stub');
            });

            const migration = new InsertTableMigration('name', { tableId: 'id' });
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
            const migration = new InsertTableMigration('name', { rows: [] });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new InsertTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });
    });
});
