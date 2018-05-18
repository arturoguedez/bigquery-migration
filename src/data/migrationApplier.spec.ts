'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';
import MigrationApplier from './migrationApplier';
import MigrationDownHandler from './migrationDownHandler';
import MigrationFactory from './migrationFactory';
import MigrationUpHandler from './migrationUpHandler';

describe('data/migrationApplier', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('applyMigrations()', () => {
        it('No pending migrations left to apply', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            const datasetId = 'testdataset';
            const pendingMigrations = [];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    done();
                });
        });

        it('Failing to create migration from Factory', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.reject('Unknown migration type');
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Unknown migration type');
                    done();
                });
        });

        it('Up failed, Down succeeded', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.reject('Unknown migration type');
            });

            sandbox.stub(MigrationDownHandler.prototype, 'handleDown').callsFake(() => {
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Migration migration_name has been rolled back. Error from up(): Unknown migration type');
                    done();
                });
        });

        it('Up failed, Down failed', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.reject('Unknown migration type');
            });

            sandbox.stub(MigrationDownHandler.prototype, 'handleDown').callsFake(() => {
                return Promise.reject('Down failed');
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Down failed');
                    done();
                });
        });

        it('Up succeded', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    done();
                });
        });

        it('Up succeded many times', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let migrationOneApplied = 0;
            let migrationTwoApplied = 0;
            sandbox.stub(MigrationFactory.prototype, 'create').callsFake((name) => {
                return Promise.resolve(new Migration(name));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake((theDatasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneApplied += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoApplied += 1;
                }
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one', 'migration_two'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    expect(migrationOneApplied).to.be.equals(1);
                    expect(migrationTwoApplied).to.be.equals(1);
                    done();
                });
        });

        it('Up succeded many times, fails half way through', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let migrationOneApplied = 0;
            let migrationTwoApplied = 0;
            let migrationThreeApplied = 0;

            let migrationOneReverted = 0;
            let migrationTwoReverted = 0;
            let migrationThreeReverted = 0;

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake((name) => {
                return Promise.resolve(new Migration(name));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake((theDatasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneApplied += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoApplied += 1;
                    return Promise.reject('failed to complete');
                } else if (migration.getName() === 'migration_three') {
                    migrationThreeApplied += 1;
                }
                return Promise.resolve();
            });

            const downStub = sandbox.stub(MigrationDownHandler.prototype, 'handleDown');
            downStub.callsFake((theDatasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneReverted += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoReverted += 1;
                } else if (migration.getName() === 'migration_three') {
                    migrationThreeReverted += 1;
                }
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            const pendingMigrations = ['migration_one', 'migration_two', 'migration_three'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(migrationOneApplied).to.be.equals(1);
                    expect(migrationTwoApplied).to.be.equals(1);
                    expect(migrationThreeApplied).to.be.equals(0);

                    expect(migrationOneReverted).to.be.equals(0);
                    expect(migrationTwoReverted).to.be.equals(1);
                    expect(migrationThreeReverted).to.be.equals(0);
                    expect(err).to.be.equals('Migration migration_two has been rolled back. Error from up(): failed to complete');
                    done();
                });
        });
    });
});
