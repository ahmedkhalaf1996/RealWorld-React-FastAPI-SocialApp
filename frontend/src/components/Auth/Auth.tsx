
// @ts-nocheck
import { useState } from "react";
import SendIcon from '@mui/icons-material/Send'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signin, signup } from '../../Store/actions/auth';
import { AUTH } from '../../Store/constants/actionTypes';
import { RootState } from '../../Store/reducers';

import {Alert, Box, Button, Card, Stack, TextField, Typography} from '@mui/material'

import { AuthCard, AuthMainBox, authSx } from '../MainStyles';



const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""}

  const Auth : React.FC = () => {
    const [form, setForm] = useState(initialState);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // style 

    const {errors} = useSelector((state: RootState) => state.auth);

    const handleSubmit = (type) => {
        if(type === 'siginup'){
            dispatch(signup(form, navigate));
        } else if (type === 'signin'){
            dispatch(signin(form, navigate));
        }
    }

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    return (
        <Stack direction="row" spacing={4} sx={{ marginTop: 2, justifyContent: "center" }} >
            <Box flex={2}></Box>
            <Box flex={2} sx={{ marginTop: 2}}>
                {errors && <Alert severity="error" sx={{ mb: 2 }}>{errors}</Alert>}
            <AuthCard>

                    <Typography variant="h4" component="div" sx={authSx.AuthType}>
                        Sign In
                    </Typography>
                    <AuthMainBox
                            component="form"
                            noValidate
                            autoComplete="off"
                     >
                     <TextField
                     id="outline-required1"
                     label="email"
                     type="email"
                     name="email"
                     onChange={handleChange}
                     >

                     </TextField>
                     <TextField
                     id="outline-password-input1"
                     label="password"
                     type="password"
                     name="password"
                     autoComplete="current-password"
                     onChange={handleChange}
                     >
                     </TextField>
                     <Box sx={{ m:2}}>
                        <Button size="large" variant="outlined"
                        onClick={() => handleSubmit('signin')}
                        endIcon={<SendIcon />}> 
                        Sigin In 
                        </Button>
                     </Box>
                </AuthMainBox>
                </AuthCard>
            </Box>
            <Box flex={6} sx={{ marginTop: 2}}>
                <Card >
                    <Typography variant="h4" component="div" sx={authSx.AuthType}>
                        Sign Up
                    </Typography>
                  <AuthMainBox component="form" noValidate autoComplete="off">
                      <TextField
                      id="outline-required3"
                      label="first name"
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                      ></TextField>

                      <TextField
                      id="outline-required4"
                      label="last name"
                      type="text"
                      name="lastName"
                      onChange={handleChange}
                      ></TextField>

                      <TextField
                        id="outline-required5"
                        label="email"
                        type="email"
                        name="email"
                        onChange={handleChange}
                      ></TextField>
                      <TextField
                        id="outline-password-input6"
                        label="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        onChange={handleChange}
                      ></TextField>

                        <Box sx={{m:1}}>
                            <Button size="large" variant="outlined"
                            onClick={() => handleSubmit('siginup')}
                            endIcon={<SendIcon />}> 
                            Sigin Up

                            </Button>
                        </Box>
                  </AuthMainBox>
                </Card>
            </Box>
        </Stack>
    )
  }

  export default Auth;