'use strict';
import { expect } from 'chai';
import fs = require('fs');
import sinon = require('sinon');
import { CreateTableMigration } from './createTableMigration';
import { InsertTableMigration } from './insertTableMigration';
import { Migration } from './migration';
import { MigrationFactory } from './migrationFactory';
import { IMigration } from './migrationInterface';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';

describe('data/migrationFactory', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('create()', () => {
        it('CreateTableMigration', (done) => {
            const stubbedMigrationContent = `{
              "type": "createTable"
            }`;
            const fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof CreateTableMigration).to.equal(true);
                done();
            });

        });

        it('InsertTableMigration', (done) => {
            const stubbedMigrationContent = `{
              "type": "insertTable"
            }`;
            const fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof InsertTableMigration).to.equal(true);
                done();
            });
        });

        it('SetTableMetaDataMigration', (done) => {
            const stubbedMigrationContent = `{
              "type": "setTableMetadDataMigration"
            }`;
            const fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof SetTableMetaDataMigration).to.equal(true);
                done();
            });
        });

        it('unknown type', (done) => {
            const stubbedMigrationContent = `{
              "type": "a_bad_one"
            }`;
            const fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').catch((err) => {
                expect(err).to.be.equals('Unknown migration type a_bad_one');
                done();
            });
        });
    });
});
