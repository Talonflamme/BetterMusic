import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import log from 'electron-log/renderer';
import './main.scss';

log.initialize({ preload: true });
Object.assign(console, log.functions);

const root = createRoot(document.getElementById("root"));
root.render(<App />);
