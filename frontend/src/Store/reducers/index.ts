import { combineReducers } from 'redux';
import auth from './auth';
import posts from './posts';
import notification from './notifications';
import chat from './chat';

const rootReducer = combineReducers({
    posts,
    auth,
    notification,
    chat

});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
