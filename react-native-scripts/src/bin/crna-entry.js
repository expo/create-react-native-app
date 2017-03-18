import Expo from 'expo';
import App from '../../../../App';
import React from 'react';
import { View } from 'react-native';

// we don't want this to require transformation
class AwakeApp extends React.Component {
  render() {
    return React.createElement(
      View,
      {
        style: {
          flex: 1,
        },
      },
      React.createElement(App, null),
      React.createElement(Expo.KeepAwake, null)
    );
  }
}

Expo.registerRootComponent(AwakeApp);
