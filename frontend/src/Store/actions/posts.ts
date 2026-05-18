import { END_LOADING, FETCH_ALL, FETCH_BY_SEARCH, FETCH_MORE, FETCH_POST, LIKE, START_LOADING, COMMENT, CREATE, UPDATE, DELETE } from "../constants/actionTypes";
import * as api from "../../api/index";

import { Dispatch } from "redux";
import { Post } from "../../types";

export const getPost = (id: string) => async (dispatch: Dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await api.fetchPost(id);
        dispatch({ type: FETCH_POST, payload: { post: data.post || data } });
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const getPosts = (page: number, id: string | null = null, profileId: string | null = null) => async (dispatch: Dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await api.fetchPosts(page, id, profileId);
        dispatch({ type: FETCH_ALL, payload: data });
        dispatch({ type: END_LOADING });
        return data;
    } catch (error) {
        console.log(error);
        dispatch({ type: END_LOADING });
    }
}

export const getPostsMore = (page: number, id: string | null = null, profileId: string | null = null) => async (dispatch: Dispatch) => {
 try {
    const { data } = await api.fetchPosts(page, id, profileId);
    dispatch({ type: FETCH_MORE, payload: data });
    return data;
 } catch (error) {
    console.error(error);
 }

}

export const getPostsUsersBySearch = (searchData: { searchData: string }) => async (dispatch: Dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await api.fetchPostsUsersBySearch(searchData);
        dispatch({ type: FETCH_BY_SEARCH, payload: data.data });
        dispatch({ type: END_LOADING });
    } catch (error) {
        console.log(error);
        dispatch({ type: END_LOADING });
    }   

}

export const createPost = (post: any, navigate?: (path: string) => void) => async (dispatch: Dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await api.createPost(post);
        dispatch({ type: CREATE, payload: data });
        if (navigate) navigate(`/posts/${data._id}`);
    } catch (error) {
        console.log(error);
        dispatch({ type: END_LOADING });
    }
}

export const updatePost = (id: string, post: any) => async (dispatch: Dispatch) => {
    try {
        const { data } = await api.updatePost(id, post);
        dispatch({ type: UPDATE, payload: data.data || data });
    } catch (error) {
        console.log(error);
    }
}

export const likePost = (id: string) => async (dispatch: Dispatch) => { 
    try {
        const {data} = await api.LikePost(id);
        dispatch({ type: LIKE, payload: data });
    } catch (error) {
        console.error(error);
    }
}

export const commentPost = (value: string, id: string) => async (dispatch: Dispatch) => {
    try {
        const { data } = await api.comment(value, id);
        const postData: Post = (data as any).post || data;

        dispatch({ type: COMMENT, payload: postData });
        return postData.comments;
    } catch (error) {
        console.error(error);
    }
}


export const deletePost = (id: string) => async (dispatch: Dispatch) => {
    try {
        await api.deletePost(id);   
        dispatch({ type: DELETE, payload: id });
    } catch (error) {
        console.error(error);
    }
}