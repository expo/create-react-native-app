import React from 'react';
import ReactNative from 'react-native';
import App from './App';

// this is included from the jest-expo preset
// make sure to include it in package.json yourself if you change the jest preset
import renderer from 'react-test-renderer';

it('renders without crashing', () => {
  const tree = renderer.create(<App />);
});
