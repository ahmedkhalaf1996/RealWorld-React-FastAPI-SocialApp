
import {
  AccountBox,
  ModeNight,
  Person,
  Home as HomeIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../Store/reducers';
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch } from '@mui/material';


interface sidebarProps {
    mode : "light" | "dark";
    setMode: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}


const Sidebar : React.FC<sidebarProps> = ({ mode, setMode }) => {
    const navigate = useNavigate();
    const authData = useSelector((state: RootState)=> state.auth.authData);
    const user = authData || JSON.parse(localStorage.getItem('profile') || 'null');
    const userId = user?.result?._id;

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    return (
        <Box sx={{ flex:2, p:2, display: {xs: "none", sm: "block"} }}>
            <Box sx={{position:'sticky', top:80}}>
                <Paper elevation={0} sx={{borderRadius: 2, bgcolor: 'background.paper'}}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={()=> handleNavigate('/Home')}>
                                <ListItemIcon><HomeIcon /></ListItemIcon>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        {user ? (
                            <>
                            <ListItem disablePadding>
                                <ListItemButton onClick={()=> handleNavigate(`/Profile/${userId}`)}>
                                    <ListItemIcon><AccountBox /></ListItemIcon>
                                    <ListItemText primary="profile"/>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={()=> handleNavigate(`/chat`)}>
                                    <ListItemIcon><ChatIcon /></ListItemIcon>
                                    <ListItemText primary="Messages"/>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={()=> handleNavigate(`/Notification`)}>
                                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                                    <ListItemText primary="Notifications"/>
                                </ListItemButton>
                            </ListItem>
                            </>
                        ) : (
                            <ListItem disablePadding>
                                <ListItemButton onClick={()=> handleNavigate("/Auth")}>
                                    <ListItemIcon><Person /></ListItemIcon>
                                    <ListItemText primary="Authentication"/>
                                </ListItemButton>
                            </ListItem>
                        )}

                        <Divider sx={{my:1}} />

                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon><ModeNight /></ListItemIcon>
                                <ListItemText primary="Dark Mode"/>
                                <Switch 
                                 checked={mode==="dark"}
                                 onChange={()=> setMode(mode === "light" ? "dark": "light")}
                                 />
                            </ListItemButton>
                        </ListItem>

                    </List>
                </Paper>
            </Box>
        </Box>
    )

}

export default Sidebar;





