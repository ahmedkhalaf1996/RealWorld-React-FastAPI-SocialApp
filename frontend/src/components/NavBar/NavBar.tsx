


import {jwtDecode} from 'jwt-decode';
import * as actionType from '../../Store/constants/actionTypes';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Badge, Box, IconButton, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { RootState } from '../../Store/reducers';
import { GetUnReadedMessage, UpdateOnlineList } from '../../Store/actions/chat';
import { getNotifyForUser } from '../../Store/actions/notifications';
import WebSocketServiceNotyfy from '../../ws/notifyWs.js'
import WebSocketService from '../../ws/RealTimeWs';
import { Icons, Search, SearchIconWrapper, StyledInputBase } from '../MainStyles';
import { Chat, Notifications } from '@mui/icons-material';


const NavBar: React.FC<{ id?: string}> = ({id})=> {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const location = useLocation();

 const theme = useTheme();


 const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

 const authData = useSelector((state: RootState)=> state.auth.authData);
 const { UnReadedNotificationNumbers } = useSelector((state: RootState) => state.notification)
 const { unReadedMessage } = useSelector((state: RootState) => state.chat)

 const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
 const [search, setSearch] = useState('');
 const [user, setUser] = useState<any>(authData || JSON.parse(localStorage.getItem('profile') || 'null'));
 const open = Boolean(anchorEl);

 useEffect(()=>{
    if(authData){
        setUser(authData);
    } else {
        setUser(JSON.parse(localStorage.getItem('profile') || 'null'))
    }
 }, [authData]);


 useEffect(()=>{
    const token = user?.token;
    if(token){
        const decodedToken: any = jwtDecode(token); 
        if(decodedToken.exp * 1000 < new Date().getTime()){
            logout();
            return;
        } 
        
        // initilize realtime connctions 
        // todo 
        initializeRealTime();
    }

    // Refresh Counts 
    if(user?.result?._id){
        dispatch(GetUnReadedMessage() as any);
        dispatch(getNotifyForUser() as any);
    }
 }, [location, user?.result?._id]);

 const initializeRealTime = ()=> {
    if (!user?.result?._id) return;

    // notify ws 
    const notifyWs = WebSocketServiceNotyfy.getConnection();
    if(notifyWs){
        notifyWs.onmessage = () => {
            dispatch(getNotifyForUser() as any);
        }
    }

    const chatHandler = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            if(message.onlineFriends !== undefined) {
                const uniqueUsers = Array.from(new Set(message.onlineFriends));
                dispatch(UpdateOnlineList(uniqueUsers) as any);

            } else if (message.content){
                dispatch(GetUnReadedMessage() as any);
            }
        } catch (_) {}
    };

    (initializeRealTime as any)._chatHandler && WebSocketService.removeMessageListener((initializeRealTime as any)._chatHandler);
    (initializeRealTime as any)._chatHandler = chatHandler;

    WebSocketService.addMessagelistener(chatHandler);

 }

 const logout = () => {
    dispatch({  type: actionType.LOGOUT });
    navigate('/Auth');
    setUser(null);
    setAnchorEl(null);
    WebSocketService.closeConnection();
    WebSocketServiceNotyfy.closeConnection();
 }

 const hanldeClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
 const handleClose = () => setAnchorEl(null);

 const handleKeySearch = (e: React.KeyboardEvent) =>{
    if(e.key === 'Enter' && search.trim()){
        navigate(`/Search?searchQuery=${search}`);
    }
 };

 return (
    <AppBar position='sticky'>
        <Toolbar>
            <Stack direction="row" spacing={2} sx={{ justifyContent:'space-between', alignItems:'center', width:'100%' }}>
            <Typography variant='h6' onClick={()=> navigate('/', {replace: true})}
                sx={{display: {xs: 'none', sm:'block'}, cursor:'pointer', fontWeight:'bold'}}>
                    SOCIAL 
            </Typography>
            <Search sx={{ flex: 1, maxWidth: {xs:'100%', sm:400}}}>
                <SearchIconWrapper sx={{cursor:'pointer'}}>
                  <SearchIcon />
                </SearchIconWrapper>
             <StyledInputBase
             placeholder='Search...'
             value={search}
             onChange={(e)=> setSearch(e.target.value)}
             onKeyDown={handleKeySearch}
             />
            </Search>
            {user?.result && (
                <Icons sx={{display: 'flex', gap: {xs: 1, sm: 2}, alignItems:'center'}}>
                    <IconButton color='inherit' onClick={()=> navigate('/Chat')} size={isMobile ? 'small': 'medium'}>
                        <Badge badgeContent={unReadedMessage} color='error'>
                            <Chat fontSize={isMobile ? 'small': 'medium'} />
                        </Badge>
                    </IconButton>
                    <IconButton color='inherit' onClick={()=> navigate('/Notification')} size={isMobile ? 'small': 'medium'}>
                        <Badge badgeContent={UnReadedNotificationNumbers} color='error'>
                            <Notifications fontSize={isMobile ? 'small': 'medium'} />
                        </Badge>
                    </IconButton>
                    <Avatar 
                     alt={user.result.name}
                     src={user.result.imageUrl || 'https://cdn:pixabay.com/photo/2015/10/05/22/37/blank-picture-973460__340.png'}
                     onClick={hanldeClick}
                     sx={{ width: {xs:30, sm:40}, height: {xs:30, sm: 40}, cursor:'pointer'}} 
                     />
                </Icons>
            )}

            {user?.result && (
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={()=> {handleClose(); navigate(`/Profile/${user.result._id}`)}}>
                     Profile
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                </Menu>
            )}
            </Stack>
        </Toolbar>
    </AppBar>
 )
}

export default NavBar;