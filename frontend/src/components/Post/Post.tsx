

import { useDispatch } from 'react-redux';
import {Post as PostType} from '../../types'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { commentPost, deletePost, likePost, updatePost } from '../../Store/actions/posts';
import { Favorite, MoreVert } from '@mui/icons-material';
import { Avatar,Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import moment from 'moment';
import Comments from '../Comments/Comments';
interface PostProps {
    post: PostType;
    compact?: boolean;
}

const Post = ({ post, compact =false}: PostProps) => {

 const user = JSON.parse(localStorage.getItem('profile') || 'null');
 const userId = user?.result?._id;

 const dispatch = useDispatch<any>();
 const navigate = useNavigate();

 const [isEditMode, setIsEditMode] = useState(false);
 const [commnetText, setCommentText] = useState('');
 const [likes, setLikes] = useState(post?.likes || []);
 const [editFormData, setEditFormData] = useState<Partial<PostType>>({});

 const hasLikedPost = likes?.find((like)=> like === userId);


useEffect(()=>{
    setLikes(post?.likes || []);
    // console.log("post", post)
}, [post])

 const handleEditChange = (e?: any) => {
    if(!e){
        setEditFormData({
            _id: post._id,
            title: post.title,
            message: post.message,
            creator: post.creator,
            selectedFile: post.selectedFile
        })
    } else {
        setEditFormData({...editFormData, [e.target.name]: e.target.value});
    }
 }

 const handleSave = async ()=> {
    if(!editFormData._id) return;
    setIsEditMode(false);
    await dispatch(updatePost(editFormData._id, {...editFormData}))
 }

 const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
 }


 const handleCommentSubmit = async ()=> {
    if(!commnetText.trim()) return;
    const newComments = await dispatch(commentPost(commnetText, post._id));
    setCommentText('');
    // if(newComments)
 }

 const handleLike = async ()=> {
    dispatch(likePost(post._id));
    if(hasLikedPost){
        setLikes(likes.filter((id)=> id !== userId));
    } else {
        setLikes([...likes, userId])
    }
 }


 const handleDelete = async ()=> {
    if(window.confirm("Are you sure you want to delete this post?")){
        await dispatch(deletePost(post._id));
        navigate('/');
    }
 }

 const LikeIcon = ()=> {
    const color = hasLikedPost ? 'red' : 'inherit';
    if(likes?.length > 0){
        return (
            <>
             <Favorite sx={{ color}} />
             &nbsp;
             {
                likes.length > 2
                ? (hasLikedPost ? ` You and ${likes.length -1} others` : `${likes.length} Likes`)
                : `${likes.length} ${likes.length === 1 ? 'Like' : 'Likes'}`
             }
            </>
        );
    }
    return <><Favorite />&nbsp;Like</>
 }

 return (
    <>
    {!isEditMode ? (
        <Card sx={{
            margin: compact ? 1 : {xs : 2, md: 4},
            mb: compact ? 0 : 4,
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column'
        }}>
        <CardHeader
          avatar={
            <Avatar
              src={post.CreatorImg}
              aria-label='creator'
              onClick={()=> navigate(`/Profile/${post.creator}`)}
              sx={{ cursor: 'pointer', border: '2px solid #eee'}}
              >
                {post?.name?.charAt(0) || 'U'}
              </Avatar>
          }
          action={
            post.creator === (userId) && (
                <IconButton onClick={()=> {setIsEditMode(true); handleEditChange();}}>
                    <MoreVert />
                </IconButton>
            )
          }
          title={<Typography variant={compact ? 'subtitle2' : 'subtitle1'} >{post.name}</Typography>}
          subheader={moment(post.createdAt).fromNow()}
          />
{/* 
          <CardMedia
            onClick={()=> navigate(`/posts/${post._id}`)}
            sx={{
                cursor: 'pointer',
                height: compact ? 300 : 'auto',
                maxHeight: 500,
                objectFit: 'cover'
            }}
            component='img'
            image={post.selectedFile}
            alt={post.title}
            /> */}

            <CardMedia
            component="img"
            image={post.selectedFile}
            alt={post.title}
            onClick={() => navigate(`/posts/${post._id}`)}
            sx={{
                cursor: 'pointer',
                width: '100%',
                height: compact ? 220 : 400,
                objectFit: 'cover',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
            }}
            />

            <CardContent sx={{ flexGrow: 1, p: compact ? 2: 3 }}>
                <Typography variant={compact ? 'body1' : 'h6'} gutterBottom>{post?.title}</Typography>
                {!compact && (
                    <Typography variant='body2' color='text.secondary'>
                        {post?.message}
                    </Typography>
                )}
                <Divider sx={{my: 2}} />
                <Comments post={post} />
            </CardContent>

            <CardActions sx={{  px: 2, pb: 2, mt: 'auto'}}>
                <Button size='small' color='primary' onClick={handleLike}>
                    <LikeIcon />
                </Button>
            </CardActions>

            {user?.result && ! compact && (
                <Box sx={{ px: '2', pb: '2'}} >
                    <TextField
                     name='Comment'
                     variant='outlined'
                     fullWidth
                     size='small'
                     label='Add A comment...'
                     onChange={handleCommentChange}
                     value={commnetText}
                     onKeyUp={(e)=> e.key === 'Enter' && handleCommentSubmit()}
                     slotProps={{
                        input:{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <Button color='primary' size='small' onClick={handleCommentSubmit} disabled={!commnetText.trim()}>
                                        Post
                                    </Button>
                                </InputAdornment>
                            )
                        }
                     }}
                     />
                </Box>
            )}
        </Card>
    ) : (
        <>
        <Card sx={{margin:{xs:1, sm:3, md: 5}, p:3, borderRadius: 2}}>
         <Stack spacing={3}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <Typography variant='h6'>Edit Post</Typography>
                <Button color='error' variant='outlined' size='small' onClick={handleDelete}>Delete Post</Button>
            </Box>
            <Box>
                <Typography variant='caption' color='text.secondary'>Background Image</Typography>
                <Box sx={{mt:1, border:'1px dashed #ccc', p: 2, textAlign: 'center', borderRadius: 1}}>
                    {/* <FileBase 
                    type="file" multiple={false}
                    onDone={({base64}: any) => setEditFormData({...editFormData, selectedFile: base64})}
                    /> */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                            setEditFormData({ ...editFormData, selectedFile: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                        }}
                        />
                </Box>
            </Box>

            {editFormData.selectedFile && (
                <CardMedia component='img' height='200' image={editFormData.selectedFile}
                 sx={{ borderRadius: 1, objectFit: 'cover'}}
                 />
            )}

            <TextField
             label="Title"
             fullWidth
             name="title"
             value={editFormData.title || ''}
             onChange={handleEditChange}
             />

             <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              name='message'
              value={editFormData.message || ''}
              onChange={handleEditChange}
              />
              <Stack direction='row' spacing={2} sx={{justifyContent:'flex-end'}}>
                <Button onClick={()=> setIsEditMode(false)}>Cancel</Button>
                <Button variant='contained' onClick={handleSave}>Save Changes</Button>
              </Stack>
         </Stack>
        </Card>
        </>
    )

}
    
    </>
 )
}

export default Post;