import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {Post, User, AuthData} from '../types';

export const createAPI = (): AxiosInstance => {
    const newAPI = axios.create({ baseURL: process.env.REACT_APP_APIURL });

    newAPI.interceptors.request.use((req)=>{
        const profile = localStorage.getItem('profile');
        if(profile && req.headers) {
            req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`;
        }
        return req;
    });
    return newAPI;
}

// Posts 

export const fetchPost = (id: string): Promise<AxiosResponse <{post: Post}>> => {
    const api = createAPI();
    return api.get(`posts/${id}`);
}

export const fetchPosts = (page: number, id: string | null, profileId: string | null = null): Promise<AxiosResponse<{data: Post[], currentPage: number, numberOfPages: number}>> => {
    const api = createAPI();
    let url = `posts?page=${page}`;
    if (id) url += `&id=${id}`;
    if (profileId) url += `&profileId=${profileId}`;
    return api.get(url);
}

export const createPost = (newPost: Partial<Post>): Promise<AxiosResponse<Post>> => {
    const api = createAPI();
    return api.post('posts', newPost);
}

export const LikePost = (id: string): Promise<AxiosResponse <Post>> => {
    const api = createAPI();
    return api.patch(`posts/${id}/likePost`);
}

export const comment = (value: string, id: string): Promise<AxiosResponse<{ post: Post }>> => {
    const api = createAPI();
    return api.post(`posts/${id}/commentPost`, {value})
}

export const updatePost = (id: string, updatedPost: Partial<Post>): Promise<AxiosResponse<{ data: Post }>> => {
    const api = createAPI();
    return api.patch(`posts/${id}`, updatedPost)
}

export const deletePost = (id: string): Promise<AxiosResponse<{message: string}>> => {
    const api = createAPI();
    return api.delete(`posts/${id}`)
}

export const fetchPostsUsersBySearch = (searchQuery: {searchData: string}): Promise<AxiosResponse<{data: {user: User[], posts: Post[]}}>> => {
    const api = createAPI();
    return api.get(`posts/search?searchQuery=${searchQuery.searchData}`);
}

// User
export const signIn = (formData: any): Promise<AxiosResponse<AuthData>> => {
    const api = createAPI();
    return api.post('user/signin', formData);
}

export const signUp = (formData: any): Promise<AxiosResponse<AuthData>> => {
    const api = createAPI();
    return api.post('user/signup', formData);
}

export const fetchUserProfile = (id: string): Promise<AxiosResponse<{user: User, posts: Post[], postsCount?: number }>> => {
    const api = createAPI();
    return api.get(`user/getUser/${id}`);
}

export const getSugUser = (id: string): Promise<AxiosResponse<{users: User[]}>> => {
    const api = createAPI();
    return api.get(`user/getSug?id=${id}`);
}

export const UpdateUser = (userData: User): Promise<AxiosResponse<{user: User, posts: Post[]}>> => {
    const api = createAPI();
    return api.patch(`user/Update/${userData._id}`, userData);
}

export const following = (id: string): Promise<AxiosResponse<User>> => {    
    const api = createAPI();
    return api.patch(`user/${id}/following`);
}

// Chat
export const SendMessage = (msg: {content: string, sender: string, recever: string}): Promise<AxiosResponse<any>> => {
    const api = createAPI();
    return api.post('chat/sendmessage', msg);
}   

export const GetUnreadedMsgNum = (id: string): Promise<AxiosResponse<{total: number, messages: any[]}>> => {
    const api = createAPI();
    return api.get(`chat/get-user-unreadedmsg?userid=${id}`);
}

export const  GetMsgsBwtweenTwoUserByNum = (beforeId: string | null, firstuid: string, seconduid: string): Promise<AxiosResponse<{msgs: any[], hasMore: boolean}>> => {
    const api = createAPI();
    return api.get(`chat/getmsgsbynums?from=${beforeId || ''}&firstuid=${firstuid}&seconduid=${seconduid}`);
}

export const markMsgAsReaded = (mainuid: string, otheruid: string): Promise<AxiosResponse<any>> => {
    const api = createAPI();
    return api.get(`chat/mark-msg-asreaded?mainuid=${mainuid}&otheruid=${otheruid}`);
}

// Notification
export const GetNotificationForUser = (id: string): Promise<AxiosResponse<{notifications: any[]}>> => { 
    const api = createAPI();
    return api.get(`notification/${id}`);
}

export const MarkNotificationAsReaded = (id: string): Promise<AxiosResponse<any>> => {
    const api = createAPI();
    return api.get(`notification/mark-notification-asreaded?id=${id}`);
}