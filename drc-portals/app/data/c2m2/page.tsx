import Link from "@/utils/link";
import { Grid,
  Container, 
  Stack, 
  Typography, 
  Button, 
  Box,
 } from '@mui/material'
import CustomTooltip from "@/components/misc/CustomTooltip";
import Icon from "@mdi/react"
import { mdiArrowRight } from '@mdi/js';
import { SearchForm, SearchField } from "@/app/data/c2m2/SearchField";

export default async function Home({ searchParams }: { searchParams: { search?: string, error?: string } }) {
  return (
    <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={2} alignItems={"center"}>
        <Grid item xs={12}>
          <SearchForm>
            <Stack spacing={2} justifyContent={"center"} alignItems={"center"}>
              <Typography color="secondary" className="text-center" variant="h1">CFDE DATA PORTAL</Typography>
              <Typography color="secondary" className="text-center" sx={{ fontSize: 20 }} variant="body1">
                Search Common Fund Programs'&nbsp;
                <CustomTooltip
                  title="C2M2 model information"
                  imgSrc="/img/C2M2_NEO4J_level0.jpg"
                  imgAlt="Crosscut Metadata (C2M2)"
                  text="The Crosscut Metadata Model (C2M2) is a flexible metadata standard for describing experimental resources in biomedicine and related fields. Click to find more about C2M2.">
                  <Link href="/data/documentation/C2M2" key="Metadata" color="secondary" className="underline cursor-pointer secondary" target="_blank" rel="noopener noreferrer">
                    Metadata
                  </Link>
                </CustomTooltip>
                &nbsp;and&nbsp; 
                <CustomTooltip
                  title="Processed data information"
                  imgSrc="/img/Processed_Data_Matrix_Tooltip.JPG"
                  imgAlt="Processed Datasets"
                  text="Processed data includes C2M2 metadata data packages, gene and other entity set libraries (XMTs), knowledge graph (KG) assertions, and attribute tables. Click to find more about processed datasets.">
                  <Link href="/data/matrix" key="Processed" color="secondary" className="underline cursor-pointer secondary" target="_blank" rel="noopener noreferrer">
                    Processed Datasets
                  </Link>
                </CustomTooltip>.
              </Typography>
              <Box>
                <SearchField
                  defaultValue={searchParams.search ?? ''}
                  error={searchParams.error}
                  InputProps={{
                    sx: {width:{xs: '270px', sm: '270px', md: '544px', lg: '544px', xl: '544px'} }
                  }}
                />
              </Box>
              <Typography variant="stats_sub" sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
                Try <Stack display="inline-flex" flexDirection="row" divider={<span>,&nbsp;</span>}>
                  {['STAT3', 'blood', 'dexamethasone'].map(example => (
                    <Link key={example} href={`/data/c2m2/search/${encodeURIComponent(example)}`} className="underline cursor-pointer">{example}</Link>
                  ))}
                </Stack>
              </Typography>
              <Typography variant="stats_sub_small" sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
                Try <Stack display="inline-flex" flexDirection="row" divider={<span>,&nbsp;</span>}>
                  {['STAT3', 'blood', 'dexamethasone'].map(example => (
                    <Link key={example} href={`/data/c2m2/search/${encodeURIComponent(example)}`} className="underline cursor-pointer">{example}</Link>
                  ))}
                </Stack>
              </Typography>
              <div className="flex align-center space-x-10">
                <Link href="/data/processed/help"><Button sx={{textTransform: 'uppercase'}} color="secondary">Learn More</Button></Link>
                <Button sx={{textTransform: 'uppercase'}} variant="contained" color="primary" endIcon={<Icon path={mdiArrowRight} size={1}/>} type="submit">Search</Button>
              </div>
            </Stack>
          </SearchForm>
        </Grid>
      </Grid>
    </Container>

  )
}



