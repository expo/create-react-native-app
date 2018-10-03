import { KeepAwake, registerRootComponent } from 'expo';
import App from '../../../../src/App';

if (process.env.NODE_ENV === 'development') KeepAwake.activate();

registerRootComponent(App);
