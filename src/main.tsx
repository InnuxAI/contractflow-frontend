import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense("ORg4AjUWIQA/Gnt2XFhhQlJHfVpdX2BWfFN0QHNddVtwflZOcC0sT3RfQFhjTXxQdkFmWH5bdXJVT2teWA==");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
