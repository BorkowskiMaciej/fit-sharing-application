export interface User {
    fsUserId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    description: string;
}

export interface RelationshipResponse {
    relationshipId: string;
    friendFsUserId: string;
    friendUsername: string;
    friendFirstName: string;
    friendLastName: string;
    status: string;
}

export interface News {
    id: string;
    publisherFsUserId: string;
    publisherUsername: string;
    receiverFsUserId: string;
    receiverUsername: string;
    data: string;
    createdAt: string;
}

export interface CreateNewsRequest {
    receiverFsUserId: string;
    data: string;
}

export interface UserToken {
    fsUserId: string;
    token: string;
    expiresIn: number;
}

export enum SportCategory {
    RUNNING = "RUNNING",
    CYCLING = "CYCLING",
    WALKING = "WALKING",
    TENNIS = "TENNIS",
    SWIMMING = "SWIMMING"
}
