import { Box, Stack } from "@mui/material";
import Feed from "../Feed/Feed";
import Add from "../Add/Add";
import RightBar from "../Rightbar/Rightbar";
import Sidebar from "../Sidebar/Sidebar";


interface HomeProps {
    mode: "light" | "dark";
    setMode: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

const Home: React.FC<HomeProps> = ({ mode, setMode }) =>{
 return (
    <Box>
        <Stack direction="row" spacing={{xs:0, sm:2}}  sx={{ justifyContent: "space-between" }}>
            <Sidebar setMode={setMode} mode={mode} />
            <Feed />
            <Box sx={{display: {xs: "none", md:"block"}, flex:3}}>
                <RightBar />
            </Box>
            <Add />
        </Stack>
    </Box>
 )
}

export default Home;