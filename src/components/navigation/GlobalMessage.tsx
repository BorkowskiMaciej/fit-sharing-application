import React, { useState, useEffect } from 'react';

interface MessageEventDetail {
    message: string;
    type: 'success' | 'error' | 'info';
}

const GlobalMessages: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

    useEffect(() => {
        const handleMessage = (event: CustomEvent<MessageEventDetail>) => {
            setMessage(event.detail.message);
            setMessageType(event.detail.type);
            setTimeout(() => setMessage(''), 3000);
        };

        window.addEventListener('showMessage', handleMessage as EventListener);

        return () => {
            window.removeEventListener('showMessage', handleMessage as EventListener);
        };
    }, []);

    if (!message) return null;

    return (
        <div className={`global-message ${messageType}`}>
            {message}
        </div>
    );
};

export default GlobalMessages;
