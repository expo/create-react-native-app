'use strict';

jest.mock('fs');

import { hasYarn } from '../pm';

describe('hasYarn', () => {
  const MOCK_FILE_INFO = {
    '/a/b/yarn.lock': 'fake yarn.lock',
  };

  beforeEach(() => {
    // Set up some mocked out file info before each test
    require('fs').__setMockFiles(MOCK_FILE_INFO);
  });
  test('undefined path will throw exception', () => {
    expect(() => hasYarn(undefined, false)).toThrow();
  });
  test('empty path is ok', () => {
    expect(hasYarn('', false)).toEqual(false);
  });
  test('can find yarn in the given path', () => {
    expect(hasYarn('/a/b', false)).toEqual(true);
  });
  test('can find yarn in the parent path', () => {
    expect(hasYarn('/a/b/c/d/e', false)).toEqual(true);
  });
  test('can NOT find yarn in the children path', () => {
    expect(hasYarn('/a', false)).toEqual(false);
  });
  test('can use cached value 2nd time around', () => {
    expect(hasYarn('/a/b/c/d/e', false)).toEqual(true);
    expect(hasYarn(undefined, true)).toEqual(true);
  });
});
