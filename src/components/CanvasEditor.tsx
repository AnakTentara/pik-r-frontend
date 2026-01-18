"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface CanvasEditorProps {
    activeSlide: any;
    onCanvasReady: (canvas: fabric.Canvas) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ activeSlide, onCanvasReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Check if canvas is already initialized to prevent double init in strict mode
        // (Fabric usually handles this but good to be safe)

        const width = containerRef.current.clientWidth;
        const ratio = activeSlide?.ratio || 4 / 5;
        const height = width / ratio;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width,
            height: height,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
        });

        setFabricCanvas(canvas);
        if (onCanvasReady) onCanvasReady(canvas);

        const handleResize = () => {
            if (containerRef.current) {
                const newWidth = containerRef.current.clientWidth;
                const scale = newWidth / canvas.getWidth();
                const newHeight = newWidth / ratio;

                canvas.setWidth(newWidth);
                canvas.setHeight(newHeight);
                canvas.setZoom(canvas.getZoom() * scale);
                canvas.renderAll();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-200 p-4">
            <div className="shadow-2xl">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default CanvasEditor;
