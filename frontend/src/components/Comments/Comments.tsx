import { useState } from "react";
import { Post, Comment } from "../../types";
import { Avatar, Box, Button, Typography } from "@mui/material";



interface CommentsProps {
    post: Post;
}

const Comments: React.FC<CommentsProps> = ({ post }) => {
 const [isExpanded, setIsExpanded] = useState(false);

 if(!post?.comments?.length) return null;

 const commentsToShow = isExpanded ? post.comments : post.comments.slice(0, 2);
 const hasMore = post.comments.length > 2;

 return (
    <Box sx={{mt: 2}}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Comments ({ post.comments.length })
        </Typography>

        <Box sx={{pr: 1}}>
            {commentsToShow.map((c: Comment, i: number) =>(
                <Box key={i} sx={{mb:1.5, display: 'flex', gap:1.5, alignItems: 'flex-start'}} >
                    <Avatar
                      src={c.user?.imageUrl}
                      sx={{ width: 28, height: 28, border: '1px solid', borderColor: 'divider' }}>
                        {(c.user?.name || 'u').charAt(0).toUpperCase()}
                      </Avatar>
                    <Box sx={{
                        p:1.5,
                        bgcolor: 'action.hover',
                        borderRadius: '0 12px 12px 12px',
                        flex: 1
                    }}>
                <Typography variant="caption" sx={{fontWeight: 'bold', display:'block', mb:0.5}}>
                    {c.user?.name || 'User'}
                </Typography>
                <Typography variant="body2" sx={{fontSize: '0.875rem', color: 'text.primary', wordBreak: 'break-word'}}>
                    {c.value}
                </Typography>
                </Box>
                </Box>
            ))}
        </Box>

        {hasMore && (
            <Button size="small" sx={{mt: 0.5, textTransform: 'none', color:'primary.main', fontWeight: 600}}
              onClick={()=> setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show less': `View All ${post.comments.length} Comments`}
            </Button>
        )}
    </Box>
 )
}

export default Comments;