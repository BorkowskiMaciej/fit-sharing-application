import { useState, useEffect } from 'react';
import axiosInstance from '../configuration/axiosConfig';

interface UseRelationshipProps {
    fsUserId: string | undefined;
}

export const useRelationship = ({ fsUserId }: UseRelationshipProps) => {
    const [relationshipStatus, setRelationshipStatus] = useState<string>('NOT_FOUND');
    const [senderFsUserId, setSenderFsUserId] = useState<string>('');
    const [relationshipId, setRelationshipId] = useState<string>('');

    const fetchRelationship = async () => {
        try {
            const response = await axiosInstance.get(`/relationships/${fsUserId}`);
            setRelationshipStatus(response.data.status);
            setSenderFsUserId(response.data.sender);
            setRelationshipId(response.data.id);
        } catch (error) {
            console.error('Failed to fetch relationship status:', error);
            setRelationshipStatus('NOT_FOUND');
        }
    };

    useEffect(() => {
        if (fsUserId) {
            fetchRelationship();
        }
    }, [fsUserId]);

    const sendInvite = async () => {
        try {
            await axiosInstance.post(`/relationships/send/${fsUserId}`);
            fetchRelationship();
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was sent', type: 'green' } }));
        } catch (error) {
            console.error('Failed to send invitation:', error);
        }
    };

    const deleteInvitation = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            fetchRelationship();
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was deleted', type: 'green' } }));
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

    const acceptInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/accept/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was accepted', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            console.error('Failed to accept invitation:', error);
        }
    };

    const rejectInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/reject/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was rejected', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            console.error('Failed to reject invitation:', error);
        }
    };

    const deleteRelationship = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Relationship was deleted', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

    return {
        relationshipStatus,
        senderFsUserId,
        relationshipId,
        sendInvite,
        deleteInvitation,
        acceptInvitation,
        rejectInvitation,
        deleteRelationship,
        fetchRelationship,
    };
};
