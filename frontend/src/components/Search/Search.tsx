import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RootState } from "../../Store/reducers";
import { getPostsUsersBySearch } from "../../Store/actions/posts";
import { Avatar, Box, CircularProgress, Divider, FormControlLabel, Grid, List, ListItem, ListItemAvatar, ListItemText, Stack, Switch, Typography } from "@mui/material";
import Post from "../Post/Post";



const Search: React.FC = () => {
 const dispatch = useDispatch<any>();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();

 const [isSearchUsers, setIsSearchUsers] = useState(false);

 const {SearchResult, isLoading} = useSelector((state: RootState) => state.posts);

 const performSearch = useCallback(()=>{
    const searchData = searchParams.get('searchQuery');
    if(searchData) {
        dispatch(getPostsUsersBySearch({ searchData }))
    }
 }, [searchParams, dispatch]);

 useEffect(()=>{
    performSearch();
 }, [performSearch])

 const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setIsSearchUsers(e.target.checked);
 }

 const query = searchParams.get('searchQuery');

 return (
  <Box sx={{mt: 3, mb: 5}}>
    <Stack direction='row' spacing={4} sx={{justifyContent:'center'}}>
    <Box sx={{ width: '100%', maxWidth: 900 }}>

        <Box sx={{mb: 4, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Typography variant="h5" sx={{fontWeight:'bold'}}>
                {query ? `Results for "${query}"` : `'Search Results'`}
            </Typography>
        <FormControlLabel
         control={
            <Switch
             checked={isSearchUsers}
             onChange={handleSwitchChange}
             color="primary"
             />
         }
         label={isSearchUsers ? "showing Users": "shoing Posts"}
        />
        </Box>
        {isLoading ? (
            <Box sx={{display: 'flex', justifyContent:'center', py:5}}>
                <CircularProgress />
            </Box>
        ): (
            <Box>
                {isSearchUsers ? (
                    <List sx={{ bgcolor: 'background.paper', borderRadius:2, boxShadow: 1}}>
                        {(SearchResult as any)?.user?.length > 0 ? (
                            (SearchResult as any).user.map((user: any, index: number) => (
                                <React.Fragment key={user._id}>
                                    <ListItem onClick={()=> navigate(`/Profile/${user._id}`)}
                                        sx={{ cursor: 'pointer', '&:hover': {bgcolor: 'action.hover'} }}>
                                      <ListItemAvatar >
                                        <Avatar alt={user.name} src={user.imageUrl} />
                                      </ListItemAvatar>
                                        <ListItemText 
                                            primary={<Typography sx={{fontWeight: 'medium'}}>{user.name}</Typography>}
                                            secondary={user?.bio || user?.email}
                                        />
                                    </ListItem>
                                     {index < (SearchResult as any).user.length -1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Box sx={{ textAlign: 'center', p: 3}}>No Users Found.</Box>
                        )}
                    </List>
                ): (
                    <Box>
                        {/* <Grid container spacing={1}>
                            {(SearchResult as any)?.posts?.length > 0 ? (
                                (SearchResult as any).posts.map((post: any) => (
                                    // <Grid sx={{ xs:8, sm:4 }} key={post._id}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                                        <Post post={post} />
                                    </Grid>
                                ))
                            ): (
                                <Box sx={{p:3, textAlign:'center', width: '100%'}}>
                                    No Posts Found.
                                </Box>
                            )}
                        </Grid> */}
                        <Grid container spacing={2}>
                                {(SearchResult as any)?.posts?.length > 0 ? (
                                    (SearchResult as any).posts.map((post: any) => (
                                    <Grid size={{ xs: 12, sm: 9, md: 4 }} key={post._id}>
                                        <Post post={post} compact />
                                    </Grid>
                                    ))
                                ) : (
                                    <Box
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        width: '100%',
                                    }}
                                    >
                                    No Posts Found.
                                    </Box>
                                )}
                                </Grid>
                    </Box>
                )}
            </Box>
        )}
        </Box>
    </Stack>
  </Box>
 )
}

export default Search;