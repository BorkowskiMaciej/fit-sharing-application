import { useState, useEffect } from 'react';
import axiosInstance from '../configuration/axiosConfig';
import {AxiosError} from "axios";

interface UseRelationshipProps {
    fsUserId: string | undefined;
}

export const useRelationship = ({ fsUserId }: UseRelationshipProps) => {
    const [relationshipStatus, setRelationshipStatus] = useState<string>('NOT_FOUND');
    const [senderFsUserId, setSenderFsUserId] = useState<string>('');
    const [relationshipId, setRelationshipId] = useState<string>('');

    const fetchRelationship = async () => {
        try {
            await axiosInstance
                .get(`/relationships/${fsUserId}`)
                .then(response => {
                    setRelationshipStatus(response.data.status);
                    setSenderFsUserId(response.data.sender);
                    setRelationshipId(response.data.id);
                });
        } catch (error) {
            setRelationshipStatus('NOT_FOUND');
        }
    };

    useEffect(() => {
        if (fsUserId) {
            fetchRelationship();
        }
    }, [fsUserId]);

    const handleRelationshipError = (error: unknown) => {
        if (error instanceof AxiosError && error.response?.data) {
            let message;
            switch (error.response.data.code) {
                case "SERVICE-2001":
                    message = 'This invitation was already sent. Please wait for a response.';
                    break;
                case "SERVICE-2002":
                    message = 'This relationship request is still pending.';
                    break;
                case "SERVICE-2003":
                    message = 'The recipient was not found. Please check the user and try again.';
                    break;
                case "SERVICE-2004":
                    message = 'You cannot send a request to yourself.';
                    break;
                case "SERVICE-2005":
                    message = 'The specified relationship was not found.';
                    break;
                case "SERVICE-2006":
                    message = 'You are not authorized to manage this relationship.';
                    break;
                case "SERVICE-2007":
                    message = 'You are not authorized to accept this relationship.';
                    break;
                case "SERVICE-2008":
                    message = 'The relationship is not in a pending status.';
                    break;
                case "SERVICE-2009":
                    message = 'Cannot delete the relationship. Ensure it is accepted or you are the sender.';
                    break;
                default:
                    message = 'An unexpected error occurred. Please try again later.';
                    break;
            }

            window.dispatchEvent(new CustomEvent('showMessage', {
                detail: { message, type: 'red' }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('showMessage', {
                detail: { message: 'Network error. Please check your connection and try again.', type: 'red' }
            }));
        }
    };

    const sendInvite = async () => {
        try {
            await axiosInstance.post(`/relationships/send/${fsUserId}`);
            fetchRelationship();
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was sent.', type: 'green' } }));
        } catch (error) {
            handleRelationshipError(error);
        }
    };

    const deleteInvitation = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            fetchRelationship();
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was deleted.', type: 'green' } }));
        } catch (error) {
            handleRelationshipError(error);
        }
    };

    const acceptInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/accept/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was accepted.', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            handleRelationshipError(error);
        }
    };

    const rejectInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/reject/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was rejected.', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            handleRelationshipError(error);
        }
    };

    const deleteRelationship = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Relationship was deleted.', type: 'green' } }));
            fetchRelationship();
        } catch (error) {
            handleRelationshipError(error);
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
