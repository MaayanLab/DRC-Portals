import { Grid, Typography, Link } from "@mui/material";
import { StyledAccordion, StyledAccordionSummary, StyledAccordionDetails } from "@/components/misc/StyledAccordion";

export default function Standards() {
  return (
    <Grid container direction="row">
      <Grid item xs={12} >
        <Typography sx={{ml:3, mt:2, color: "secondary.dark"}} variant="h2">
          Standards & Protocols
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ml:3, mt:2}} fontSize="12pt" color="#666666">
          This page contains descriptions of common standards, protocols, and other assets
          generated from any of the CFDE partnered Data Coordination Centers (DCCs), 
          partnership activities, or the Data Resource Center (DRC) and Knowledge Center (KC).
        </Typography>
      </Grid>
      <Grid item xs={12} sx={{mt:3, mb:4}}>
          <StyledAccordion >
            <StyledAccordionSummary>
              <Typography fontWeight="bold" color="#ffffff">C2M2</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The Crosscut Metadata Model (C2M2) was designed to standardize 
                metadata annotations across Common Fund DCCs by the original CFDE 
                Coordination Center. C2M2 datapackage files are usually a zipfile 
                containing a set of TSV files already standardized to a set of known 
                ontologies, along with a single JSON schema. </Typography>
              <Typography sx={{m:2}} color="#666666">
                The most current version of the C2M2 JSON schema can be 
                accessed <Link color="#3470e5" href="https://osf.io/c63aw/" 
                target="_blank" rel="noopener">here</Link>.
                <br /><br />
                Learn more about the C2M2 technical specifications <Link 
                href="/info/standards/c2m2" rel="noopener" color="#3470e5">here</Link>.
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary>
              <Typography fontWeight="bold" color="#ffffff">RNA-seq Standard Pipeline</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                Test
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">OpenAPI</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                Test
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">Knowledge Graph Assertions</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                Test
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">FAIR Evaluations with FAIRshake</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                Test
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">Playbook Metanodes</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                Test
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>
      </Grid>
    </Grid>   
  )
}