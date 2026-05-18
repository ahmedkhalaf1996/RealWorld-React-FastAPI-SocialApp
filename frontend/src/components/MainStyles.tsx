import { alpha, styled } from "@mui/material/styles";
import { Card, Box, Modal, InputBase } from "@mui/material";

export const AuthCard = styled(Card)(() => ({
  "&::-webkit-scrollbar": { width: 7 },
  "&::-webkit-scrollbar-track": {
    boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "darkgrey",
    outline: "1px solid slategrey",
  },
  minWidth: 300,
  maxWidth: 400,
  height: 400,
}));

export const AuthMainBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  "& .MuiTextField-root": {
    margin: theme.spacing(3),
    width: "25ch",
  },
}));

export const authSx = {
  AuthType: {
    margin: 1,
    textAlign: "center",
  },
};

export const StyledModal = styled(Modal)({
  display:'flex',
  alignItems:'center',
  justifyContent:"center"
})

export const UserBox = styled(Box)({
  display:'flex',
  alignItems:'center',
  gap:'10px',
  marginBottom:'20px'
})


export const Icons = styled(Box)(({theme}) =>({
 display:'none',
 gap:'20px',
 alignItems: 'center',
 [theme.breakpoints.up('sm')]: {
  display: 'flex'
 }
}))

export const Search = styled('div')(({ theme })=> ({
  position:'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),

  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))


export const SearchIconWrapper = styled('div')(({theme})=>({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display:' flex',
  alignItems:'center',
  justifyContent:'center'
}))

export const StyledInputBase = styled(InputBase)(({theme})=> ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1,1,1,0),

    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      }
    }
  }
}))