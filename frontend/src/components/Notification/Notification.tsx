import { Avatar, Box, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import moment from "moment";


interface NotificationProps {
    notificationData: any;
    onClick: ()=> void;
}


const Notification: React.FC<NotificationProps> = ({  notificationData , onClick }) => {
  const {user, deatils, createdAt, isreded } = notificationData;
  const {name, avatar} = user || {name:'Unknown', avatar:''};

  return (
    <ListItem  onClick={onClick} sx={{
        bgcolor: isreded ? 'transparent': 'action.selected',
        '&:hover': {bgcolor: 'action.hover'},
        transition: 'background-color 0.3s',
        borderRadius: 1,
        mb: 0.5
    }}>
    <ListItemAvatar>
        <Avatar alt={name} src={avatar} />
    </ListItemAvatar>
    <ListItemText
       primary={
        <Box component='span' sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}} >
            <Typography variant="body2" sx={{ fontWeight: isreded ? 'normal': 'bold'}} >
                {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {moment(createdAt).fromNow()}
            </Typography>
        </Box>
       }
       secondary={
        <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
            {deatils}
        </Typography>
       }
       />
    </ListItem>
  )
}

export default Notification;
