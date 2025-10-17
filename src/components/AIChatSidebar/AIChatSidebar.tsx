import React, { useState, useRef } from 'react';
import { Box, Typography, useTheme, Button } from '@mui/material';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
    ConversationHeader,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './AIChatSidebar.css';
import { useDocument } from '../../contexts/DocumentContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface ChatMessage {
    message: string;
    sender: 'user' | 'ai';
    direction: 'incoming' | 'outgoing';
    position: 'single' | 'first' | 'normal' | 'last';
    sentTime: string;
    isHtml?: boolean;
}

interface AIChatSidebarProps {
    onToggle?: () => void;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ onToggle }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { currentDocument } = useDocument();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (message: string) => {
        if (!message.trim() || !currentDocument) return;

        // Add user message
        const userMessage: ChatMessage = {
            message: message,
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
            sentTime: new Date().toLocaleTimeString(),
        };
        setMessages((prev: ChatMessage[]) => [...prev, userMessage]);

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        setLoading(true);
        let accumulatedResponse = '';

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const requestBody = {
                query: message,
                document_id: currentDocument._id,
                filetype: 'contract',
                top_k: 3,
            };

            console.log('Sending request with body:', requestBody);

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.detail || 'Failed to get response');
            }

            // Log response type for debugging
            console.log('Response content type:', response.headers.get('Content-Type'));
            
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Process the chunk directly - no need to look for "data: " prefixes
                const chunk = decoder.decode(value);
                accumulatedResponse += chunk;
                
                // Update the message with each chunk
                setMessages((prev: ChatMessage[]) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.sender === 'ai') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, message: accumulatedResponse }
                        ];
                    } else {
                        return [
                            ...prev,
                            {
                                message: accumulatedResponse,
                                sender: 'ai',
                                direction: 'incoming',
                                position: 'single',
                                sentTime: new Date().toLocaleTimeString(),
                            }
                        ];
                    }
                });
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Error:', error);
                setMessages((prev: ChatMessage[]) => [
                    ...prev,
                    {
                        message: error instanceof Error ? error.message : 'Sorry, there was an error processing your request.',
                        sender: 'ai',
                        direction: 'incoming',
                        position: 'single',
                        sentTime: new Date().toLocaleTimeString(),
                    }
                ]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleCheckCompliance = async () => {
        if (!currentDocument) return;

        // Add system message
        const systemMessage: ChatMessage = {
            message: "Checking document compliance...",
            sender: 'ai',
            direction: 'incoming',
            position: 'single',
            sentTime: new Date().toLocaleTimeString(),
        };
        setMessages((prev: ChatMessage[]) => [...prev, systemMessage]);

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const requestBody = {
                document_id: currentDocument._id,
            };

            const response = await fetch(`${API_URL}/api/compliance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.detail || 'Failed to get compliance score');
            }

            const complianceData = await response.json();
            
            // Use HTML content if available, otherwise format the response as before
            if (complianceData.html_content) {
                // Update the system message with the HTML compliance results
                setMessages((prev: ChatMessage[]) => [
                    ...prev.slice(0, -1), // Remove the "Checking document compliance..." message
                    {
                        message: complianceData.html_content,
                        sender: 'ai',
                        direction: 'incoming',
                        position: 'single',
                        sentTime: new Date().toLocaleTimeString(),
                        isHtml: true
                    }
                ]);
            } else {
                // Fallback to the old formatting if HTML content is not available
                const formattedResponse = `
## Compliance Analysis

**Document Domain:** ${complianceData.domain}
**Compliance Score:** ${complianceData.score}/100

### Analysis
${complianceData.analysis}

### Clause Matches
${complianceData.clause_matches.map((clause: import('../../types').ClauseMatch) => `
- **${clause.title}** - ${clause.compliant ? 'Compliant' : 'Non-compliant'} (Score: ${clause.score}/100)
  - ${clause.explanation}
  ${clause.recommendation ? `  - Recommendation: ${clause.recommendation}` : ''}
`).join('\n')}
`;

                // Update the system message with the compliance results
                setMessages((prev: ChatMessage[]) => [
                    ...prev.slice(0, -1), // Remove the "Checking document compliance..." message
                    {
                        message: formattedResponse,
                        sender: 'ai',
                        direction: 'incoming',
                        position: 'single',
                        sentTime: new Date().toLocaleTimeString()
                    }
                ]);
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages((prev: ChatMessage[]) => [
                ...prev.slice(0, -1), // Remove the "Checking document compliance..." message
                {
                    message: error instanceof Error ? error.message : 'Sorry, there was an error checking compliance.',
                    sender: 'ai',
                    direction: 'incoming',
                    position: 'single',
                    sentTime: new Date().toLocaleTimeString(),
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!currentDocument) {
        return (
            <Box sx={{ 
                width: '100%',
                height: '100%',
                bgcolor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                borderLeft: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flex: 1,
                    bgcolor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                    color: theme.palette.text.primary
                }}>
                    <Typography variant="body2" color="text.secondary">
                        Select a document to start chatting
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '100%',
            height: '100%',
            bgcolor: isDarkMode ? '#1c1c1c' : '#f8fafc',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <MainContainer responsive style={{ 
                height: '100%',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <ChatContainer style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <ConversationHeader
                        style={{
                            backgroundColor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            flexShrink: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1
                        }}
                    >
                        <ConversationHeader.Content>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: theme.palette.text.primary
                            }}>
                                <Box 
                                    component="img" 
                                    src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        cursor: onToggle ? 'pointer' : 'default',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': onToggle ? {
                                            transform: 'scale(1.05)'
                                        } : {}
                                    }}
                                    onClick={onToggle}
                                />
                                <Box>
                                    <Typography sx={{ 
                                        fontWeight: 'bold', 
                                        color: 'text.primary',
                                        fontSize: '0.875rem'
                                    }}>
                                        AI Assistant
                                    </Typography>
                                    <Typography sx={{ 
                                        fontSize: '0.75rem', 
                                        color: 'text.secondary'
                                    }}>
                                        {currentDocument.filename}
                                    </Typography>
                                </Box>
                            </Box>
                        </ConversationHeader.Content>
                        <ConversationHeader.Actions>
                            <Button 
                                variant="contained" 
                                color="primary"
                                size="small"
                                onClick={handleCheckCompliance}
                                disabled={loading}
                                sx={{ 
                                    fontSize: '0.75rem', 
                                    whiteSpace: 'nowrap',
                                    ml: 1
                                }}
                            >
                                Check Compliance
                            </Button>
                        </ConversationHeader.Actions>
                    </ConversationHeader>

                    <MessageList
                        typingIndicator={loading ? <TypingIndicator content="AI is typing" style={{color: theme.palette.text.primary, backgroundColor: isDarkMode ? '#1c1c1c' : '#f8fafc'}} /> : null}
                        style={{
                            backgroundColor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                            flex: 1,
                            overflow: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}
                    >
                        {messages.map((msg: ChatMessage, index: number) => (
                            msg.isHtml ? (
                                <Box 
                                    key={index}
                                    sx={{
                                        backgroundColor: isDarkMode ? '#0d0d0d' : '#ffffff',
                                        color: 'text.primary',
                                        marginBottom: 2,
                                        padding: 2,
                                        borderRadius: 1,
                                        width: '100%',
                                        overflowX: 'auto',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                                    <Typography 
                                        sx={{
                                            fontSize: '0.75rem',
                                            color: 'text.secondary',
                                            marginTop: 1,
                                            textAlign: 'right'
                                        }}
                                    >
                                        {msg.sentTime}
                                    </Typography>
                                </Box>
                            ) : (
                                <Message
                                    key={index}
                                    model={{
                                        message: msg.message,
                                        sentTime: msg.sentTime,
                                        sender: msg.sender,
                                        direction: msg.direction,
                                        position: msg.position,
                                    }}
                                    style={{
                                        backgroundColor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                                        color: theme.palette.text.primary,
                                        marginBottom: '8px'
                                    }}
                                />
                            )
                        ))}
                        <div ref={messagesEndRef} />
                    </MessageList>

                    <MessageInput
                        placeholder="Type message here"
                        onSend={handleSubmit}
                        disabled={loading}
                        attachButton={false}
                        sendButton={true}
                        style={{
                            backgroundColor: isDarkMode ? '#1c1c1c' : '#f8fafc',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.text.primary,
                            padding: '12px 16px',
                            flexShrink: 0,
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1
                        }}
                    />
                </ChatContainer>
            </MainContainer>
        </Box>
    );
};

export default AIChatSidebar; 