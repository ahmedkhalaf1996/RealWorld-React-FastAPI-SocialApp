import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux';
import {legacy_createStore as createStore, applyMiddleware, StoreEnhancer} from 'redux';
import {thunk} from 'redux-thunk';
import reducers from './Store/reducers/index';


const middlewareEnhancer = applyMiddleware(thunk as any);


// const store = createStore(reducers, compose(applyMiddleware(thunk)));
const store = createStore(  reducers as any,
  middlewareEnhancer as StoreEnhancer);
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
