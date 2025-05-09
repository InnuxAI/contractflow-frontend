import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface ResizableLayoutProps {
    leftPanel: React.ReactNode;
    middlePanel: React.ReactNode;
    rightPanel: React.ReactNode;
    initialLeftWidth?: number;
    initialRightWidth?: number;
    isRightPanelVisible?: boolean;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
    leftPanel,
    middlePanel,
    rightPanel,
    initialLeftWidth = 300,
    initialRightWidth = 300,
    isRightPanelVisible = true
}) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [rightWidth, setRightWidth] = useState(initialRightWidth);
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDownLeft = (e: React.MouseEvent) => {
        setIsDraggingLeft(true);
        e.preventDefault();
    };

    const handleMouseDownRight = (e: React.MouseEvent) => {
        setIsDraggingRight(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const containerWidth = containerRef.current.offsetWidth;
            
            if (isDraggingLeft) {
                const newWidth = Math.min(Math.max(200, e.clientX), 600);
                setLeftWidth(newWidth);
            }
            
            if (isDraggingRight) {
                const newWidth = Math.min(Math.max(200, containerWidth - e.clientX), 600);
                setRightWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsDraggingLeft(false);
            setIsDraggingRight(false);
        };

        if (isDraggingLeft || isDraggingRight) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingLeft, isDraggingRight]);

    return (
        <Box ref={containerRef} sx={{ 
            display: 'flex', 
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Left Panel */}
            <Box sx={{ 
                width: leftWidth,
                height: '100%',
                overflow: 'hidden',
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                flexShrink: 0
            }}>
                {leftPanel}
            </Box>

            {/* Resizable Handle */}
            <Box
                sx={{
                    width: '4px',
                    height: '100%',
                    cursor: 'col-resize',
                    bgcolor: 'divider',
                    '&:hover': {
                        bgcolor: 'primary.main',
                    },
                    flexShrink: 0
                }}
                onMouseDown={handleMouseDownLeft}
            />

            {/* Center Panel */}
            <Box sx={{ 
                flex: 1,
                height: '100%',
                overflow: 'hidden',
                minWidth: 400,
                transition: 'margin-right 0.3s ease',
                position: 'relative'
            }}>
                {middlePanel}
            </Box>

            {/* Right Panel and Handle */}
            {isRightPanelVisible && (
                <>
                    <Box
                        sx={{
                            width: '4px',
                            height: '100%',
                            cursor: 'col-resize',
                            bgcolor: 'divider',
                            '&:hover': {
                                bgcolor: 'primary.main',
                            },
                            flexShrink: 0
                        }}
                        onMouseDown={handleMouseDownRight}
                    />
                    <Box sx={{ 
                        width: rightWidth,
                        height: '100%',
                        overflow: 'hidden',
                        borderLeft: 1,
                        borderColor: 'divider',
                        position: 'relative',
                        transition: 'width 0.3s ease',
                        flexShrink: 0
                    }}>
                        {rightPanel}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ResizableLayout; 