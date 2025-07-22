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
    label: "Step 1: Search",
    image: "/img/graph/GQI_carousel_1.png",
    description:
      "Enter a keyword (e.g., human, blood, asthma) to discover entities.",
  },
  {
    label: "Step 2: Explore",
    image: "/img/graph/GQI_carousel_2.png",
    description:
      "Use node menu options — Expand, Filter, Prune — to build your query one step at a time.",
  },
  {
    label: "Step 3: View/Download",
    image: "/img/graph/GQI_carousel_3.png",
    description:
      "See results in Tabular or Network View, and export them as JSON to share, revisit, or analyze further.",
  },
];

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
          <Container maxWidth="lg" className="m-auto">
            <Grid container spacing={2} alignItems={"center"}>
              <Grid item xs={12}>
                <Stack
                  spacing={2}
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
                        Quickstart
                      </Button>
                    </Link>

                    <Link href="/info/documentation/gqi">
                      <Button
                        sx={{ textTransform: "uppercase" }}
                        color="secondary"
                      >
                        Documentation
                      </Button>
                    </Link>
                  </div>

                  <Box sx={{width: "100%"}}>
                    <Carousel
                      autoPlay={false}
                      cycleNavigation={false}
                      indicators={true}
                      navButtonsAlwaysVisible={true}
                      sx={{
                        minHeight: 350,
                        minWidth: { xs: 350, sm: 600, md: 800, lg: 800, xl: 800 },
                      }}
                    >
                      {GRAPH_QUERY_TOOLS.map((tool, i) => (
                        <Container key={i} maxWidth="lg">
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={5}>
                              <Stack spacing={2}>
                                <Typography variant="h3" color="secondary.dark">
                                  {tool.label}
                                </Typography>
                                <Typography variant="subtitle1">
                                  {tool.description}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={7}>
                              <Box sx={{display: "flex", justifyContent: "center"}}>
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
                              </Box>
                            </Grid>
                          </Grid>
                        </Container>
                      ))}
                    </Carousel>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Grid>
    </Grid>
  );
}
