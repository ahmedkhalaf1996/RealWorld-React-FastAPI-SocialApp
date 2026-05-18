import {AUTH,GET_USER_DATA, AUTH_ERROR} from '../constants/actionTypes';
import * as api from '../../api/index';

export const getUserData = ()=> async (dispatch: any) => {
    try {
        var user = JSON.parse(localStorage.getItem('profile') || '{}');
        const userId = String(user?.result?._id);
        if(userId){
            const { data } = await api.fetchUserProfile(userId);
            dispatch({ type: GET_USER_DATA, payload: data.user });
        }
    } catch (error) {
        console.log(error);
    }
}

export const signin = (formData: any, navigate: any) => async (dispatch: any) => {
    try {
        const { data } = await api.signIn(formData);
        dispatch({ type: AUTH, data });
        navigate('/');
    }   catch (error: any) { 
        const message = error.response?.data?.message || 'An error occurred during sign in.';
        dispatch({ type: AUTH_ERROR, payload: message });
        console.log(error);
       }
}

export const signup = (formData: any, navigate: any) => async (dispatch: any) => {
    try {
        const { data } = await api.signUp(formData);
        dispatch({ type: AUTH, data });
        navigate('/');
    }
    catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred during sign up.';
        dispatch({ type: AUTH_ERROR, payload: message });
        console.log(error);
    }
}

export const logout = () => (dispatch: any) => {
    dispatch({ type: 'LOGOUT' });
}