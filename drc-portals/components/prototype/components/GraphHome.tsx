"use client";

import {
  Grid,
  Container,
  Stack,
  Typography,
  Paper,
  Box,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import Carousel from "react-material-ui-carousel";

import { BlurBig } from "@/components/styled/Blur";
import Image from "@/utils/image";
import Link from "@/utils/link";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";


interface Tool {
  label: string;
  description?: string;
  image?: string;
  icon?: string;
  shortDescription?: string;
}

const GRAPH_QUERY_TOOLS: Tool[] = [
  {
    label: "Search",
    image: "/img/graph/GQI_carousel_1.png",
    description:
      "Enter a keyword (e.g., human, blood, asthma, RNA-seq, TP53, aspirin) to search ontology-encoded metadata, such as species, anatomy, disease/phenotype, gene, compound, and assay, to discover entities like Subject, Biosample, and File.",
  },
  {
    label: "Explore",
    image: "/img/graph/GQI_carousel_2.png",
    description:
      "Use node menu options (point the cursor/mouse to a node) — Expand (to explore related entities), Filter (to narrow by values), and Prune (to trim paths) — to build your query one step at a time.",
  },
  {
    label: "View/Download",
    image: "/img/graph/GQI_carousel_3.png",
    description:
      "See results in Tabular or Network View, and export them as JSON to share, revisit, or analyze further.",
  },
];

const CarouselCard = ({ tool }: { tool: Tool }) => (
  <Box
    sx={{
      minHeight: { xs: 150, sm: 150, md: 300, lg: 300, xl: 300 },
      width: { xs: 300, sm: 300, md: 640, lg: 640, xl: 640 },
      textAlign: "center",
      border: 1,
      borderRadius: 5,
      borderColor: "rgba(81, 123, 154, 0.5)",
      padding: 2,
    }}
  >
    <Box
      className="flex flex-col"
      sx={{ minHeight: 300, boxShadow: "none", background: "#FFF" }}
    >
      <div className="flex grow items-center justify-center relative">
        <Image
          src={tool.image || tool.icon || "/img/favicon.png"}
          alt={tool.label}
          fill={true}
          style={{ objectFit: "contain" }}
        />
      </div>
    </Box>
  </Box>
);

const ClientCarousel = ({
  children,
  title,
  height,
}: {
  children: React.ReactNode;
  title?: string;
  height?: number;
}) => {
  return (
    <Stack spacing={1} alignItems={"center"}>
      {title && (
        <Typography variant="subtitle2" color="secondary">
          {title}
        </Typography>
      )}
      <div style={{ position: "relative" }}>
        <Carousel
          height={height || 370}
          sx={{
            minHeight: { xs: 350, sm: 400, md: 350, lg: 350, xl: 350 },
            width: "100vw",
          }}
          indicators={true}
        >
          {children}
        </Carousel>
      </div>
    </Stack>
  );
};

export default function GraphHome() {
  const router = useRouter();

  return (
    <Grid container alignItems={"flex-start"} justifyContent={"center"}>
      <Grid item xs={12}>
        <Paper
          sx={{
            boxShadow: "none",
            width: "100vw",
            minHeight: 560,
            marginLeft: "calc((-100vw + 100%) / 2)",
            marginRight: "calc((-100vw + 100%) / 2)",
            position: "relative",
            overflow: "hidden",
          }}
          className="flex"
        >
          <BlurBig
            sx={{ position: "absolute", left: "-20%" }}
            className="pointer-events-none"
          />
          <BlurBig
            sx={{ position: "absolute", right: "-15%" }}
            className="pointer-events-none"
          />
          <Container maxWidth="lg" className="m-auto">
            <Grid container spacing={2} alignItems={"center"}>
              <Grid item xs={12}>
                <Stack
                  spacing={4}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Typography color="secondary" className="text-center" variant="h1">C2M2 GRAPH SEARCH</Typography>

                  <Box>
                    <PathwaySearchBar onSubmit={
                      (cvTerm) => router.push(`/data/graph/search?q=${encodeURI(btoa(JSON.stringify(cvTerm)))}`)} />
                  </Box>

                  <div className="flex align-center space-x-10">
                    <Link href="/data/graph/help">
                      <Button
                        sx={{ textTransform: "uppercase" }}
                        color="secondary"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>

                  <ClientCarousel title="">
                    {GRAPH_QUERY_TOOLS.map((tool, i) => (
                      <Container key={i} maxWidth="lg">
                        <Grid container spacing={2}>
                          <Grid
                            item
                            xs={12}
                            sm={7}
                            sx={{
                              display: {
                                xs: "block",
                                sm: "block",
                                md: "none",
                                lg: "none",
                                xl: "none",
                              },
                            }}
                          >
                            <CarouselCard tool={tool} />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <Stack
                              direction="column"
                              alignItems="flex-start"
                              spacing={2}
                              sx={{ height: "90%" }}
                            >
                              <Typography variant="h3" color="secondary.dark">
                                {tool.label}
                              </Typography>
                              <Typography variant="subtitle1">
                                {tool.description}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            sm={7}
                            sx={{
                              display: {
                                xs: "none",
                                sm: "none",
                                md: "block",
                                lg: "block",
                                xl: "block",
                              },
                            }}
                          >
                            <CarouselCard tool={tool} />
                          </Grid>
                        </Grid>
                      </Container>
                    ))}
                  </ClientCarousel>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Grid>
    </Grid>
  );
}
