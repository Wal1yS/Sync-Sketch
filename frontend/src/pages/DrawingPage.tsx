import { useState, useEffect } from 'react'
import Canvas from '../components/Canvas';
import './DrawingPage.css'

function DrawingPage() {
    const [syncStatus, setSyncStatus] = useState('connecting');
    const [otherUsers, setOtherUsers] = useState([]);
    const [networkDelay, setNetworkDelay] = useState(0);

    useEffect (() => {
        // Mock
        setTimeout(() => {
            setSyncStatus('connected')
            setOtherUsers(['MockUser1', 'MockUser2'])
        }, 1000)
        // Mock
        const interval = setInterval(() => {
            const delay = Math.floor(Math.random() * 400) + 100
            setNetworkDelay(delay)
        }, 3000)
        return () => clearInterval(interval)
    }, [])
    // Mock
    const handleDraw = () => {
        console.log('Mock drawing')
    }

  return (
    <div className="drawing-page">
      <h1>Collaborative Drawing Canvas</h1>
      <div className="main-content">
        <div className="left-status">
          <div className="status-info">
            <span><strong>{syncStatus === 'connected' ? 'Connected' : 'Connecting...'}</strong></span>
            <span className="delay">Delay: {Math.round(networkDelay)}ms</span>
          </div>
        </div>
        <div className="center-canvas">
          <Canvas 
            brushColor="#000000" 
            brushRadius={2} 
            onDraw={handleDraw} 
          />
        </div>
        <div className="users-panel">
          <h3>In room ({otherUsers.length + 1}):</h3>
          <ul>
            <li><strong>You (you)</strong></li>
            {otherUsers.map(user => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DrawingPage