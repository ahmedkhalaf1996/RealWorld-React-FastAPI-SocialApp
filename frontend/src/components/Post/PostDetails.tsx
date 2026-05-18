// @ts-nocheck
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getPost } from "../../Store/actions/posts";
import { Grid, Skeleton, Stack } from "@mui/material";
import Post from "./Post";



const PostDetails = () => {
 const [post, Change] = useState<any>();
 const dispatch = useDispatch<any>();
 const {id} = useParams();

 useEffect(()=> {
    const data = dispatch(getPost(id)).then((res)=>{
        Change(res.post)
    })
 }, [id])

 return (
    <>
     {post ? (
        <Grid container spacing={4} sx={{ justifyContent:'center', alignItems:'center'}}>
            <Grid item xs={7}>
                <Post post={post} key={post._id} />
            </Grid>
        </Grid>
     ):(
        <Stack spacing={4}>
            <Skeleton variant="text" height={100} />
            <Skeleton variant="text" height={50} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="rectangular" height={300} />

        </Stack>
     )}
    </>
 )
}

export default PostDetails;