import React, { useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import {
  Box,
  createTheme,
  ThemeProvider,
  PaletteMode,
  CssBaseline,
  Container
} from "@mui/material"

import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';

import {RootState} from "./Store/reducers"
import { useSelector } from 'react-redux';
import PostDetails from './components/Post/PostDetails';
import Profile from './components/Profile/Profile';
import Footer from './components/Footer/Footer';
import Search from './components/Search/Search';
import NotificationList from './components/Notification/NotificationList';
import NavBar from './components/NavBar/NavBar';
import Chat from './components/Chat/Chat';
// --- Protected Route helper ---
const ProtectetdRoute: React.FC<{ children: React.ReactElement }> = ({ children }) =>{
  const authData = useSelector((state: RootState)=> state.auth.authData);
  const userFromStorage = JSON.parse(localStorage.getItem('profile') || 'null');
  const user = authData || userFromStorage;

  if (!user) {
    return <Navigate to="/Auth" replace />;
  }
  return children;
}

const App: React.FC = () =>{

  const user  = useSelector((state: RootState)=> state.auth.authData);

  const [mode, setMode] = useState<PaletteMode>("light");

  const theme = useMemo(()=> createTheme({
    palette:{
      mode,
      primary: {main: '#1976d2'},
      secondary: {main: "#dc004e"},
      background: {
        default: mode === 'light' ? '#f4f7f6': '#121212',
        paper: mode === 'light' ? '#ffffff': "#1e1e1e"
      },
    },
    shape: {borderRadius: 8},
    components: {
      MuiButton: {styleOverrides: {root: {textTransform:'none', borderRadius: 8}}},
      MuiPaper: {styleOverrides: {root: {backgroundImage: 'none'}}},
    },
  }),
 [mode]
);

return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: "background.default", color: "text.primary" }}>
     
      {/* NavBar  */}
      <NavBar />
      <Container maxWidth="xl" sx={{ flex: 1, py: 2}} >
        <Routes>
          {/* force redirect form root to home  */}
          <Route path="/" element={<Navigate replace to="/Home" />} />

          {/* Home  */}
        <Route path="/Home" element={
          <ProtectetdRoute>
            <Home setMode={setMode}  mode={mode}/>
          </ProtectetdRoute>
        } />
        

         {/* profile  */}
        <Route path='/Profile/:ProfileID' element={
          <ProtectetdRoute>
            <Profile />
          </ProtectetdRoute>
        } />

        {/* post Details  */}
        <Route path='/posts/:id' element={
          <ProtectetdRoute>
            <PostDetails />
          </ProtectetdRoute>
        } />

        <Route path='/Search' element={
          <ProtectetdRoute>
            <Search />
          </ProtectetdRoute>
        } />

        {/* notifications  */}
        <Route path='/Notification' element={
          <ProtectetdRoute>
            <NotificationList />
          </ProtectetdRoute> 
        } /> 
         {/* chat  */}
         <Route path='/chat' element={
          <ProtectetdRoute>
            <Chat />
          </ProtectetdRoute>
         } />
          {/* auth  */}
          <Route path="/auth" element={! user ? <Auth /> : <Navigate replace to="/Home" />} />
        </Routes>
      </Container>
      <Footer title="SocialApp" desc="Modernizing your social experice."/>
    </Box>
    </BrowserRouter>
  </ThemeProvider>
)


}

export default App;