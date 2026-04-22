import { useRef, useState } from 'react'
import CanvasDraw from 'react-canvas-draw'

// Canvas properties
interface CanvasProps {
    brushColor?: string;
    brushRadius?: number;
    onDraw?: () => void;
}

/* Drawing canvas component with toolbar
    - Drawing with mouse
    - Undo functionality
    - Brush size control
    - Color picker
    - Eye dropper tool
*/
function Canvas({ brushColor = '#000000', brushRadius = 2, onDraw = () => {} }) {
    const canvasRef = useRef<any>(null);
    const [selectedColor, setSelectedColor] = useState(brushColor)
    const [brushSize, setBrushSize] = useState(brushRadius);
    const [isEyeDropperMode, setIsEyeDropperMode] = useState(false);
    
    const clearCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.clear()
        }
    };

    const undo = () => {
        if (canvasRef.current) {
            canvasRef.current.undo()
        }
    };

    const increaseSize = () => {
        setBrushSize(prev => Math.min(prev +2, 30));
    };

    const decreaseSize = () => {
        setBrushSize(prev => Math.max(prev - 2, 1));
    };

    const getColorAtPixel = (x: number, y: number) => {
        const canvas = canvasRef.current?.canvas?.drawing;
        if (!canvas) return;
        // Pixels on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Read 1x1 pixel at (x, y) in format [R, G, B, A]
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        // Convert RGB to HEX
        const hex =
            '#' +
            [pixel[0], pixel[1], pixel[2]]
                .map((v) => v.toString(16).padStart(2, '0'))
                .join('');

        setSelectedColor(hex);
        setIsEyeDropperMode(false);
    };

    // Handles click on canvas, processing when eye dropper is active
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEyeDropperMode) return;
        
        const canvas = canvasRef.current?.canvas?.drawing;
        // Get the coordinates and size of the canvas on the screen
        const rect = canvas?.getBoundingClientRect();
        if (rect) {
            // Check if click is inside canvas boundaries
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                getColorAtPixel(x, y);
            }
        }
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
                                const userSizeInput = e.target.value;
                                if (userSizeInput === '') {
                                    setBrushSize(0);
                                    return;
                                }
                                let value = parseInt(userSizeInput);
                                if (!isNaN(value)) {
                                    value = Math.min(Math.max(value, 1), 30);
                                    setBrushSize(value);
                                }
                            }}
                            onBlur={() => {
                                if (brushSize === 0 || isNaN(brushSize)) {
                                    setBrushSize(5);
                                }
                            }}
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
                    <CanvasDraw
                        ref={canvasRef}
                        brushColor={selectedColor}
                        brushRadius={brushSize}
                        onChange={onDraw}
                        canvasWidth={800}
                        canvasHeight={500}
                        disabled={isEyeDropperMode}
                    />
                </div>
            </div>
        </div>
    )
}

export default Canvas