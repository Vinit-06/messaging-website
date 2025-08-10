import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.jsx'

// Hide loading screen when React app loads
const loadingScreen = document.getElementById('loading-screen')
if (loadingScreen) {
  loadingScreen.style.display = 'none'
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
