

import { useDispatch, useSelector } from "react-redux";
import Notification from "./Notification";
import { RootState } from "../../Store/reducers";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { getNotifyForUser, MarkNotifyAsReaded } from "../../Store/actions/notifications";
import WebSocketServiceNotfy from '../../ws/notifyWs';
import { Box, CircularProgress, Divider, List, Paper, Typography } from "@mui/material";
import React from "react";
const NotificationList: React.FC = ()=>{
 const {  NotificationListData, isLoading } = useSelector((state: RootState) => state.notification);
 const dispatch = useDispatch<any>();
 const navigate = useNavigate();

 const handleWsMessage = useCallback(()=>{
    dispatch(getNotifyForUser());
 }, [dispatch]);

 useEffect(()=>{
    dispatch(getNotifyForUser());

    const timer = setTimeout(() => {
        dispatch(MarkNotifyAsReaded())
    }, 2000);

    const ws = WebSocketServiceNotfy.getConnection();
    if(ws){
        ws.onmessage = handleWsMessage;
    }

    return ()=> clearTimeout(timer)
 }, [dispatch, handleWsMessage]);

 const handleNotificationClick = (targetid: string, deatils: string) => {
    if(deatils.includes("Following")){
        navigate(`/Profile/${targetid}`);
    } else {
        navigate(`/posts/${targetid}`)
    }
 }


 if (isLoading && NotificationListData.length === 0) {
    return (
        <Box sx={{display:'flex', justifyContent:'center', py:10}}>
            <CircularProgress />
        </Box>
    )
 }

 return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p:{xs: 1, md: 3}}}>
        <Paper elevation={0} sx={{p:2, borderRadius: 2, bgcolor: 'background.paper'}}>
            <Typography variant="h5" gutterBottom sx={{ px: 2, py: 1, fontWeight:'bold'}}>
                Notifications
            </Typography>
            <Divider />
            <List sx={{p: 0}}>
                {NotificationListData.length > 0 ? (
                    NotificationListData.map((notification, index)=> (
                        <React.Fragment key={notification._id}>
                            <Notification
                               notificationData={notification}
                               onClick={()=> handleNotificationClick(notification.targetid, notification.deatils)}
                               />
                               {index < NotificationListData.length -1 && <Divider component="li" />}
                        </React.Fragment>
                    ))
                ): (
                    <Box sx={{py: 10, textAlign: 'center'}}>
                        <Typography color="text.secondary" > You Havve no notifications yet.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    </Box>
 )
}

export default NotificationList;