import { AUTH, AUTH_ERROR, GET_USER_DATA, LOGOUT } from '../constants/actionTypes';
import { AuthData } from './../../types';

interface AuthState {
    authData: AuthData | null;
    loading?: boolean;
    errors?: any;
}

const getInitialState = (): AuthState => {
    const profile = localStorage.getItem('profile');
    return {
        authData: profile ? JSON.parse(profile) : null,
        loading: false,
        errors: null,
     }
}


const authReducer = (state: AuthState = getInitialState(), action: any): AuthState => {
    switch (action.type) {
        case AUTH: 
            localStorage.setItem('profile', JSON.stringify({ ...action?.data })); 
            return { ...state, authData: action?.data, loading: false, errors: null };
        case AUTH_ERROR:
            return { ...state, errors: action.payload, loading: false };
        case LOGOUT:
            localStorage.removeItem('profile');
            return { ...state, authData: null, loading: false, errors: null };
        case GET_USER_DATA:
            const profile = JSON.parse(localStorage.getItem('profile') || '{}'); 
            if (profile.token){
                localStorage.setItem('profile', JSON.stringify({ ...profile, result: action.payload }));
            }
            return { ...state, authData: { ...state.authData, result: action.payload } as AuthData };
        default:
            return state;
    }

};

export default authReducer;