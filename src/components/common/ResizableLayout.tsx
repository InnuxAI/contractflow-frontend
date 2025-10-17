import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface ResizableLayoutProps {
    leftPanel: React.ReactNode;
    middlePanel: React.ReactNode;
    rightPanel: React.ReactNode;
    initialLeftWidth?: number;
    initialRightWidth?: number;
    isRightPanelVisible?: boolean;
    isLeftPanelCollapsed?: boolean;
    isRightPanelCollapsed?: boolean;
    onLeftToggle?: () => void;
    onRightToggle?: () => void;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
    leftPanel,
    middlePanel,
    rightPanel,
    initialLeftWidth = 300,
    initialRightWidth = 300,
    isRightPanelVisible = true,
    isLeftPanelCollapsed = false,
    isRightPanelCollapsed = false,
    onLeftToggle,
    onRightToggle
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
                width: isLeftPanelCollapsed ? '50px' : leftWidth,
                height: '100%',
                overflow: 'hidden',
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                flexShrink: 0,
                transition: 'width 0.3s ease',
                backgroundColor: 'background.paper'
            }}>
                {isLeftPanelCollapsed ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'flex-start',
                        pt: 2
                    }}>
                        <IconButton onClick={onLeftToggle} size="small">
                            <MenuIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1000,
                            backgroundColor: 'background.paper',
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}>
                            <IconButton 
                                onClick={onLeftToggle} 
                                size="small"
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        {leftPanel}
                    </>
                )}
            </Box>

            {/* Resizable Handle - Only show when not collapsed */}
            {!isLeftPanelCollapsed && (
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
            )}

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
                    {/* Right Resizable Handle - Only show when not collapsed */}
                    {!isRightPanelCollapsed && (
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
                    )}
                    <Box sx={{ 
                        width: isRightPanelCollapsed ? '50px' : rightWidth,
                        height: '100%',
                        overflow: 'hidden',
                        borderLeft: 1,
                        borderColor: 'divider',
                        position: 'relative',
                        transition: 'width 0.3s ease',
                        flexShrink: 0,
                        backgroundColor: 'background.paper'
                    }}>
                        {isRightPanelCollapsed ? (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'flex-start',
                                pt: 2,
                                position: 'relative'
                            }}>
                                <IconButton 
                                    onClick={onRightToggle} 
                                    size="small"
                                    sx={{
                                        '&:hover': {
                                            transform: 'scale(1.1) rotate(-45deg)',
                                            transition: 'all 0.2s ease'
                                        }
                                    }}
                                >
                                    <Box sx={{ 
                                        transform: 'rotate(-45deg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'transform 0.2s ease'
                                    }}>
                                        <Box 
                                            component="img" 
                                            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
                                            sx={{ 
                                                width: 24, 
                                                height: 24,
                                                filter: 'grayscale(1) brightness(0.7)',
                                                transition: 'filter 0.2s ease',
                                                '&:hover': {
                                                    filter: 'grayscale(0) brightness(1)'
                                                }
                                            }} 
                                        />
                                    </Box>
                                </IconButton>
                            </Box>
                        ) : (
                            <>
                                {rightPanel}
                            </>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ResizableLayout; 