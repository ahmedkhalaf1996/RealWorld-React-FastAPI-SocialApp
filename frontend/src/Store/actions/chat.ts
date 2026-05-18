// @ts-nocheck

import { 
    CLEAR_UN_READED_MSG,
    GET_UNREADED_MESSAGE,
    GET_MSG_BETWEEN_TWO_USERS_BY_NUM,
    GET_CHAT_LIST_USERS,
    UPDATE_ONLINE_USERS,
    SEND_MESSAGE,
    MARK_MSG_AS_READED
    } from "../constants/actionTypes"


import * as api from "../../api/index";
import { v4 as uuidv4 } from "uuid";

const getUserId = ()=> {
    const user = JSON.parse(localStorage.getItem("profile") || null);
    return user?.result?._id  || null;
}

export const SendNewMessage = (content, sender, recever) => async (dispatch: any) => {
    try {
        var Message = {"content": content, "sender": sender, "recever": recever};

        const data = await api.SendMessage(Message);

        Message = {"_id": uuidv4(), "content": content, "sender": sender, "recever": recever};

        dispatch({type: SEND_MESSAGE, payload: {data, Message}});
    } catch (error) {
        console.log(error)
    }

}

export const GetUnReadedMessage = () => async (dispatch: any) => {
    try {
        const userId = getUserId();
        if(!userId) return;

        const {data} = await api.GetUnreadedMsgNum(userId);
        dispatch({type: GET_UNREADED_MESSAGE, payload: data});
    } catch (error) {
        console.log(error)
    }
}

export const GetMsgBetweenTwoUsers = (beforeId, fuserid, suserid) => async (dispatch: any) => {
    try {  
                console.log("action store before", beforeId, )

        const { data } = await api.GetMsgsBwtweenTwoUserByNum(String(beforeId), fuserid, suserid);
        console.log('data form chat GetMsgBetweenTwoUsers', data)
        dispatch({type: GET_MSG_BETWEEN_TWO_USERS_BY_NUM, payload: data});
    } catch (error) {
        console.log(error)
    }

}

// GetChatUserListdata 
export const  GetChatUserListdata = () => async (dispatch: any) => {
 try {       
    const userId = getUserId();
    if(!userId) return;
    
    const {data} = await api.fetchUserProfile(userId);
    
    var UserList = []
    var FinalUserList = []
    
    var followers = data.user.followers;
    var following = data.user.following;
    
    var userListIDES = [...new Set([...followers, ...following])];

    const promises = userListIDES.map( async (id) => {
        const {data} = await api.fetchUserProfile(id);
        return data.user;
    })

    UserList = await Promise.all(promises); 

    const msg = await api.GetUnreadedMsgNum(userId);
    var msgs = msg.data.messages;

    for (let i = 0; i < UserList.length; i++) {
        const el = UserList[i];
        var FinalD = {
            "_id": el._id,
            "name": el.name,
            "imageUrl": el.imageUrl,
            "unreadMessages": 0
        }

        FinalUserList.push(FinalD);

    }

    FinalUserList.forEach(main => {
        msgs.forEach((x) => {
            if (x.otherUserid === main._id) {
                main.unreadMessages = x.numOfUnreadedMessages;
            }
        });
    });

    dispatch({type: GET_CHAT_LIST_USERS, payload: FinalUserList});

    } catch (error) {
        console.log(error)
    }
}
// MarkMSGAsreaded 
export  const MarkMSGAsreaded = (mainuid, otheruid) => async (dispatch: any) => {
    try {
        const {data} = await api.markMsgAsReaded(mainuid, otheruid);

        dispatch({type: MARK_MSG_AS_READED, payload: {data, mainuid, otheruid}});
    } catch (error) {
        console.log(error)
    }
}
// ClearUnreadedMsgBetweenUs 
export const ClearUnreadedMsgBetweenUs = () => async (dispatch) => {
    try {
        dispatch({ type: CLEAR_UN_READED_MSG })
    } catch (error) {
        console.log(error)
    }
}
// UpdateOnlineList 
export const UpdateOnlineList = (onlineUsers) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_ONLINE_USERS, payload: onlineUsers })
    } catch (error) {
        console.log(error)
    }
}
// UpdateMessagesBetweenTwoUs 

export const UpdateMessagesBetweenTwoUs = (message) => async (dispatch) => {
    try {
         const Message = {"_id": uuidv4(), "content": message.content, "sender": message.sender, "recever": message.recever};
         const IsRecevedMessage = true;

         dispatch({ type: SEND_MESSAGE, payload: { Message, IsRecevedMessage} })
        } catch (error) {
        console.log(error)
    }
}
