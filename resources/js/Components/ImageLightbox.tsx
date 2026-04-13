import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface ImageLightboxProps {
    readonly src: string | null;
    readonly alt: string;
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyTouchAction = document.body.style.touchAction;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.touchAction = originalBodyTouchAction;
        };
    }, [isOpen]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => {
        setZoom(prev => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
        if (zoom > 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
        if (isDragging && zoom > 1) {
            e.preventDefault();
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        }
    };

    const handleViewportKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
    ) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (zoom <= 1) {
            return;
        }

        const step = 40;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, x: prev.x + step }));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, x: prev.x - step }));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, y: prev.y + step }));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, y: prev.y - step }));
        }
    };

    if (!src) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex touch-none flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
                    onMouseUp={handleMouseUp}
                >
                    {/* Image Container */}
                    <button
                        type="button"
                        className="relative z-[101] h-full w-full cursor-grab overflow-hidden touch-none active:cursor-grabbing"
                        aria-label="Lightbox image viewport"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onKeyDown={handleViewportKeyDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                        onTouchCancel={handleMouseUp}
                    >
                        <motion.div
                            animate={{ 
                                scale: zoom,
                                x: position.x,
                                y: position.y
                            }}
                            transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
                            className="flex h-full w-full items-center justify-center pointer-events-none"
                        >
                            <img
                                src={src}
                                alt={alt}
                                className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl pointer-events-auto select-none"
                                draggable={false}
                            />
                        </motion.div>
                    </button>

                    {/* Controls Bar */}
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute top-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-white/10 px-6 py-3 shadow-2xl backdrop-blur-md"
                    >
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom === 1}
                            className="bg-white/5 text-white hover:bg-white/20 disabled:opacity-30 rounded-lg p-2 transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <span className="min-w-[50px] text-center text-sm font-bold text-white">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="bg-white/5 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </button>
                        <div className="mx-2 h-6 w-px bg-white/20" />
                        <button
                            onClick={handleReset}
                            className="bg-white/5 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            title="Reset"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-[#c62828] text-white hover:brightness-110 rounded-lg p-2 transition-colors"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>

                    {/* Hint */}
                    {zoom > 1 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs font-medium text-white/50 tracking-wider uppercase">
                            Klik dan geser untuk melihat detail
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
