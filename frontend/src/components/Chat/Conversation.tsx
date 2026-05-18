
import {Send as SendIcon } from '@mui/icons-material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store/reducers';
import { GetMsgBetweenTwoUsers, MarkMSGAsreaded } from '../../Store/actions/chat';
import { Avatar, Box, CircularProgress, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';

interface ConversationProps {
    selectedUser: any;
    conversation: any[];
    authData: any;
    handleSendMessage: (content: string) => void;
}

const Conversation: React.FC<ConversationProps> = ({
    selectedUser, conversation, authData: propAuthData, handleSendMessage
}) => {
 const [messageText, setMessageText] = useState('');
 const [isFetchingOlder, setIsFetchingOlder] = useState(false);

 const containerRef = useRef<HTMLDivElement>(null)
 const savedScrollHeightRef = useRef<number>(0);
 const lastFetchedIdRef = useRef<string | null>(null);
 const cooldownRef = useRef<Boolean>(false);
 const isInitialLoad = useRef(true);

 const [fromStart, setFrom] = useState(0);
 const dispatch = useDispatch<any>();
 const { hasMoreMessages } = useSelector((state: RootState) => state.chat)
 const reduxAuth = useSelector((state: RootState) => state.auth.authData)

 const currentUser = useMemo(()=> {
   const localProfile = JSON.parse(localStorage.getItem('profile')|| '{}');
   return propAuthData || reduxAuth?.result || localProfile.result;
 }, [propAuthData, reduxAuth]);

 const loggedInUserId = useMemo(()=> currentUser?._id, [currentUser?._id]);

 const getAvatarUrl = useCallback((userObj: any)=> {
    if(!userObj) return '';
    const img = userObj.avatar || userObj.imageUrl || userObj.selectedFile;
    if(img && typeof img === 'string'){
        const trimmed = img.trim();
        if (trimmed.length > 20) return trimmed;
    }
    return '';
 }, [])

 const getInitials = (name: string) => {
    if(!name || typeof name !== 'string') return '?';
    return name.split(' ').filter(p=> p).map(n => n[0]).join('').toUpperCase().substring(0, 2);
 }

 const senderInitals = useMemo(()=> getInitials(currentUser?.name || 'Me'), [currentUser?.name]);
 const receiverInitials = useMemo(()=> getInitials(selectedUser?.name || 'User'), [selectedUser?.name]);

 /// reset sesstion when switching users 
 useEffect(()=> {
    if(selectedUser?._id && loggedInUserId){
        isInitialLoad.current = true;
        savedScrollHeightRef.current =0;
        setIsFetchingOlder(false);
        lastFetchedIdRef.current = null;
        cooldownRef.current = false;

        dispatch(MarkMSGAsreaded(loggedInUserId, selectedUser._id));

        if(conversation.length === 0){
            dispatch(GetMsgBetweenTwoUsers(fromStart, loggedInUserId, selectedUser._id));
        }
    }
 }, [selectedUser?._id, loggedInUserId, dispatch]);

 // scroll management & anchoring 
 useEffect(()=> {
    const container = containerRef.current;
    if(!container) return;

    if(isInitialLoad.current && conversation.length > 0){
        container.scrollTop = container.scrollHeight;
        isInitialLoad.current = false;
    } else if (isFetchingOlder){
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - savedScrollHeightRef.current;
        if(scrollDiff > 0){
            container.scrollTop = scrollDiff;
            savedScrollHeightRef.current = 0;
            setTimeout(() => {
                setIsFetchingOlder(false);
                cooldownRef.current = false;
            }, 1200);
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }
 }, [conversation]);

 const handleScroll = () => {
    const container = containerRef.current;
    if(!container || isFetchingOlder || !hasMoreMessages || conversation.length === 0 || cooldownRef.current || isInitialLoad.current) return;

    if(container.scrollTop <= 5){
        const oldestId = conversation[0]?._id;
        if(!oldestId || oldestId === lastFetchedIdRef.current) return;

        savedScrollHeightRef.current = container.scrollHeight;
        setIsFetchingOlder(true);
        cooldownRef.current = true;
        lastFetchedIdRef.current = oldestId;

        // console.log('call get msg btween 2 users called')
        // console.log('oldestId',oldestId, 'loggedInUserId',loggedInUserId, 'selectedUser._id', selectedUser._id)

        dispatch(GetMsgBetweenTwoUsers(fromStart+1, loggedInUserId, selectedUser._id));
        setFrom(fromStart+1)

    }
 }

//  const formatTime = (iso: string) => {
//     return moment(iso || undefined).format('h:mm A')
//  }

 const handleSendClick = ()=> {
    if(messageText.trim()){
        handleSendMessage(messageText.trim());
        setMessageText('');
    }
 }

 if(!selectedUser) {
    return (
        <Box sx={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Typography variant='h6' color='text.secondary'>Select A Contact To Chat</Typography>
        </Box>
    );
 }


 return (
    <Box sx={{
        flex:1, display:'flex', flexDirection:'column', height: '100%', overflow:'hidden',
        borderLeft:'1px solid', borderColor:'divider'
    }}>
         {/* header  */}
         <Box sx={{ p: 2, borderBottom: '1px solid', borderColor:'divider', display:'flex', alignItems:'center',
            gap:2,
            bgcolor:'background.paper', flexShrink:0, zIndex:10
         }}>
           <Avatar alt={selectedUser.name} src={getAvatarUrl(selectedUser)}>
             {receiverInitials}
            </Avatar> 
            <Box>
                <Typography variant='subtitle1' sx={{  fontWeight:'bold'}}>{selectedUser.name}</Typography>
                <Typography variant='caption' color={selectedUser.online ? 'success.main': 'text.secondary'}>
                    {selectedUser.online ? 'Online': 'Offline'}
                </Typography>
            </Box>
         </Box>
         {/* Messages area with subtile pattern */}
         <Box 
          ref={containerRef}
          onScroll={handleScroll}
          sx={{
            flex:1, overflowY: 'auto', p:2,
            bgcolor:'#f5f7fb',
            backgroundImage: 'redial-gradient(#d1d9e6 0.px, transparent 0.5px)',
            backgroundSize: '20px 20px',
            display: 'flex', flexDirection: 'column', gap:1
          }}
          >
            {hasMoreMessages && <Box sx={{ height: '100px', flexShrink: 0}} />}

            {isFetchingOlder && (
                <Box sx={{ display:'flex', justifyContent:'center', py:1}}>
                    <CircularProgress size={24} thickness={5} />
                </Box>
            )}

            {!hasMoreMessages && conversation.length > 0 && (
                <Typography variant='caption' color='text.disabled' align='center' sx={{ py: 2, fontWeight: 500}}>
                    BEGEINING OF HISOTRY
                </Typography>
            )}

            {conversation.map((message, index) => {
                const isSender = message.sender === loggedInUserId;
                const avatarUrl = isSender ? getAvatarUrl(currentUser) : getAvatarUrl(selectedUser);

                return (
                    <Box key={message._id || `msg-${index}`}
                     sx={{
                        display:'flex',
                        justifyContent:isSender ? 'flex-end': 'flex-start',
                        mb: 1.5,
                        animation: 'fadeIn 0.3s ease'
                     }}>
                        <Stack direction='row' spacing={1} sx={{  alignItems:'flex-end', maxWidth:'85%'}}>
                            {!isSender && (
                                <Avatar alt={selectedUser.name} src={avatarUrl} sx={{ width: 28, height: 28, mb: 0.5}}>
                                    {receiverInitials}
                                </Avatar>
                            )}
                            <Box sx={{ display: 'flex', flexDirection:'column', alignItems: isSender ? 'flex-end' : 'flex-start'}}>

                            <Paper elevation={0}
                            sx={{
                                p:'10px 16px', 
                                borderRadius: '18px',
                                bgcolor: isSender ? '#0084ff' : '#e4e6eb',
                                color: isSender ? '#fff': '#050505',
                                borderBottomRightRadius: isSender ? '4px' : '18px',
                                borderBottomLeftRadius: !isSender ? '4px' : '18px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}>
                                <Typography variant='body1' sx={{ wordBreak: 'break-word', fontSize:'0.95rem'}}>
                                    {message.content}
                                </Typography>
                            </Paper>
                          </Box>

                            {isSender && (
                            <Avatar alt='Me' src={avatarUrl} sx={{ width: 38, height: 28, mb: 0.5}}>
                                    {senderInitals}
                                </Avatar> 
                            )}
                        </Stack>
                    </Box>
                );
            })}
          </Box>
          {/* input  */}
        <Box sx={{p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink:0 }}>
            <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center'}}>
                <TextField fullWidth size='small' placeholder='Aa' value={messageText}
                   onChange={(e)=> setMessageText(e.target.value)} 
                   onKeyDown={(e)=> {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSendClick();}}}
                   multiline maxRows={4}
                   sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius:'20px',
                        bgcolor: '#f0f2f5',
                        '& fieldset': {border: 'none'},
                        px: 2
                    }
                   }}
                   />
                   <IconButton onClick={handleSendClick}
                   disabled={!messageText.trim()}
                   sx={{
                    color:'#0084ff',

                    '&.Mui-disabled': {color: '#bcc0c4'}
                   }}
                   >
                    <SendIcon />
                   </IconButton>
            </Stack>
        </Box>
         <style>
            {`
             @keyframes fadeIn {
                from {opacity: 0, transform: translateY(10px);}
                to {opacity: 1, transform: translateY(0);}
                
             }
            `}
         </style>
    </Box>
 )

}

export default Conversation;
