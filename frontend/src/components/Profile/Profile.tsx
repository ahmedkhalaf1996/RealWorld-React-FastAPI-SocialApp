

import { useParams } from 'react-router-dom';
import * as api from '../../api/index';
import { RootState } from '../../Store/reducers';
import {Post as PostType} from '../../types'
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import Feed from '../Feed/Feed';

const Profile: React.FC = ()=> {

    const {ProfileID} = useParams<{ ProfileID: string }>();
    const authData = useSelector((sate: RootState) => sate.auth.authData);
    const dispatch = useDispatch<any>();

    // stable user derivation
    const loggedInUser = useMemo(()=>{
        if(authData) return authData;
        return JSON.parse(localStorage.getItem('profile') || 'null');
    }, [authData])

    const loggedInUserId = loggedInUser?.result?._id;

    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchProfileData = useCallback(async ()=> {
        if(!ProfileID) return;
        setIsLoading(true);
        try {
            const {data} = await api.fetchUserProfile(ProfileID);
            console.log("data", data)
            setUserData({...data?.user, userPostsCount: data?.postsCount || 0});
        } catch (error) {
            console.error("Error fetching profile", error)
        } finally {
            setIsLoading(false);
        }
    }, [ProfileID])

    useEffect(()=> {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleUpdateProfile = async ()=> {
        setIsUpdating(true);
        try {
            const {data} = await api.UpdateUser(userData);
            setUserData((prev: any) => ({...prev, ...data?.user}))
            setIsEditMode(false)
        } catch (error) {
            console.error("Error updateing profile", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleFollowAction = async () => {
        if (!ProfileID || !loggedInUser?.token) return;
        try {
          await api.following(ProfileID);
          fetchProfileData();  
        } catch (error) {
            console.error("Error toogling follow", error)
        }
    }

    const isFollowing = useMemo(()=> userData?.followers?.includes(loggedInUserId), [userData?.followers, loggedInUser])
    const isOwnProfile = ProfileID === loggedInUserId;

    if(isLoading){
        return (
            <Box sx={{ display:'flex', justifyContent: 'center', alignItems:'center', minHeight:'60vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ maxWidth: 1000, mx:'auto', p:{xs:2, md:4} }}>
            <Paper elevation={0} sx={{ p:4, borderRadius: 3, bgcolor: 'background.paper', mb:4 }}>
                <Grid container spacing={4} sx={{alignItems:'center'}}>
                    <Grid sx={{xs:12,sm:4, display:'flex', justifyContent:'center'}} >
                        <Box sx={{position:'relative'}}>
                            <Avatar alt={userData?.name} src={userData?.imageUrl} 
                                  sx={{width: {xs: 120, md: 120}, height: {xs: 120, md:120}, boxShadow: 3}}
                            />
                            {isEditMode && (
                                <Box sx={{mt:2, width: '100%', overflow:'hidden'}}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                            setUserData({ ...userData, imageUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }}
                                        />
                                </Box>
                            )}
                        </Box>
                    </Grid>


                   <Grid sx={{xs:12, sm:8}}>
                    <Stack spacing={2} sx={{ textAlign:{xs:'center', sm:'left'} }}>
                        <Box sx={{ display:'flex', flexDirection:{xs:'column', sm:'row'}, alignItems:'center', gap:2 }}>
                            {!isEditMode ? (
                                <Typography variant='h4' sx={{fontWeight: 'bold'}}>{userData?.name}</Typography>
                            ) : (
                                <TextField fullWidth variant='outlined' size='small' label="Name" value={userData?.name || ''} 
                                 onChange={(e)=> setUserData({ ...userData, name: e.target.value})}
                                 />
                            )}

                            {isOwnProfile ? (
                                !isEditMode ? (
                                    <Button variant='outlined' size='small' onClick={()=> setIsEditMode(true)}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Stack direction='row' spacing={1}>
                                        <Button variant='contained' size='small' onClick={handleUpdateProfile} disabled={isUpdating}>
                                            {isUpdating ? 'Saving...': 'Save'}
                                        </Button>
                                        <Button variant='text' size='small' onClick={()=> setIsEditMode(false)}>Cancel</Button>
                                    </Stack>
                                )
                            ): (
                                <Button variant={isFollowing ? 'outlined': 'contained'}
                                 onClick={handleFollowAction}
                                 color={isFollowing ? 'inherit': 'primary'}>
                                    {isFollowing ? 'Unfollow': 'Follow'}
                                 </Button>
                            )}
                        </Box>

                        <Box sx={{display:'flex', justifyContent:{xs:'center', sm:'flex-start'}, gap:3 }}>
                            <Typography variant='body1'><strong>{userData?.userPostsCount || 0}</strong> posts </Typography>
                            <Typography variant='body1'><strong>{userData?.followers?.length || 0 }</strong> followers </Typography>
                            <Typography variant='body1'><strong>{userData?.following?.length || 0}</strong> following </Typography>
                        </Box>
                        {!isEditMode ? (
                            <Typography variant='body1' sx={{whiteSpace:'pre-wrap'}}>
                                {userData?.bio || 'No bio yet.' }
                            </Typography>
                        ): (
                            <TextField fullWidth multiline rows={3} variant='outlined' label="bio"
                            value={userData?.bio || ''}
                            onChange={(e)=> setUserData({...userData, bio: e.target.value})}
                            />
                        )}
                    </Stack>
                   </Grid>

                </Grid>
            </Paper>

            <Divider sx={{my: 4}}>
                <Typography variant='h6' color='text.secondary' sx={{px:2}}>POSTS</Typography>
            </Divider>

            <Grid sx={{xs:12}}>
                <Feed profileId={ProfileID} grid={true} />
            </Grid>
        </Box>
    )

}

export default Profile;