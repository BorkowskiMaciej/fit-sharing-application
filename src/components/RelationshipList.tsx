import React, { useEffect, useState } from 'react';
import axiosInstance from '../configuration/axiosConfig';
import { useParams } from 'react-router-dom';
import { RelationshipResponse } from '../types';
import UserCard from "./user/UserCard";

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

        const interval = setInterval(() => {
            fetchAcceptedRelationships()
            fetchSentRelationships()
            fetchReceivedRelationships();
        }, 3000);

        return () => {clearInterval(interval)};
    }, [query]);

    return (
        <div className="user-list-container">
            {receivedRelationships.length === 0 && sentRelationships.length === 0 && acceptedRelationships.length === 0 ? (
                <p>No relationships found. Send new invitations!</p>
            ) : (
                <div>
                    {receivedRelationships.length === 0 ? (
                        <p></p>
                    ) : (
                        <div>
                            <h3>Received invitations</h3>
                            {receivedRelationships.map(response => (
                                <UserCard key={response.friendUsername}
                                          username={response.friendUsername}
                                          firstName={response.friendFirstName}
                                          lastName={response.friendLastName}
                                          fsUserId={response.friendFsUserId}
                                          profilePicture={response.profilePicture}
                                />
                            ))}
                        </div>

                    )}
                    {sentRelationships.length === 0 ? (
                        <p></p>
                    ) : (<div>
                            <h3>Sent invitations</h3>
                            {sentRelationships.map(response => (
                                <UserCard key={response.friendUsername}
                                          username={response.friendUsername}
                                          firstName={response.friendFirstName}
                                          lastName={response.friendLastName}
                                          fsUserId={response.friendFsUserId}
                                          profilePicture={response.profilePicture}
                                />
                            ))}
                        </div>

                    )}
                    {acceptedRelationships.length === 0 ? (
                        <p></p>
                    ) : (
                        <div>
                            <h3>Friends</h3>
                            {acceptedRelationships.map(response => (
                                <UserCard key={response.friendUsername}
                                          username={response.friendUsername}
                                          firstName={response.friendFirstName}
                                          lastName={response.friendLastName}
                                          fsUserId={response.friendFsUserId}
                                          profilePicture={response.profilePicture}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RelationshipList;
