import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Board from './components/ui/board'
import { GameProvider } from './context/GameContext'

function App() {
  return (
    <div className='flex items-center w-screen h-screen justify-center'>
      <GameProvider>
        <Board />
      </GameProvider>
    </div>
  )
}

export default App
