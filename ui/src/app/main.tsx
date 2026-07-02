import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css';
import App from './App.tsx'

// providing the store to the entire react-app
import { Provider } from 'react-redux';
import { store } from './store.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
