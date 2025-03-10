import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configuration/axiosConfig';
import { useParams } from 'react-router-dom';
import { RelationshipResponse } from '../../types';
import UserCard from "../user/UserCard";

const RelationshipList = () => {
    const { query } = useParams();
    const [acceptedRelationships, setAcceptedRelationships] = useState<RelationshipResponse[]>([]);
    const [sentRelationships, setSentRelationships] = useState<RelationshipResponse[]>([]);
    const [receivedRelationships, setReceivedRelationships] = useState<RelationshipResponse[]>([]);

    useEffect(() => {
        const fetchAcceptedRelationships = async () => {
            try {
                await axiosInstance
                    .get(`/relationships/accepted`)
                    .then(response => setAcceptedRelationships(response.data));
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        const fetchSentRelationships = async () => {
            try {
                await axiosInstance
                    .get(`/relationships/sent`)
                    .then(response => setSentRelationships(response.data));
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        const fetchReceivedRelationships = async () => {
            try {
                await axiosInstance
                    .get(`/relationships/received`)
                    .then(response => setReceivedRelationships(response.data));
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchAcceptedRelationships();
        fetchSentRelationships();
        fetchReceivedRelationships();

        // const interval = setInterval(() => {
        //     fetchAcceptedRelationships()
        //     fetchSentRelationships()
        //     fetchReceivedRelationships();
        // }, 3000);

        // return () => {clearInterval(interval)};
    }, [query]);

    return (
        <div className="main-component">
            <div className="list-container">
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
        </div>
    );
};

export default RelationshipList;
