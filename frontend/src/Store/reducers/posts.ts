import { END_LOADING, FETCH_ALL, FETCH_BY_SEARCH, FETCH_MORE, FETCH_POST, LIKE, START_LOADING, COMMENT, CREATE, UPDATE, DELETE } from "../constants/actionTypes";
import { Post } from "../../types";


interface PostsState {
    isLoading: boolean;
    posts: Post[];
    SearchResult: {user: any[], posts: Post[]} | any[];
    post?:Post;
    currentPage?: number;
    numberOfPages?: number;
}

const initialState: PostsState = {
    isLoading: true,
    posts: [],
    SearchResult: []
}

const postsReducer = (state = initialState, action: any): PostsState => {
    switch (action.type) {
        case START_LOADING:
            return { ...state, isLoading: true };
        case END_LOADING:
            return { ...state, isLoading: false };
        case FETCH_ALL:
            return { ...state,
                 posts: action.payload?.data || [],
                 currentPage: action.payload?.currentPage || 1,
                 numberOfPages: action.payload?.numberOfPages || 1 };
        case FETCH_MORE:
            return { ...state,
                    posts: [...state.posts, ...(action.payload?.data || [])],
                    currentPage: action.payload?.currentPage || 1,
                    numberOfPages: action.payload?.numberOfPages || 1 };
        case FETCH_BY_SEARCH:
            return { ...state, SearchResult: action.payload};
        case FETCH_POST:
            return { ...state, post: action.payload.post };
        case LIKE:
            return {
                ...state,
                posts: state.posts.map((post) =>(post._id === action.payload._id ? action.payload : post)),
            };
        case COMMENT:
            return {
                ...state,
                posts: state.posts.map((post) => {
                    // change post that just received comment
                    if (post._id === action.payload._id) {
                        return action.payload;
                    }
                    return post;
                })
            };
        case CREATE:
            return { ...state, posts: [ action.payload, ...state.posts] };
        case UPDATE:
            return {
                ...state,
                posts: state.posts.map((post) => (post._id === action.payload._id ? action.payload : post))
            };
        case DELETE:
            return { ...state, 
                posts: state.posts.filter((post) => post._id !== action.payload) };
        default:
            return state;
        }
    }
export default postsReducer;