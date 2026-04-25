import { useState, useEffect, useRef } from 'react'
import Canvas, {type Stroke } from '../components/Canvas';
import './DrawingPage.css'

interface InitAction {
    data: Stroke;
}

function DrawingPage() {
    const [syncStatus, setSyncStatus] = useState('connecting');
    const [otherUsers, setOtherUsers] = useState<string[]>([]);
    const [networkDelay, setNetworkDelay] = useState(0);

    const [, setUserDelays] = useState<Map<string, number>>(new Map());

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [myStrokeIds, setMyStrokeIds] = useState<string[]>([]);
    const [, setAllStrokes] = useState<Stroke[]>([]);
    const canvasRef = useRef<{
        clearLocal: () => void;
        drawStroke: (stroke: Stroke) => void;
    } | null>(null);
    const pingIntervalRef = useRef<number | undefined>(undefined);

    useEffect (() => {
        const ws = new WebSocket('ws://localhost:8080/draw');

        ws.onopen = () => {
            setSyncStatus('connected');
            //setOtherUsers(['MockUser1', 'MockUser2']);
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === 'PONG') {
                const delay = Date.now() - msg.timestamp;
                setNetworkDelay(delay);
                setUserDelays(prev => new Map(prev).set(msg.userId, delay));
                return;
            }
        
            if (msg.type === 'INIT') {
                const history = msg.data.map((action: InitAction) => action.data);
                setAllStrokes(history);
                history.forEach((stroke: Stroke) => canvasRef.current?.drawStroke(stroke));
                setOtherUsers(['MockUser1', 'MockUser2']);
            }
            else if (msg.type === 'STROKE') {
                setAllStrokes(prev => [...prev, msg.data]);
                canvasRef.current?.drawStroke(msg.data);
            }
            else if (msg.type === 'CLEAR') {
                setAllStrokes([]);
                canvasRef.current?.clearLocal();
            }
            else if (msg.type === 'UNDO') {
                const idToRemove = msg.data;
                setAllStrokes(prev => {
                    const filtered = prev.filter(s => s.id !== idToRemove);
                    canvasRef.current?.clearLocal();
                    filtered.forEach(s => canvasRef.current?.drawStroke(s));
                    return filtered;
                });
            }
        };

        setSocket(ws);

        pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'PING',
                    timestamp: Date.now()
                }));
            }
        }, 2000);

        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            ws.close();
        };
    }, []);

    const handleDrawFinished = (stroke: Stroke) => {
        setMyStrokeIds(prev => [...prev, stroke.id]);
        setAllStrokes(prev => [...prev, stroke]);
        socket?.send(JSON.stringify({ type: 'STROKE', data: stroke }));
    };

    const handleClearRequest = () => {
        setAllStrokes([]);
        socket?.send(JSON.stringify({ type: 'CLEAR' }));
    };

    const handleUndoRequest = () => {
        if (myStrokeIds.length === 0) return;
        const idToUndo = myStrokeIds[myStrokeIds.length - 1];

        setMyStrokeIds(prev => prev.slice(0, -1));

        setAllStrokes(prev => {
            const filtered = prev.filter(s => s.id !== idToUndo);
            canvasRef.current?.clearLocal();
            filtered.forEach(s => canvasRef.current?.drawStroke(s));
            return filtered;
        });

        socket?.send(JSON.stringify({ type: 'UNDO', data: idToUndo }));
    };

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
                        ref={canvasRef}
                        brushColor="#000000"
                        brushRadius={2}
                        onStrokeFinished={handleDrawFinished}
                        onClearRequest={handleClearRequest}
                        onUndoRequest={handleUndoRequest}
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

export default DrawingPage;