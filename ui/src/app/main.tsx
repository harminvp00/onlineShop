import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shared/styles/index.css';
import {Provider} from 'react-redux';
import App from './App.tsx'
import { store } from './store.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
