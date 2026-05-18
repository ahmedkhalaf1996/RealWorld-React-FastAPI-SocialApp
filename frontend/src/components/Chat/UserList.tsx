import { Avatar, Badge, Box, Divider, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import React from "react";


interface UserListProps {
    userList: any[];
    selectedUserId: string | null;
    handleUserClick: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ userList, selectedUserId, handleUserClick }) => {
 return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Box sx={{  p:2, borderBottom:'1px solid', borderColor:'divider' }}>
            <Typography variant="h6" sx={{fontWeight: 'bold'}}>Contacts</Typography>
        </Box>
        <List sx={{ flex: 1, overflowY: 'auto', p: 0}}>
            {userList.map((user, index) => (
                <React.Fragment key={user._id}>
                    <ListItemButton selected={user._id === selectedUserId}
                    onClick={()=> handleUserClick(user._id)}
                    sx={{ py: 1.5, px: 2}}>

                        <ListItemAvatar >
                            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal:'right'}}
                            variant="dot"
                            color={user.online ? "success": 'default'}
                            invisible={!user.online} >
                                <Avatar alt={user.name} src={user.avatar || user.imageUrl} />
                            </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                         primary={<Typography sx={{fontWeight:user.unreadMessages > 0 ? "bold" : "medium" }} >{user.name}</Typography>}
                         secondary={
                            <Typography variant="caption" color="textSecondary" noWrap >
                                {user?.online ? "Online": "Offline"}
                            </Typography>
                         }
                        />
                        {user.unreadMessages > 0 && (
                            <Badge badgeContent={user.unreadMessages} color="error" />
                        )}

            
                    </ListItemButton>
                        {index < userList.length -1 && <Divider variant="inset" component="li"/>}
                </React.Fragment>
            ))}
        </List>
    </Box>
 )
}

export default UserList;