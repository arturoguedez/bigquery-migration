'use strict';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { BigQueryService } from '../services/bigQueryService';
import DatasetInitializer from './datasetInitializer';

describe('data/datasetInitializer', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('initDataset()', () => {
        it('Unable to get list of datasets.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.reject('unable to get datasets');
            });

            const datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).catch((err) => {
                expect(err).to.be.equal('unable to get datasets');
                done();
            });
        });

        it('dataset does not exist. Creating it fails.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve([]);
            });

            bigQueryServiceStub.createDateSet.restore();
            sandbox.stub(bigQueryServiceStub, 'createDateSet').callsFake(() => {
                return Promise.reject('Unable to create dataset');
            });

            const datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to create dataset');
                done();
            });
        });

        it('Dataset does not exist. Creating it succeeds.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve([]);
            });

            bigQueryServiceStub.createDateSet.restore();
            sandbox.stub(bigQueryServiceStub, 'createDateSet').callsFake(() => {
                return Promise.resolve();
            });

            const datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).then(() => {
                done();
            });
        });

        it('Dataset exists.', (done) => {
            const bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve(['other', 'testdataset']);
            });

            const datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).then(() => {
                done();
            });
        });
    });
});
