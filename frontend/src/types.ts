// @ts-nocheck
export interface User {
    _id: string;
    name: string;
    email: string;
    imageUrl?: string;
    bio?: string;
    followers?: string[];
    following?: string[];
    online?: boolean;
}

export interface Comment {
    _id: string;
    postId: string;
    userId: string;
    value: string;
    createdAt: string;
    user?: Partial<User>;
}

export interface Post {
    _id: string;
    title: string;
    message: string;
    creator: string;
    selectedFile?: string;
    likes: string[];
    comments?: Comment[];
    createdAt: string;
    user?: Partial<User>;
    name?:string;
    CreatorImg?: string;
}

export interface AuthData {
    result: User;
    token: string;
}