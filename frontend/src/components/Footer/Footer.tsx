import { Box, Container, Link, Typography } from "@mui/material";

function CopyRight(){
    return (
        <Typography variant="body2" color="text.secondary" align="center" >
            {'Copyright ©'}
            <Link color="inherit" href="/" sx={{fontWeight: 'bold', textDecoration:'none'}}>
             SocialApp
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    )
}

interface FooterProps {
    desc?:string;
    title: string;
}


const Footer: React.FC<FooterProps> = ({desc, title}) => {
    return (
        <Box component='footer' sx={{ bgcolor:'background.paper', py: 6, mt:'auto', borderTop: '1px solid', borderColor: 'divider' }}>
            <Container maxWidth='lg'>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold'}}>
                    {title}
                </Typography>
                <Typography
                  variant="subtitle1"
                  align="center"
                  color="text.secondary"
                  component='p'>
                    {desc}
                  </Typography>
                  <CopyRight />
            </Container>
        </Box>
    )
}

export default Footer;