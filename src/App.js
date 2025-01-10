import {useEffect} from 'react'
import Registration from './screens/Registration'
import Header from './components/Header'

import './App.css'

const tg = window.Telegram.WebApp

function App() {
  useEffect(() => {
    tg.ready()
    if (!tg.isExpanded) {
      tg.expand()
    }
  }, [])

  return <div>
    <Header />
    <Registration />
  </div>
}

export default App;
