import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Store/reducers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPosts, getPostsMore } from "../../Store/actions/posts";
import { Box, CircularProgress, Grid, Skeleton, Typography } from "@mui/material";
import Post from "../Post/Post";



interface FeedProps {
    profileId?: string;
    grid?: boolean;
}

const Feed: React.FC<FeedProps> = ({ profileId, grid = false }) => {
  const dispatch = useDispatch();
  const {posts, isLoading, numberOfPages} = useSelector((state: RootState)=> state.posts)

  const user = useMemo(()=> JSON.parse(localStorage.getItem('profile') || 'null'), [])
  const userId = user?.result?._id || null;

  const [page, setPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  const loader = useRef<HTMLDivElement | null>(null);
  
  useEffect(()=>{
    dispatch(getPosts(1,userId, profileId) as any)
  }, [dispatch, userId, profileId])

  
  const loadMore = useCallback(async ()=>{
    if(page < (numberOfPages || 0) && !fetchingMore && !isLoading) {
        setFetchingMore(true);
        const nextPage = page +1
        try {
            await dispatch(getPostsMore(nextPage, userId, profileId) as any);
            setPage(nextPage);
        } catch (error) {
            console.error("error loading more posts", error)
        } finally {
            setFetchingMore(false)
        }
    }
  }, [page, numberOfPages, fetchingMore, isLoading, dispatch, userId, profileId])


  const loadMoreRef = useRef(loadMore)
  useEffect(()=>{
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(()=>{
    if (isLoading || posts.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !fetchingMore) {
                loadMoreRef.current();
            }
        },
        {threshold: 1.0}
    );

    if (loader.current){
        observer.observe(loader.current)
    }

    return () => {
        if(loader.current){
            observer.unobserve(loader.current);
        }
    }
  }, [isLoading, posts.length])


  if (!posts.length && !isLoading) return (
    <Box sx={{ flex: 8, p: 2, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">No Posts found.</Typography>
    </Box>
  )

  return (
    <Box sx={{ flex:8 ,  p: { xs: 1, md: 0 }}}>
        {isLoading && page === 1 ? (
            <Grid container spacing={2}>
                {[1,2,3,4].map((i)=> (
                    <Grid size={{ xs: 8, sm: grid ? 6 : 0 }} key={i}>
                        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2}} />
                    </Grid>
                ))}
            </Grid>

        ) : (
            <>
             <Grid container spacing={grid ? 2 : 4} >
                {
                    posts?.map((post)=> (
                        <Grid size={{xs: 12, sm: grid ? 6 : 12 }} key={post._id}>
                           <Post post={post} compact={grid} />
                        </Grid>
                    ))
                }
             </Grid>

             <div ref={loader} style={{ height: '100px', display: 'flex', justifyContent:'center', alignItems: 'center' }} >
                {fetchingMore && <CircularProgress size={24} />}
             </div>
            </>
        )
    
    
    }
    </Box>
  )

}



export default Feed;
