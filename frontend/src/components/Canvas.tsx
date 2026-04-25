import { useRef, useState, useImperativeHandle, forwardRef } from 'react'

export interface Point { x: number; y: number; }
export interface Stroke {
    id: string;
    color: string;
    width: number;
    points: Point[];
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
    const [isEyeDropperMode, setIsEyeDropperMode] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    useImperativeHandle(ref, () => ({
        clearLocal: () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        },
        drawStroke: (stroke: Stroke) => {
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx || stroke.points.length < 1) return;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
    }));

    const clearCanvas = () => {
        onClearRequest();
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const undo = () => {
        onUndoRequest();
    };

    const increaseSize = () => setBrushSize(prev => Math.min(prev + 1, 30));
    const decreaseSize = () => setBrushSize(prev => Math.max(prev - 1, 1));

    const getColorAtPixel = (x: number, y: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
        setSelectedColor(hex);
        setIsEyeDropperMode(false);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEyeDropperMode) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                getColorAtPixel(x, y);
            }
        }
    };

    const getCoords = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        return rect ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : { x: 0, y: 0 };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEyeDropperMode) return;
        const p = getCoords(e);
        const newStroke: Stroke = { id: crypto.randomUUID(), color: selectedColor, width: brushSize, points: [p] };
        setCurrentStroke(newStroke);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentStroke || isEyeDropperMode) return;
        const p = getCoords(e);
        const lastP = currentStroke.points[currentStroke.points.length - 1];
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = currentStroke.color;
            ctx.lineWidth = currentStroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(lastP.x, lastP.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
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
                    <div className="size-control">
                        <button className="size-button" onClick={increaseSize}>+</button>
                        <input
                            type="number"
                            className="size-input"
                            value={brushSize === 0 ? '' : brushSize}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setBrushSize(isNaN(val) ? 0 : Math.min(Math.max(val, 1), 30));
                            }}
                            style={{ color: 'black' }}
                        />
                        <button className="size-button" onClick={decreaseSize}>-</button>
                    </div>
                    <button
                        className={`pipette-button ${isEyeDropperMode ? 'active' : ''}`}
                        onClick={() => setIsEyeDropperMode(!isEyeDropperMode)}
                        title="Pick color from canvas">Pipette
                    </button>
                    <input
                        type="color"
                        className="color-input"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        title="Choose color"
                    />
                </div>
                <div
                    className={`canvas-draw-container ${isEyeDropperMode ? 'pipette-mode' : ''}`}
                    onClick={handleCanvasClick}
                >
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{ background: 'transparent' }}
                    />
                </div>
            </div>
        </div>
    )
});

export default Canvas;