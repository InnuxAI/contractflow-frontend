import React, { useState, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
    Avatar,
    ConversationHeader,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useDocument } from '../../contexts/DocumentContext';

interface ChatMessage {
    message: string;
    sender: 'user' | 'ai';
    direction: 'incoming' | 'outgoing';
    position: 'single' | 'first' | 'normal' | 'last';
    sentTime: string;
}

const AIChatSidebar: React.FC = () => {
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

            const response = await fetch('https://contractflow-backend-p632skk0v-valterans-projects.vercel.app/api/chat/stream', {
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

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const content = line.slice(6);
                        accumulatedResponse += content;
                        
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
                }
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

    if (!currentDocument) {
        return (
            <Box sx={{ 
                width: '100%',
                height: '100%',
                bgcolor: isDarkMode ? '#0A0A0A' : '#ffffff',
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
                    bgcolor: isDarkMode ? '#0A0A0A' : '#ffffff',
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
            bgcolor: isDarkMode ? '#0A0A0A' : '#ffffff',
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
                            backgroundColor: isDarkMode ? '#0A0A0A' : '#ffffff',
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            flexShrink: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1
                        }}
                    >
                        <ConversationHeader.Content>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                color: theme.palette.text.primary
                            }}>
                                <Avatar
                                    src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                                    name="AI Assistant"
                                    size="md"
                                />
                                <div>
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        color: theme.palette.text.primary 
                                    }}>
                                        AI Assistant
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.8em', 
                                        color: theme.palette.text.secondary 
                                    }}>
                                        {currentDocument.filename}
                                    </div>
                                </div>
                            </div>
                        </ConversationHeader.Content>
                    </ConversationHeader>

                    <MessageList
                        typingIndicator={loading ? <TypingIndicator content="AI is typing" style={{color: theme.palette.text.primary, backgroundColor: isDarkMode ? '#0A0A0A' : '#ffffff'}} /> : null}
                        style={{
                            backgroundColor: isDarkMode ? '#0A0A0A' : '#ffffff',
                            flex: 1,
                            overflow: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}
                    >
                        {messages.map((msg: ChatMessage, index: number) => (
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
                                    backgroundColor: isDarkMode ? '#0A0A0A' : '#f5f5f5',
                                    color: theme.palette.text.primary,
                                    marginBottom: '8px'
                                }}
                            />
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
                            backgroundColor: isDarkMode ? '#0A0A0A' : '#f5f5f5',
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