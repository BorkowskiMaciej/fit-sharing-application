import React, { useState, useEffect } from 'react';
import '../styles/global-message-styles.css';

interface MessageEventDetail {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface Message {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
}

const GlobalMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const handleMessage = (event: CustomEvent<MessageEventDetail>) => {
            const newMessage: Message = {
                id: crypto.randomUUID(),
                message: event.detail.message,
                type: event.detail.type,
                isVisible: true
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            setTimeout(() => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === newMessage.id ? { ...msg, isVisible: false } : msg
                    )
                );
            }, 3000);

            setTimeout(() => {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.id !== newMessage.id)
                );
            }, 3400);
        };

        window.addEventListener('showMessage', handleMessage as EventListener);

        return () => {
            window.removeEventListener('showMessage', handleMessage as EventListener);
        };
    }, []);

    return (
        <div className="global-messages-container">
            {messages.map(({ id, message, type, isVisible }) => (
                <div
                    key={id}
                    className={`global-message ${type} ${isVisible ? 'show' : 'hide'}`}
                >
                    {message}
                </div>
            ))}
        </div>
    );
};

export default GlobalMessages;
