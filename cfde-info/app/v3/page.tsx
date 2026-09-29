import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  Button,
  Stack
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiArrowTopRight } from '@mdi/js';

const centers = [
	{
		name: "Data Resource Center",
		hero: "Explore Harmonized Common Fund Datasets",
		blurb: "The CFDE Data Resource Center (DRC) hosts the CFDE Workbench, a comprehensive platform that provides harmonized metadata, processed data, and tools for data analysis across NIH Common Fund programs.",
		image: "https://cfde-drc.s3.amazonaws.com/assets/img/centers/DRC.png",
		link: "https://cfde.cloud",
		// width: 300,
    // height: 45
	},
	{
		name: "Knowledge Center",
		hero: "Discover Knowledge Extracted from CFDE Datasets",
		blurb: "The CFDE Knowledge Center (KC) translates complex Common Fund data into highly curated biological insights using tailored visualizations to help researchers easily analyze genes, phenotypes, and pathways from across NIH Common Fund programs.",
		image: "https://cfde-drc.s3.amazonaws.com/assets/img/centers/KC.svg",
		link: "https://cfdeknowledge.org/r/kc_landing",
		width: "50%"
	},
	{
		name: "Cloud Workspace Implementation Center",
		hero: "Sign Up for Your Own CFDE Cloud Workspace",
		blurb: "The CFDE Cloud Workspace provides researchers with a free cloud computing platform that serves Galaxy to analyze and integrate large NIH Common Fund datasets using a variety of workflows.",
		image: "https://cfde-drc.s3.amazonaws.com/assets/img/centers/CWIC.png",
		link: "https://cfdeworkspace.org/",
		// width: 350,
    // height: 30,
	},
	{
		name: "Training Center",
		hero: "Acquire Skills in Using CFDE Datasets and Tools",
		blurb: "The CFDE Training Center is dedicated to expanding the user base of NIH Common Fund and CFDE resources by delivering educational and outreach activities such as workshops, competitions, hackathons, webinars, and podcasts.",
		image: "https://cfde-drc.s3.amazonaws.com/assets/img/centers/TC.svg",
		link: "https://orau.org/cfde-trainingcenter/",
		width: "60%"
	},
	{
		name: "Integration and Coordination Center",
		hero: "Learn How to Engage with the CFDE Consortium",
		blurb: "CFDE CONNECT is the Integration and Coordination Center (ICC) of the CFDE. The center is dedicated to organizing the CFDE consortium and for developing evaluation and sustainability methods for Common Fund programs and the CFDE.",
		image: "https://cfde-drc.s3.amazonaws.com/assets/img/centers/IC.png",
		link: "https://cfdeconnect.org/",
		// width: 210,
    // height: 50
	},
  {
    name: "Data Coordination Centers",
    hero: "Learn About the Participating Common Fund Programs",
    blurb: "Working alongside the CFDE Centers, the Data Coordination Centers implement shared data standards, metadata models, and FAIR (Findable, Accessible, Interoperable, and Reusable) principles across wide-ranging biomedical disciplines.",
    link: "https://cfde.cloud/info/dcc",
    image: "/img/cfde-noglow.png",
    width: "40%"
  }
]


export default function CFDEHero() {
  return (
    <Grid container>
      <Grid size={12}>    
        <Box 
          sx={{
            // minHeight: '80vh', 
            position: 'relative',
            background: 'linear-gradient(135deg, #071c30 0%, #10395c 50%, #0c233c 100%)',
            color: 'white',
            // py: 1,
            // px: 1,
            overflow: 'hidden',
            // borderBottomLeftRadius: { xs: 0, md: '16px' },
            // borderBottomRightRadius: { xs: 0, md: '16px' },
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            // Subtle dot grid background overlay
            backgroundImage: `
              linear-gradient(135deg, #071c30 0%, #113d63 50%, #0c233c 100%),
              radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: 'cover, 24px 24px',
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "0px",
              background: "radial-gradient(at 20% 110%, rgba(113, 135, 195, 0.55) 0%, rgba(113, 135, 195, 0) 55%), radial-gradient(at 85% 10%, rgba(0, 102, 102, 0.55) 0%, rgba(0, 102, 102, 0) 50%)"
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: "0px",
              backgroundImage: "radial-gradient(rgba(195, 225, 230, 0.28) 1px, transparent 1.4px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(at 70% 50%, rgb(0, 0, 0) 0%, transparent 70%)"
            }}
          />
          <Typography
            component="div"
            aria-hidden="true"
            sx={{
              position: 'absolute',
              left: '0.154em',
              bottom: "-0.071em",
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: "min(36.1cqw, 520px)",
              fontWeight: 800,
              lineHeight: 0.72,
              whiteSpace: "nowrap",
              background: "linear-gradient(90deg, rgb(51, 102, 153) 0%, rgb(113, 135, 195) 45%, rgb(195, 225, 230) 100%) padding-box text",
              color: 'transparent',
              opacity: 0.4,
              pointerEvents: 'none',
              letterSpacing: '-0.04em',
              zIndex: 1,
            }}
          >
            CFDE
          </Typography>
          <Box
            sx={{
              position: "relative",
              height: "clamp(72px, 6.67cqw, 96px)",
              padding: "0px clamp(24px, 8.33cqw, 120px)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Image src="/img/cfde-noglow.png" alt="cfde-logo" height={60} width={120} style={{
              filter: "brightness(0) invert(1)"
            }}/>
          </Box>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              minHeight: "clamp(420px, 43.3cqw, 624px)",
              alignItems: "center"
            }}
          >
            <Box
              sx={{
                flex: "13 1 560px",
                minWidth: 0,
                maxWidth: "820px",
                boxSizing: "border-box",
                padding: "clamp(0px, -100cqw + 1100px, 40px) clamp(0px, -100cqw + 1100px, 24px) clamp(48px, 8.33cqw, 120px) clamp(24px, 8.33cqw, 120px)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(20px, 1.95cqw, 28px)"
              }}
            >
              <Box 
                sx={{ 
                  width: '56px', 
                  height: '4px', 
                  bgcolor: 'rgb(165, 180, 219)', 
                  
                  borderRadius: '2px' 
                }} 
              />
              <Box sx={{display: "flex", flexDirection: "column"}}>
              <Typography 
                variant="h1" 
                sx={{ 
                  // fontSize: { xs: '2.25rem', sm: '3.5rem', md: '4rem' },
                  // fontWeight: 700,
                  fontSize: "clamp(38px, 5cqw, 72px)",
                  // lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  
                }}
              >
                The Common Fund
              </Typography>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  // fontSize: { xs: '2.25rem', sm: '3.5rem', md: '4rem' },
                  // fontWeight: 700,
                  color: '#93c5fd',
                  fontSize: "clamp(38px, 5cqw, 72px)",
                  // lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Data Ecosystem
              </Typography>
              </Box> 
            </Box>
            
          </Box>
        </Box>
      </Grid>
      <Grid sx={{
        padding: "clamp(64px, 7.8cqw, 112px) clamp(24px, 8.33cqw, 120px) clamp(72px, 8.33cqw, 120px)",
        display: "flex",
        flexDirection: "column"
      }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(20px, 4.4cqw, 64px)",
            alignItems: "flex-start"
          }}
        >
          <Typography color="primary" sx={{
              flex: "5 1 0px",
              minWidth: "min(100%, 320px)",
              margin: "0px",
              fontWeight: "400px",
              fontSize: "clamp(22px, 1.95cqw, 28px)",
              lineHeight: 1.36,
              color: "rgb(51, 102, 153)"
            }}>
              The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community.
            </Typography>
            <Typography color="primary" sx={{
              flex: " 7 1 0px",
              minWidth: "min(100%, 320px)",
              margin: "0px",
              fontSize: "16px",
              lineHeight: '26px',
              color: "rgb(41, 82, 122)"
            }}>
          However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery. The CFDE is structured around six centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.            </Typography>
        </Box>
        <Typography variant='h2'
          sx={{
            margin: "clamp(72px, 8.33cqw, 120px) 0px clamp(28px, 3.3cqw, 48px)",
            fontWeight: 600,
            fontSize: "clamp(30px, 2.8cqw, 40px)",
            lineHeight: 1.2,
            color: "rgb(51, 102, 153)"
          }}
        >
          The CFDE Centers
        </Typography>
        <Grid container spacing={2}>
          {centers.map(center=>(
            <Grid size={{xs:12, sm: 6, md: 4}} key={center.name}
              sx={{
                border: "1px solid rgb(219, 225, 241)",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
            >
              <Box sx={{
                height: "140px",
                background: "rgb(233, 232, 238)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
              }}>
                <Box sx={{
                  position: "relative",
                  width: center.width || '80%',
                  height: "140px"
                }}>
                  <Image
                    src={center.image} alt={center.name}
                    fill
                    style={{ objectFit: 'contain' }} // 'cover' or 'contain'
                  />
                  </Box>`
                {/* <Image src={center.image} alt={center.name} height={center.height || 60} width={center.width}/> */}
              </Box>
              <Box sx={{
                padding: "28px 28px 0px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                flex: "1 1 0%",
              }}>
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <Typography variant="h3"
                    sx={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "22px",
                      lineHeight: "28px",
                      color: "rgb(51, 102, 153)",
                    }}
                  >
                    {center.name}
                  </Typography>
                  <Typography variant="body1"
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "rgb(0, 102, 102)",
                    }}
                  >
                    {center.hero}
                  </Typography>
                </Box>
                <Typography variant="body1"
                    sx={{
                      margin: "0px",
                      fontSize: "15px",
                      lineHeight: "22px",
                      color: "rgb(41, 82, 122)",
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    {center.blurb}
                  </Typography>
              </Box>
              <Box sx={{
                padding: "20px 28px 28px",

              }}>
                <Link href={center.link} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgb(233, 232, 238)",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "rgb(51, 102, 153)",
                    textDecoration: "none",
                    justifyContent: "space-between"
                  }}
                >
                  {center.name === "Data Coordination Centers" ?
                  <Typography>View Participating Data Coordination Centers</Typography>:
                  <Typography>Go to {center.name} Portal</Typography>}
                  <span style={{
                    width: "32px",
                    height: "32px",
                    flex: "0 0 auto",
                    borderRadius: "50%",
                    background: "rgb(195, 225, 230)",
                    color: "rgb(41, 82, 122)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Icon path={mdiArrowTopRight} size={0.7}/>
                  </span>
                </Link>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
      
    </Grid>
  );
}