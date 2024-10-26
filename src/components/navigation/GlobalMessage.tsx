import React, { useState, useEffect } from 'react';
import '../../styles/global-message-styles.css';

interface MessageEventDetail {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface Message {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const GlobalMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const handleMessage = (event: CustomEvent<MessageEventDetail>) => {
            const newMessage: Message = {
                id: Date.now(),
                message: event.detail.message,
                type: event.detail.type
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            setTimeout(() => {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.id !== newMessage.id)
                );
            }, 3000);
        };

        window.addEventListener('showMessage', handleMessage as EventListener);

        return () => {
            window.removeEventListener('showMessage', handleMessage as EventListener);
        };
    }, []);

    return (
        <div className="global-messages-container">
            {messages.map(({ id, message, type }) => (
                <div key={id} className={`global-message ${type}`}>
                    {message}
                </div>
            ))}
        </div>
    );
};

export default GlobalMessages;
