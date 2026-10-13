import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge'
import App from './App';
import {HashRouter} from 'react-router-dom'

bridge.send('VKWebAppInit')
  .then((data) => {
    if (data.result) {
      console.log('VK Bridge успешно инициализирован');
    }
  })
  .catch((error) => console.error('Ошибка инициализации VK:', error))

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
