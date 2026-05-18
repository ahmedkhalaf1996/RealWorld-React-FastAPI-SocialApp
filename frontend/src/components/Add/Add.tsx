
import {Add as AddIcon, Close as CloseIcon} from '@mui/icons-material'
import {StyledModal, UserBox} from '../MainStyles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../Store/reducers';
import { createPost } from '../../Store/actions/posts';
import { Fab, Tooltip , Box, IconButton, Typography, Avatar, Stack, TextField, Button, CircularProgress} from '@mui/material';

const Add: React.FC = ()=> {
 const [postData, setPostData] = useState({ title:'', message:'', selectedFile: '' });
 const [submitting, setSubmitting] = useState(false);
 const dispatch = useDispatch<any>();
 const navigate = useNavigate();

 const authData = useSelector((state: RootState) => state.auth.authData);
 const user = authData || JSON.parse(localStorage.getItem('profile') || 'null');

 const [open, setOpen] = useState(false);

 const clear = () => {
    setPostData({title:'', message:'', selectedFile: '' })
 }

 const handleCreatePost = async ()=>{
    if(!postData.title || !postData.message) return;
    setSubmitting(true);
    try {
        await dispatch(createPost({...postData}))
        clear()
        setOpen(false)
        navigate('/')
    } catch (error) {
        console.error("error creating post", error)
    } finally {
        setSubmitting(false)
    }
 }

//  useEffect(()=>{
//   console.log('user', user)
//  },[user])
 if (!user?.result?.name) return null

 return (
    <>
     <Tooltip onClick={()=> setOpen(true)}
       title="Create Post"
       sx={{
        position: 'fixed',
        bottom: 20,
        right: {xs: 20, md: 30}
       }}
       >
        <Fab color='primary' aria-label='add'>
            <AddIcon />
        </Fab>
       </Tooltip>
       <StyledModal open={open} onClose={()=> !submitting && setOpen(false)}
       aria-labelledby='craete-post-modal'>
        <Box sx={{
            width: {xs: '90%', sm: 450},
            bgcolor: 'background.default',
            color:'text.primary',
            p: 3,
            borderRadius: 3,
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
        }}>
          <IconButton onClick={()=> setOpen(false)} sx={{position: 'absolute', right:8, top:8}}
          disabled={submitting}>
            <CloseIcon />
          </IconButton>
          <Typography variant='h6' color='text.secodary' sx={{textAlign:'center', mb:2}}>
            Create New Post
          </Typography>
          <UserBox sx={{mb: 2}}>
            <Avatar src={user?.result?.imageUrl} sx={{width: 40, height: 40}} />
            <Typography variant='body1'>
                {user?.result?.name}
            </Typography>
          </UserBox>
          <Stack spacing={2}>
            <TextField 
              fullWidth
              label="Title"
              variant='outlined'
              size='small'
              value={postData.title}
              onChange={(e)=> setPostData({...postData, title: e.target.value})}
              />
            <TextField 
              fullWidth
              multiline
              rows={4}
              label="What's on your mind!"
              variant='outlined'
              value={postData.message}
              onChange={(e)=> setPostData({...postData, message: e.target.value})}
              />     

              <Box>
               <Typography variant='caption' color='text.secondary'>Add an Image</Typography>
               <Box  sx={{border:'1px dashed #ccc', p: 1, borderRadius: 1, mt:1}}>
                   <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                            setPostData({ ...postData, selectedFile: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                        }}
                        />
               </Box>  
              </Box>    
              {postData.selectedFile && (
                <Box sx={{ width : '100%', height: 150, overflow: 'hidden', borderRadius: 1}}>
                    <img src={postData.selectedFile} alt='preview' style={{ width:'100%', height:'100%' , objectFit: 'cover' }} />
                </Box>
              )}   

              <Button
               variant='contained'
               fullWidth
               disabled={submitting || !postData.title || !postData.message}
               onClick={handleCreatePost}
               startIcon={submitting && <CircularProgress size={20} color='inherit' />}
               >
                {submitting ? 'Posting..': 'Post'}
                </Button>  
          </Stack>
        </Box>
       </StyledModal>

    </>
 )
}
export default Add;