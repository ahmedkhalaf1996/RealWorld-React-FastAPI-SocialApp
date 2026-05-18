import { GET_NOTIFICATIONS_FOR_USER, MARK_NOTIFICATIONS_AS_READED } from "../constants/actionTypes"

import * as api from "../../api/index"

const user = JSON.parse(localStorage.getItem("profile") || "{}");
const userId = user?.result?._id; 

export const getNotifyForUser = () => async (dispatch: any) => {
    try {
        const  {data}  = await api.GetNotificationForUser(userId);
        // console.log("action not", data)
        dispatch({ type: GET_NOTIFICATIONS_FOR_USER, payload: data });
    }   catch (error) {
        console.log(error);
    }
}    


export const MarkNotifyAsReaded = () => async (dispatch: any) => {
    try {
        await api.MarkNotificationAsReaded(userId);

        dispatch({ type: MARK_NOTIFICATIONS_AS_READED });
        }   catch (error) {
        console.log(error);
        }
    }