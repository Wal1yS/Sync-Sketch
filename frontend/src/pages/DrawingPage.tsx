import { useState, useEffect, useRef } from 'react'
import Canvas, {type Stroke } from '../components/Canvas';
import './DrawingPage.css'

// Represents a stroke sent during initial sync
interface InitAction {
    data: Stroke;
}

function DrawingPage() {
    // Connection status for UI
    const [syncStatus, setSyncStatus] = useState('connecting');

    // Assigned username to the user
    const [myName, setMyName] = useState<string>('');

    // List of other connected users
    const [otherUsers, setOtherUsers] = useState<string[]>([]);

    // Measured round‑trip delay
    const [networkDelay, setNetworkDelay] = useState(0);

    // Stores user-specific network delays (ms) for sync simulation
    const [, setUserDelays] = useState<Map<string, number>>(new Map());

    // Active WebSocket connection
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // IDs of strokes created by this user (used for undo)
    const [myStrokeIds, setMyStrokeIds] = useState<string[]>([]);

    // Full stroke history
    const [, setAllStrokes] = useState<Stroke[]>([]);

    // Access to Canvas methods
    const canvasRef = useRef<{
        clearLocal: () => void;
        drawStroke: (stroke: Stroke) => void;
    } | null>(null);

    // Stores interval ID for periodic ping requests to measure network latency
    const pingIntervalRef = useRef<number | undefined>(undefined);
    // Stores current user's name to track identity across re-renders
    const myNameRef = useRef<string>('');

    useEffect (() => {
        // Open WebSocket connection to drawing server
        const ws = new WebSocket('ws://localhost:8080/draw');

        ws.onopen = () => {
            // Connection established
            setSyncStatus('connected');
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            // Handle PONG to measure latency
            if (msg.type === 'PONG') {
                const delay = Date.now() - msg.timestamp;
                setNetworkDelay(delay);
                setUserDelays(prev => new Map(prev).set(msg.userId, delay));
                return;
            }
            
            // Initial sync: username, users list, and full stroke history
            if (msg.type === 'INIT') {
                setMyName(msg.myName);
                myNameRef.current = msg.myName;
                setOtherUsers((msg.users as string[]).filter((u: string) => u !== msg.myName));
                const history = msg.data.map((action: InitAction) => action.data);
                setAllStrokes(history);
                history.forEach((stroke: Stroke) => canvasRef.current?.drawStroke(stroke));
            }

            // Update users list when someone joins/leaves
            else if (msg.type === 'USERS') {
                setOtherUsers((msg.users as string[]).filter((u: string) => u !== myNameRef.current));
            }

            // Receive a new stroke from the user
            else if (msg.type === 'STROKE') {
                setAllStrokes(prev => [...prev, msg.data]);
                canvasRef.current?.drawStroke(msg.data);
            }

            // Clear request from the user
            else if (msg.type === 'CLEAR') {
                setAllStrokes([]);
                canvasRef.current?.clearLocal();
            }

            // Undo request the another user
            else if (msg.type === 'UNDO') {
                const idToRemove = msg.data;
                setAllStrokes(prev => {
                    // Remove the undone stroke and redraw everything
                    const filtered = prev.filter(s => s.id !== idToRemove);
                    canvasRef.current?.clearLocal();
                    filtered.forEach(s => canvasRef.current?.drawStroke(s));
                    return filtered;
                });
            }
        };

        setSocket(ws);

        // Send PING every 2 seconds to measure latency
        pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'PING',
                    timestamp: Date.now()
                }));
            }
        }, 2000);

        // Stop ping timer and close WebSocket connection
        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            ws.close();
        };
    }, []);

    // Called when user finishes drawing a stroke
    const handleDrawFinished = (stroke: Stroke) => {
        setMyStrokeIds(prev => [...prev, stroke.id]);
        setAllStrokes(prev => [...prev, stroke]);
        socket?.send(JSON.stringify({ type: 'STROKE', data: stroke }));
    };

    // Clear all strokes locally and broadcast clear event to other users
    const handleClearRequest = () => {
        setAllStrokes([]);
        socket?.send(JSON.stringify({ type: 'CLEAR' }));
    };

    // Undo last stroke created by this user
    const handleUndoRequest = () => {
        if (myStrokeIds.length === 0) return;
        const idToUndo = myStrokeIds[myStrokeIds.length - 1];

        setMyStrokeIds(prev => prev.slice(0, -1));

        // Remove stroke locally and redraw canvas
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
                {/* Connection status and latency */}
                <div className="left-status">
                    <div className="status-info">
                        <span><strong>{syncStatus === 'connected' ? 'Connected' : 'Connecting...'}</strong></span>
                        <span className="delay">Delay: {Math.round(networkDelay)}ms</span>
                    </div>
                </div>
                {/* Main drawing canvas */}
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
                {/* List of users currently in the room */}
                <div className="users-panel">
                    <h3>In room ({otherUsers.length + 1}):</h3>
                    <ul>
                        <li><strong>{myName} (you)</strong></li>
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