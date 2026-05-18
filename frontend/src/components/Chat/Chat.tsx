import UserList from "./UserList";
import Conversation from "./Conversation";
import {Menu as MenuIcon} from '@mui/icons-material'
import websocketService from '../../ws/RealTimeWs';
import * as api from '../../api/index';
import { Box, Drawer, IconButton, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Store/reducers";
import { ClearUnreadedMsgBetweenUs, GetChatUserListdata, GetMsgBetweenTwoUsers, 
    SendNewMessage, UpdateMessagesBetweenTwoUs, UpdateOnlineList } from "../../Store/actions/chat";

const Chat:React.FC =()=> {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const dispatch = useDispatch<any>();
    const {chatListUsers, MessasgesBwtweenTowUsers} = useSelector((state: RootState)=> state.chat);
    const {authData} = useSelector((state: RootState)=> state.auth);

    const selectedUserRef = useRef<any>(null);
    const onlineUsersRef = useRef<string[]>([]);

    useEffect(()=> {
        selectedUserRef.current = selectedUser;
    }, [selectedUser])

    
   useEffect(()=> {
        onlineUsersRef.current = onlineUsers;
    }, [onlineUsers])

    // ws handler 
    const handleWsMessage = useCallback((event: MessageEvent)=> {
        try {
            const message = JSON.parse(event.data);
            if(message.onlineFriends !== undefined){
                const uniqueUsers = Array.from(new Set(message.onlineFriends)) as string[];
                setOnlineUsers(uniqueUsers);
                dispatch(UpdateOnlineList(uniqueUsers));
            } else if (message.content){
                dispatch(GetChatUserListdata());
                dispatch(UpdateMessagesBetweenTwoUs(message));
            }
        } catch (e) {
            console.error("ws message parse error", e);
        }
    }, [dispatch]);
    
    // registre as a persistant ws listener ; clean up when unmounting 
    useEffect(()=>{
        dispatch(GetChatUserListdata());

        // register listerner 
        const unsub = websocketService.addMessagelistener(handleWsMessage);

        // request fresh online status 
        const ws = websocketService.getConnection();
        if(ws){
            const sendPing = ()=> websocketService.sendJson({ type:'requestOnline' });
            if(ws.readyState === WebSocket.OPEN){
                sendPing()
            } else {
                ws.addEventListener('open', sendPing, { once: true})
            }
        }

        return () => {unsub();};

    }, [dispatch, handleWsMessage])

    // auto seelct first user if non selected 
    useEffect(()=>{
        if(!selectedUser && chatListUsers?.length > 0) {
            handleUserClick(chatListUsers[0]._id)
        }
    }, [chatListUsers]);

    useEffect(()=> {
        setSelectedUser((prev: any)=> {
            if(!prev) return prev;
            return {...prev, online: onlineUsers.includes(prev._id)}
        })
    }, [onlineUsers]);

    const handleUserClick = async (userId: string) => {
        setSelectedUserId(userId);
        if (isMobile) setDrawerOpen(false);

        try {
            const {data} = await api.fetchUserProfile(userId);
            const userData = data.user;
            userData.online = onlineUsersRef.current.includes(userData._id);
            setSelectedUser(userData);

            const loggedInUserId = authData?.result?._id || JSON.parse(localStorage.getItem('profile') || '{}').result?._id;
            dispatch(ClearUnreadedMsgBetweenUs());
            dispatch(GetMsgBetweenTwoUsers(null, loggedInUserId, userId));
        } catch (error) {
            console.error('Error selcting user: ', error)
        }
    }

    const handleSendMessage = async (content: string) => {
        const loggedInUserId = authData?.result?._id || JSON.parse(localStorage.getItem('profile') || '{}').result?._id;
        if(!loggedInUserId || !selectedUserId) return;

        const message = {content, sender: loggedInUserId, recever: selectedUserId };

        if(selectedUserRef.current?.online){
            const ws = websocketService.getConnection();
            if(ws && ws.readyState === WebSocket.OPEN){
                ws.send(JSON.stringify(message));
                dispatch(UpdateMessagesBetweenTwoUs(message));
                return;
            }
        }
        dispatch(SendNewMessage(content, loggedInUserId, selectedUserId));
    }
return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', mt:1, gap: 1}}>
        {isMobile && !drawerOpen && (
            <IconButton onClick={()=> setDrawerOpen(true)}
             sx={{
                position: 'fixed', bottom: 80, left: 16, zIndex: 1200, bgcolor: 'primary.main',
                color: 'white', "&:hover": {bgcolor: 'primary.dark'}
             }}
             >

                <MenuIcon />
             </IconButton>
        )}

        {/* desktop user list  */}
        {!isMobile && (
            <Paper elevation={1} sx={{ width: 300, borderRadius: 2, overflow: 'hidden' }}>
                <UserList userList={chatListUsers}
                 selectedUserId={selectedUserId}
                 handleUserClick={handleUserClick}
                 />
            </Paper>
        )}
        {/* monile user list drawer  */}
        <Drawer open={drawerOpen} onClose={()=> setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': {width: 200} }}>
                <UserList userList={chatListUsers}
                 selectedUserId={selectedUserId}
                 handleUserClick={handleUserClick}
                 />
        </Drawer>
        {/* Conversation Area  */}
        <Paper elevation={1} sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection:'column' }}>
            <Conversation 
              selectedUser={selectedUser}
              conversation={MessasgesBwtweenTowUsers}
              authData={authData?.result}
              handleSendMessage={handleSendMessage}
              />
        </Paper>
    </Box>
)
}



export default Chat;
