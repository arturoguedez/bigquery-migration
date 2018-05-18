'use strict';
import { expect } from 'chai';
import sinon = require('sinon');
import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';

describe('data/migration', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    it('up()', (done) => {
        const stub = sandbox.createStubInstance(BigQueryService);
        const migration = new Migration('name');
        migration.up(stub, 'datasetId').then(() => done());
    });

    it('down()', (done) => {
        const stub = sandbox.createStubInstance(BigQueryService);
        const migration = new Migration('name');
        migration.down(stub, 'datasetId').then(() => done());
    });

    it('getName()', () => {
        const migration = new Migration('name');
        expect(migration.getName()).to.be.equals('name');
    });
});
