import { createRoot } from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import * as amplitude from '@amplitude/analytics-browser';
import App from './App';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

amplitude.init(
  isDev
    ? '16543070a2c829f8a27f46c21fc0f708'
    : 'ed51d61371d63ef1136b842900ebdae',
);

loader.config({ monaco });

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
