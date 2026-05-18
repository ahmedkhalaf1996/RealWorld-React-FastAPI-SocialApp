import { END_LOADING, GET_NOTIFICATIONS_FOR_USER, MARK_NOTIFICATIONS_AS_READED, START_LOADING, UPDATE_RECEVE_NOTIFICATIONS } from '../constants/actionTypes';
 

interface NotificationState {
    UnReadedNotificationNumbers: number;
    NotificationListData: any[];
    isLoading: boolean;
}

const initialState: NotificationState = {
    UnReadedNotificationNumbers: 0,
    NotificationListData: [],
    isLoading: false,
};

const notificationsReducer = (state = initialState, action: any): NotificationState => {
    switch (action.type) {
        case START_LOADING: 
         return {
            ...state,
            isLoading: true,
         }
        case END_LOADING:
         return {
            ...state,
            isLoading: false,
         }
        case GET_NOTIFICATIONS_FOR_USER:
            let unReadedNotify = 0;
            // console.log("not", action.payload)
            const notifications = action.payload.notifications || [];

            notifications.forEach((element: any) => {
                if (!element.isreded) {
                    unReadedNotify++;
                }
            });

            return {
                ...state,
                UnReadedNotificationNumbers: unReadedNotify,
                NotificationListData: [...notifications],
                isLoading: false,
            };
        case UPDATE_RECEVE_NOTIFICATIONS:
            return {
                ...state,
                UnReadedNotificationNumbers: state.UnReadedNotificationNumbers + 1,
                NotificationListData: [action.payload, ...state.NotificationListData],
            };
        case MARK_NOTIFICATIONS_AS_READED:
            return {
                ...state,
                UnReadedNotificationNumbers: 0
            };
        default:
            return state;
    }
};

export default notificationsReducer;