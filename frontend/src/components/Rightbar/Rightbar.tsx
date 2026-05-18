import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store/reducers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSugUser } from "../../api";
import { Avatar, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import React from "react";



const RightBar: React.FC = ()=>{
  const navigate = useNavigate();
  const authData = useSelector((state: RootState)=> state.auth.authData);

  const user = useMemo(()=>{
    if(authData) return authData;
    return JSON.parse(localStorage.getItem('profile') || 'null');
  }, [authData])

  const userId = user?.result?._id;
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async ()=>{
    if(!userId) return;
    setIsLoading(true);
    try {
        const {data} = await getSugUser(userId);
        console.log("sug users", data)
        setSuggestedUsers(data?.users || [])
    } catch (error) {
        console.error('Error Fetching Suggestions', error)
    } finally {
        setIsLoading(false)
    }
  }, [userId])

 useEffect(()=>{
    if(userId){
        fetchSuggestions()
    }
 }, [userId, fetchSuggestions]);


 if(!user) return null;

 return (
    <Box sx={{p: 2, position: 'sticky', top: 80}}>
        <Paper elevation={0} sx={{p: 2, borderRadius: 2, bgcolor: 'background.paper'}}>
            <Typography variant="subtitle1" gutterBottom sx={{ px: 2, fontWeight:'bold'}}>
                Suggestions for You
            </Typography>

            {isLoading ? (
                <Box sx={{display:'flex', justifyContent:"center", p:3}}>
                    <CircularProgress size={24} />
                </Box>
            ): (
                <List>
                    {suggestedUsers.length > 0 ? (
                        suggestedUsers.map((sUser: any, index: number)=>(
                            <React.Fragment key={sUser._id}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={()=> navigate(`/Profile/${sUser._id}`)} sx={{borderRadius:1}}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32 }} alt={sUser.Name} src={sUser.imageUrl} />
                                        </ListItemAvatar>
                                    </ListItemButton>
                                    <ListItemText
                                      primary={<Typography variant="body2" sx={{fontWeight:'medium'}}>{sUser.name}</Typography>}
                                      secondary={
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ displa:'block'}}>
                                            {sUser.bio || 'Active User'}
                                        </Typography>
                                      }>

                                    </ListItemText>
                                </ListItem>
                                
                            </React.Fragment>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{px: 2}}>
                            No suggestions at the moment.
                        </Typography>
                    )}
                </List>
            )}


        </Paper>
    </Box>
 )

}



export default RightBar;