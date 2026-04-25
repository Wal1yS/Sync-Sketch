import { useRef, useState, useImperativeHandle, forwardRef } from 'react'

export interface Point { x: number; y: number; }
export interface Stroke {
    id: string;
    color: string;
    width: number;
    points: Point[];
    isEraser?: boolean;
}

interface CanvasProps {
    brushColor?: string;
    brushRadius?: number;
    onStrokeFinished: (stroke: Stroke) => void;
    onClearRequest: () => void;
    onUndoRequest: () => void;
}

const Canvas = forwardRef(({ brushColor = '#000000', brushRadius = 2, onStrokeFinished, onClearRequest, onUndoRequest }: CanvasProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [selectedColor, setSelectedColor] = useState(brushColor);
    const [brushSize, setBrushSize] = useState(brushRadius);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    const [isErasing, setIsErasing] = useState(false);
    const [savedColor, setSavedColor] = useState(brushColor);
    
    const getContext = () => {
        return canvasRef.current?.getContext('2d');
    };

    useImperativeHandle(ref, () => ({
        clearLocal: () => {
            const ctx = getContext();
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        },
        drawStroke: (stroke: Stroke) => {
            const ctx = getContext();
            if (!ctx || stroke.points.length < 1) return;
            ctx.save();
            if (stroke.isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.color;
            }
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            ctx.restore();
        }
    }));

    const clearCanvas = () => {
        onClearRequest();
        const ctx = getContext();
        if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const undo = () => {
        onUndoRequest();
    };

    const increaseSize = () => setBrushSize(prev => Math.min(prev + 1, 30));
    const decreaseSize = () => setBrushSize(prev => Math.max(prev - 1, 1));

    const makeEraser = () => {
        if (!isErasing) {
            setSavedColor(selectedColor);
            setIsErasing(true);
        } else {
            setSelectedColor(savedColor);
            setIsErasing(false);
        }
    };

    const getCoords = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        return rect ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : { x: 0, y: 0 };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const p = getCoords(e);
        const newStroke: Stroke = { id: crypto.randomUUID(), color: selectedColor, width: brushSize, points: [p], isEraser: isErasing };
        setCurrentStroke(newStroke);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentStroke) return;
        const p = getCoords(e);
        const lastP = currentStroke.points[currentStroke.points.length - 1];
        const ctx = getContext();
        if (ctx) {
            ctx.save();
            if (currentStroke.isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentStroke.color;
            }
            ctx.lineWidth = currentStroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(lastP.x, lastP.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.restore();
        }
        currentStroke.points.push(p);
    };

    const handleMouseUp = () => {
        if (isDrawing && currentStroke) {
            onStrokeFinished(currentStroke);
        }
        setIsDrawing(false);
        setCurrentStroke(null);
    };

    return (
        <div className="canvas-wrapper">
            <div className="canvas-with-toolbar">
                <div className="toolbar-vertical">
                    <button onClick={undo}>Undo</button>
                    <button onClick={clearCanvas}>Clear</button>
                    <button onClick={makeEraser}>{isErasing ? 'Draw' : 'Eraser'}</button>
                    <div className="size-control">
                        <button className="size-button" onClick={increaseSize}>+</button>
                        <input
                            type="number"
                            className="size-input"
                            value={brushSize}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    setBrushSize(Math.min(Math.max(val, 1), 30));
                                }
                            }}
                            style={{ color: 'black' }}
                        />
                        <button className="size-button" onClick={decreaseSize}>-</button>
                    </div>
                    {!isErasing && (
                    <input
                        type="color"
                        className="color-input"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        title="Choose color"
                    />
                )}
                </div>
                <div className="canvas-draw-container">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{ background: 'white' }}
                    />
                </div>
            </div>
        </div>
    )
});

export default Canvas;