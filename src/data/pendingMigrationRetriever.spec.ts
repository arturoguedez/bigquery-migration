'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import MigrationApplier from './migrationApplier';
import MigrationRegistry from './migrationRegistry';
import { MigrationRunner } from './migrationRunner';
import PendingMigrationRetriever from './pendingMigrationRetriever';

describe('data/pendingMigrationRetriever', () => {
  let sandbox;

  beforeEach('prepare sandbox', () => {
    sandbox = sinon.createSandbox();
  });

  afterEach('restore sandbox', () => {
    sandbox.restore();
  });

  describe('getPendingMigrations()', () => {
    it('Empty Registry, Empty applied migrations.', (done) => {
      const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
      sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
        return [];
      });

      bigQueryServiceStub.getRows.restore();
      sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
        return Promise.resolve([]);
      });

      const datasetId = 'testdataset';
      new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
        .then((rows) => {
          expect(Array.isArray(rows)).to.equal(true);
          expect(rows.length).to.be.equal(0);
          done();
        });
    });

    it('Pending migration found', (done) => {
      const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
      sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
        return ['migration_1'];
      });

      bigQueryServiceStub.getRows.restore();
      sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
        return Promise.resolve([]);
      });

      const datasetId = 'testdataset';
      new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
        .then((rows) => {
          expect(Array.isArray(rows)).to.equal(true);
          expect(rows.length).to.be.equal(1);
          expect(rows[0]).to.be.equal('migration_1');
          done();
        });
    });

    it('Pending migrations found', (done) => {
      const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
      sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
        return ['migration_1', 'migration_2', 'migration_3'];
      });

      bigQueryServiceStub.getRows.restore();
      sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
        return Promise.resolve([{ name: 'migration_1' }]);
      });

      const datasetId = 'testdataset';
      new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
        .then((rows) => {
          expect(Array.isArray(rows)).to.equal(true);
          expect(rows.length).to.be.equal(2);
          expect(rows[0]).to.be.equal('migration_2');
          expect(rows[1]).to.be.equal('migration_3');
          done();
        });
    });

    it('No pending migrations found', (done) => {
      const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
      sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
        return ['migration_1', 'migration_2', 'migration_3'];
      });

      bigQueryServiceStub.getRows.restore();
      sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
        return Promise.resolve([
          { name: 'migration_1' },
          { name: 'migration_2' },
          { name: 'migration_3' }
        ]);
      });

      const datasetId = 'testdataset';
      new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
        .then((rows) => {
          expect(Array.isArray(rows)).to.equal(true);
          expect(rows.length).to.be.equal(0);
          done();
        });
    });

    it('Unable to get rows', (done) => {
      const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
      sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
        return ['migration_1', 'migration_2', 'migration_3'];
      });

      bigQueryServiceStub.getRows.restore();
      sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
        return Promise.reject('unable to get rows');
      });

      const datasetId = 'testdataset';
      new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
        .catch((err) => {
          expect(err).to.be.equal('unable to get rows');
          done();
        });
    });
  });
});
