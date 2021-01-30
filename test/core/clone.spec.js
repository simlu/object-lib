const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('object-scan');
const samplesize = require('lodash.samplesize');
const clone = require('../../src/core/clone');
const genData = require('./gen-data');

describe('Testing clone', { timeout: 100000 }, () => {
  it('Batch test (deep)', ({ fixture }) => {
    const compare = fixture('compare');
    const normalize = fixture('normalize');
    for (let x = 0; x < 5000; x += 1) {
      const data = genData();
      const cloned = clone(data);
      expect(data).to.deep.equal(cloned);
      expect(compare(data, cloned)).to.deep.equal(normalize(data));
    }
  });

  it('Batch test (shallow)', ({ fixture }) => {
    const compare = fixture('compare');
    const normalize = fixture('normalize');
    for (let x = 0; x < 5000; x += 1) {
      const data = genData();
      const cloned = clone(data, ['**']);
      expect(data).to.deep.equal(cloned);
      expect(compare(data, cloned)).to.deep.equal(normalize(data, ['**']));
    }
  });

  it('Batch test (random shallow)', ({ fixture }) => {
    const compare = fixture('compare');
    const normalize = fixture('normalize');
    for (let x = 0; x < 5000; x += 1) {
      const data = genData();
      const allKeys = objectScan(['**'], { joined: true })(data);
      const selectedKeys = samplesize(allKeys, Math.floor(Math.random() * allKeys.length) + 1);
      const cloned = clone(data, selectedKeys);
      expect(data).to.deep.equal(cloned);
      expect(compare(data, cloned)).to.deep.equal(normalize(data, selectedKeys));
    }
  });

  it('Batch test (random exclude)', ({ fixture }) => {
    const exclude = fixture('exclude');
    for (let x = 0; x < 5000; x += 1) {
      const data = genData();
      const allKeys = objectScan(['**'], { joined: true })(data);
      const selectedKeys = samplesize(allKeys, Math.floor(Math.random() * allKeys.length) + 1);
      const excludeKeys = selectedKeys.map((k) => `!${k}`);
      const cloned = clone(data, excludeKeys);
      expect(cloned).to.deep.equal(exclude(data, selectedKeys));
    }
  });

  it('Test simple', () => {
    const data = {
      a: 1,
      b: { x: 2, y: { /* complex object */ } },
      c: [{ /* complex object */ }, { z: 3 }]
    };
    const cloned = clone(data, ['b.y', 'c[0]']);
    expect(data).to.deep.equal(cloned);
    expect(data).to.not.equal(cloned);
    expect(data.b).to.not.equal(cloned.b);
    expect(data.y).to.equal(cloned.y);
    expect(data.c[0]).to.equal(cloned.c[0]);
    expect(data.c[1]).to.not.equal(cloned.c[1]);
  });

  it('Test shallow clone', () => {
    const data = { a: {} };
    const cloned = clone(data, ['**']);
    expect(data).to.deep.equal(cloned);
    expect(data).to.not.equal(cloned);
    expect(data.a).to.equal(cloned.a);
  });

  it('Test exclude', () => {
    const data = { a: {} };
    const cloned = clone(data, ['!a']);
    expect(cloned).to.deep.equal({});
  });

  it('Test complex exclude one', ({ fixture }) => {
    const exclude = fixture('exclude');
    const data = { C: { A: undefined, C: [] }, B: [] };
    const cloned = clone(data, ['!C', '!C.A', '!B']);
    const excluded = exclude(data, ['C', 'C.A', 'B']);
    expect(cloned).to.deep.equal(excluded);
  });

  it('Test complex exclude two', ({ fixture }) => {
    const exclude = fixture('exclude');
    const data = { B: {}, C: {} };
    const cloned = clone(data, ['!C']);
    const excluded = exclude(data, ['C']);
    expect(cloned).to.deep.equal(excluded);
  });

  it('Test complex exclude three', ({ fixture }) => {
    const exclude = fixture('exclude');
    const data = { B: [2, []] };
    const cloned = clone(data, ['!B[0]']);
    const excluded = exclude(data, ['B[0]']);
    expect(cloned).to.deep.equal(excluded);
  });

  it('Test exclude, shallow and deep clone', () => {
    const data = { a: {}, b: {}, c: {} };
    const cloned = clone(data, ['b', '!c']);
    expect(cloned).to.deep.equal({ a: {}, b: {} });
    expect(data.a).to.not.equal(cloned.a);
    expect(data.b).to.equal(cloned.b);
  });
});
