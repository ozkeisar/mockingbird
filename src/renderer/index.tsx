import { createRoot } from 'react-dom/client';
import App from './App';
import {loader} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import * as amplitude from '@amplitude/analytics-browser';


const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

amplitude.init(isDev?'':'ed51d61371d63ef1136b842900ebdae');


loader.config({ monaco });

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
