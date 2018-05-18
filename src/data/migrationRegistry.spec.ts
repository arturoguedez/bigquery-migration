'use strict';
import { expect } from 'chai';
import fs = require('fs');
import sinon = require('sinon');
import { MigrationRegistry } from './migrationRegistry';

describe('data/migrationRegistry', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    it('getRegistry()', () => {
        const stubbedMigrations = ['migration_01.json', 'migration_02.json'];
        const fsStub = sandbox.stub(fs, 'readdirSync');
        fsStub.withArgs(`${__dirname}/migrations/`).returns(stubbedMigrations);

        const registry = new MigrationRegistry().getRegistry();
        expect(2).to.eql(registry.length);
        expect(registry[0]).to.eql(stubbedMigrations[0]);
        expect(registry[1]).to.eql(stubbedMigrations[1]);
    });
});
