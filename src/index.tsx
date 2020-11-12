import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { RootProvider } from './rootProviders';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
    <React.StrictMode>
        <RootProvider>
            <App />
        </RootProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);
