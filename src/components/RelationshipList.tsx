import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useParams } from 'react-router-dom';
import { RelationshipResponse } from '../types';
import UserCard from "./UserCard";

const RelationshipList = () => {
    const { query } = useParams();
    const [acceptedRelationships, setAcceptedRelationships] = useState<RelationshipResponse[]>([]);
    const [sentRelationships, setSentRelationships] = useState<RelationshipResponse[]>([]);
    const [receivedRelationships, setReceivedRelationships] = useState<RelationshipResponse[]>([]);

    useEffect(() => {
        const fetchAcceptedRelationships = async () => {
            try {
                const response = await axiosInstance.get(`/relationships/accepted`);
                setAcceptedRelationships(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        const fetchSentRelationships = async () => {
            try {
                const response = await axiosInstance.get(`/relationships/sent`);
                setSentRelationships(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        const fetchReceivedRelationships = async () => {
            try {
                const response = await axiosInstance.get(`/relationships/received`);
                setReceivedRelationships(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchAcceptedRelationships();
        fetchSentRelationships();
        fetchReceivedRelationships();
    }, [query]);

    return (
        <div>
            <h3>Received invitations</h3>
            {receivedRelationships.length === 0 ? (
                <p>No users found.</p>
            ) : (
                receivedRelationships.map(response => (
                    <UserCard key={response.friendUsername}
                              username={response.friendUsername}
                              firstName={response.friendFirstName}
                              lastName={response.friendLastName}
                              fsUserId={response.friendFsUserId}
                    />
                ))
            )}
            <h3>Sent invitations</h3>
            {sentRelationships.length === 0 ? (
                <p>No users found.</p>
            ) : (
                sentRelationships.map(response => (
                    <UserCard key={response.friendUsername}
                              username={response.friendUsername}
                              firstName={response.friendFirstName}
                              lastName={response.friendLastName}
                              fsUserId={response.friendFsUserId}
                    />
                ))
            )}
            <h3>Friends</h3>
            {acceptedRelationships.length === 0 ? (
                <p>No users found.</p>
            ) : (
                acceptedRelationships.map(response => (
                    <UserCard key={response.friendUsername}
                              username={response.friendUsername}
                              firstName={response.friendFirstName}
                              lastName={response.friendLastName}
                              fsUserId={response.friendFsUserId}
                    />
                ))
            )}
        </div>
    );
};

export default RelationshipList;
