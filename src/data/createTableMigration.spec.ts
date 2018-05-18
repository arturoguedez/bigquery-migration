'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { CreateTableMigration } from './createTableMigration';

describe('data/createTableMigration', () => {
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
            const migration = new CreateTableMigration('name', { schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('missing schema', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new CreateTableMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.createTable.restore();
            sandbox.stub(stub, 'createTable').callsFake(() => {
                return Promise.resolve();
            });

            const migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.createTable.restore();
            sandbox.stub(stub, 'createTable').callsFake(() => {
                return Promise.reject('error from stub');
            });

            const migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done();
            });
        });
    });

    describe('down()', () => {
        it('missing table id', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new CreateTableMigration('name', { schema: 'schema' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('missing schema', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            const migration = new CreateTableMigration('name', { tableId: 'id' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done();
            });
        });

        it('resolving', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.deleteTable.restore();
            sandbox.stub(stub, 'deleteTable').callsFake(() => {
                return Promise.resolve();
            });

            const migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            const stub = sandbox.createStubInstance(BigQueryService);
            stub.deleteTable.restore();
            sandbox.stub(stub, 'deleteTable').callsFake(() => {
                return Promise.reject('error from stub');
            });

            const migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done();
            });
        });
    });
});
