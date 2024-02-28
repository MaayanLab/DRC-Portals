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
          <br /> <br />
          These descriptions are intended to provide CFDE-partnered DCCs, other Common Fund (CF)
          programs, and the broader research community with documentation on standards 
          developed by the CFDE on annotating, querying, exploring, and evaluating 
          data, metadata, and tools for biomedical research. While many of these standards 
          were created within the context of the CFDE, they may be useful and generalizable
          to other researchers who are interested in using or interoperating with CF datasets, or 
          who are interested in improving the FAIRness of their resources. 
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
                ontologies, along with a single JSON schema. 
                <br /><br />
                Learn more about generating a C2M2 datapackage <Link 
                href="/info/standards/C2M2" rel="noopener" color="#3470e5">here</Link>.
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary>
              <Typography fontWeight="bold" color="#ffffff">RNA-seq Standard Pipeline</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The CFDE RNA-seq Partnership aims to harmonize diverse RNA-seq 
                datasets across the CFDE to improve their interoperability and 
                reusability for the broader scientific research community. To this 
                end, the partnership is developing common pipelines for both bulk 
                and single cell RNA-seq data analysis, with the end goal of building 
                a large, readily accessible, and harmonized resource of RNA-seq 
                datasets and processing tools from various DCCs and CFDE projects. 
                <br /><br />
                More information about the standardized bulk and single cell RNA-seq 
                pipelines will be available soon. 
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">OpenAPI & SmartAPI</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The OpenAPI specification allows for the standardization of 
                application programming interfaces (APIs), and facilitates 
                their interoperability. 
                <br /><br />
                The SmartAPI project builds on top of the OpenAPI specifications 
                to maximize the findability, accessibility, interoperability, 
                and reusability (FAIRness) of web-based tools, especially those 
                within the biomedical sphere. Through richer metadata descriptions, 
                SmartAPI enables users to search and use a connected network of tools. 
                <br /><br />
                Learn more about generating an OpenAPI or SmartAPI specification <Link
                href="/info/standards/OpenAPI" rel="noopener" color="#3470e5">here</Link>.
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">Knowledge Graph Assertions</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The CFDE Data Distillery Partnership aims to integrate data assertions 
                across DCCs into a functional knowledge graph for knowledge query 
                and discovery. The partnership has collected "distilled" data relationships 
                from each DCC to be unified in a knowledge graph model with controlled
                ontology and vocabulary terms for exploring pre-defined, biologically 
                relevant use cases. 
                <br /><br />
                Learn more about generating Data Distillery Knowledge Graph Assertions <Link
                href="/info/standards/KGAssertions" rel="noopener" color="#3470e5">here</Link>.
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">FAIR Evaluations with FAIRshake</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The FAIRshake toolkit enables manual and automated assessments of 
                the findability, accessibility, interoperability, and reusability 
                (FAIRness) of digital resources. FAIRshake provides community-driven 
                metrics and rubrics for evaluation, and visualizes the results with 
                a characteristic embeddable insignia. The primary goal of FAIRshake 
                is to enable researchers and developers to objectively measure and 
                improve the FAIRness of their tools. 
                <br /><br />
                Learn more about performing FAIR assessments with FAIRshake <Link
                href="/info/standards/FAIRshake" rel="noopener" color="#3470e5">here</Link>. 
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>

          <StyledAccordion >
            <StyledAccordionSummary >
                <Typography fontWeight="bold" color="#ffffff">Playbook Metanodes</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails >
              <Typography sx={{m:2}} color="#666666">
                The Playbook Partnership Workflow Builder (PPWB) is a web-based 
                knowledge resolution platform being developed by the CFDE Workflow 
                Playbook Partnership and consisting of a growing network of datasets, 
                semantically annotated API endpoints, and visualization tools 
                from across the CFDE. Users can construct workflows from the individual building blocks, 
                termed "metanodes", with little effort or technical expertise 
                required. 
                <br /><br />
                Learn more about building PWB metanodes <Link
                href="/info/standards/PWBMetanodes" rel="noopener" color="#3470e5">here</Link>.
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>
      </Grid>
    </Grid>   
  )
}