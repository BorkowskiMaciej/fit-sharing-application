export interface User {
    fsUserId: string;
    username: string;
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

