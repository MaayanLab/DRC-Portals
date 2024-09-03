import Image from "next/image";
import { Grid, Typography, Button, Stack, Card, CardContent, Avatar, Link } from "@mui/material";
import { ElevatedIconButton } from "@/components/styled/Buttons";
export default function Specs() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" sx={{marginBottom: 2}}>Web Design Specifications</Typography>
        <Typography variant="body1"  sx={{marginBottom: 2}}>
          The following document lays out the basic web design specifications of the CFDE Workbench.
          The website is built using Next.js, Material UI, and Tailwind CSS.
          You can accesas the template of this website <Link color="secondary" href="https://github.com/MaayanLab/drc-template">here</Link>.
        </Typography>
        <Typography variant="h3" sx={{marginBottom: 2}}>Typography Specifications</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={1}>
        
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="cfde">Title</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 40px</Typography>
              <Typography>font weight: 500</Typography>
              <Typography>Text Transform: Uppercase</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="cfde_small">Title (small)</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 24px</Typography>
              <Typography>font weight: 500</Typography>
              <Typography>Text Transform: Uppercase</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="h1">h1</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 40px</Typography>
              <Typography>font weight: 500</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="h2">h2</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 32px</Typography>
              <Typography>font weight: 500</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="h3">h3</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 24px</Typography>
              <Typography>font weight: 500</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="h4">h4</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 22px</Typography>
              <Typography>font weight: 500</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="h5">h5</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 20px</Typography>
              <Typography>font weight: 500</Typography>
            </div>
          </div> 
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="subtitle1">subtitle1</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 16px</Typography>
              <Typography>font weight: 500</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="subtitle2">subtitle2</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 15px</Typography>
              <Typography>font weight: 500</Typography>
            </div>
          </div>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={1}>
        <div className="flex space-x-5 items-center">
          <div className="flex-grow">  <Typography variant="body1">body1</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: DM Sans</Typography>
              <Typography>size: 16px</Typography>
              <Typography>font weight: 500</Typography>
            </div> 
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="body2">body2</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: DM Sans</Typography>
              <Typography>size: 15px</Typography>
              <Typography>font weight: 500</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">  
            <div className="flex-grow"><Typography variant="caption">caption</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 14px</Typography>
              <Typography>font weight: 500</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">  
            <div className="flex-grow"><Typography variant="nav">nav</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 16px</Typography>
              <Typography>font weight: 600</Typography>
              <Typography>text transform: uppecase</Typography>
              <Typography>color: #2D5986</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="footer">footer</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: DM Sans</Typography>
              <Typography>size: 16px</Typography>
              <Typography>font weight: 400</Typography>
            </div>
          </div>
          <Typography variant="h3">Data Portal Stats</Typography>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="stats_h3">stats_h3</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 24px</Typography>
              <Typography>font weight: 500</Typography>
              <Typography>color: #9E9E9E</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="stats_sub">stats_sub</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 16px</Typography>
              <Typography>font weight: 500</Typography>
              <Typography>color: #9E9E9E</Typography>
            </div>
          </div>
          <div className="flex space-x-5 items-center">
            <div className="flex-grow"><Typography variant="stats_sub_small">stats_sub_small</Typography></div>
            <div className="flex flex-col  w-64">
              <Typography>font: Hanken Grotesk</Typography>
              <Typography>size: 14px</Typography>
              <Typography>font weight: 500</Typography>
              <Typography>color: #9E9E9E</Typography>
            </div>
          </div>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={1}>
          <Typography variant="h3">Colors</Typography>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'primary.main'}}/>
            <Typography variant="body1">Primary Main (#C3E1E6)</Typography>
          </div>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'primary.light'}}/>
            <Typography variant="body1">Primary Light (#DBEDF0)</Typography>
          </div>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'primary.dark'}}/>
            <Typography variant="body1">Primary Dark (#84A9AE)</Typography>
          </div>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'secondary.main'}}/>
            <Typography variant="body1">Secondary Main (#2D5986)</Typography>
          </div>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'secondary.light'}}/>
            <Typography variant="body1">Secondary Light (#9cbcde)</Typography>
          </div>
          <div className="flex space-x-2 items-center">
            <Avatar sx={{backgroundColor: 'secondary.dark'}}/>
            <Typography variant="body1">Secondary Dark (#122436)</Typography>
          </div>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Typography variant="h3">Button Examples</Typography>
            <Button color="secondary">Simple Button Secondary Color</Button>
            <Button variant="contained">Contained Button Primary Color</Button>
            <Button color="secondary" variant="contained">Contained Button Secondary Color</Button>
            <Button color="secondary" variant="outlined">Outlined Button Secondary Color</Button>
            <Typography variant="h5">Icon Button</Typography>
            <ElevatedIconButton
                aria-label="menu"
                sx={{width: 56, height: 56}}
            >
                <Image style={{marginLeft: -2, padding: 2,  objectFit: "contain"}} fill={true} alt="cfde-logo" src="/img/favicon.png" />
            </ElevatedIconButton>
          </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h3">Importing Images:</Typography>
        <Card>
          <CardContent className="flex justify-center">
            <Image  width={500} height={500} alt="cfde-logo" src="/img/C2M2.png" />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
