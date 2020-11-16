import React from 'react';
import Navigation from './app/navigations/Navigation';
import { firebaseApp } from './app/utils/firebase';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings([
  'Setting a timer',
  'Animated: `useNativeDriver` was not specified.',
]);

export default function App() {
  return <Navigation />;
}
