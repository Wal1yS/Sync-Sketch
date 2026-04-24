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

    return (
        <div className="canvas-wrapper">
            <div className="canvas-with-toolbar">
                <div className="toolbar-vertical">
                    <button onClick={undo}>Undo</button>
                    <button onClick={clearCanvas}>Clear</button>
                    <div className="size-control">
                        <button className="size-button" onClick={decreaseSize}>-</button>
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
                        <button className="size-button" onClick={increaseSize}>+</button>
                    </div>
                    <input
                        type="color"
                        className="color-input"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        title="Choose color"
                    />
                </div>
                <div className="canvas-area">
                    <CanvasDraw
                        ref={canvasRef}
                        brushColor={selectedColor}
                        brushRadius={brushSize}
                        onChange={onDraw}
                        canvasWidth={800}
                        canvasHeight={500}
                    />
                </div>
            </div>
        </div>
    )
}

export default Canvas