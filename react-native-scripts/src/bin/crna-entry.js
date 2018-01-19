import Expo from 'expo';
import App from '../../../../App';
import React, { Component } from 'react';
import { View } from 'react-native';

if (process.env.NODE_ENV === 'development') {
  Expo.KeepAwake.activate();
}

Expo.registerRootComponent(App);
