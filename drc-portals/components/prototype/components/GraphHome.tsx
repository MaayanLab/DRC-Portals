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

import { NodeResult } from "@/lib/neo4j/types";
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
      "Enter a keyword (e.g., human, blood, asthma) to discover entities.",
  },
  {
    label: "Explore",
    image: "/img/graph/GQI_carousel_2.png",
    description:
      "Use node menu options — Expand, Filter, Prune — to build your query one step at a time.",
  },
  {
    label: "View/Download",
    image: "/img/graph/GQI_carousel_3.png",
    description:
      "See results in Tabular or Network View, and export them as JSON to share, revisit, or analyze further.",
  },
];

export default function GraphHome() {
  const router = useRouter();

  const onSearchBarSubmit = (cvTerm: NodeResult) => {
    const href = `/data/graph/search?id=${encodeURIComponent(cvTerm.uuid)}&labels=${encodeURIComponent(":" + cvTerm.labels.join(":"))}`
    router.push(href)
  }

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
            <Box alignItems={"center"}>
              <Stack
                spacing={2}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <div className="bg-red-300 p-4">Due to unforseen circumstances the C2M2 Graph Search is currently down. We're working hard to bring it back soon.</div>
                <Typography color="secondary" className="text-center" variant="h1">C2M2 GRAPH SEARCH</Typography>

                <Box>
                  <PathwaySearchBar onSubmit={onSearchBarSubmit} />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Carousel
                    autoPlay={false}
                    cycleNavigation={false}
                    indicators={true}
                    navButtonsAlwaysVisible={true}
                    sx={{
                      minHeight: 300,
                      minWidth: { xs: 350, sm: 600, md: 800, lg: 800, xl: 800 },
                    }}
                  >
                    {GRAPH_QUERY_TOOLS.map((tool, i) => (
                      <Container key={i} maxWidth="lg">
                        <Typography variant="h3" color="secondary">
                          Graph Query Tips
                        </Typography>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1">
                            <strong>Step {i + 1}. </strong><em>{tool.label}: </em>{tool.description}
                          </Typography>
                        </Stack>
                        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
                          <Box
                            sx={{
                              minHeight: { xs: 150, sm: 150, md: 250, lg: 250, xl: 250 },
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
                              sx={{ minHeight: 250, boxShadow: "none", background: "#FFF" }}
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
                      </Container>
                    ))}
                  </Carousel>
                </Box>

                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-evenly" }}>
                  <Link href="/data/graph/help">
                    <Button
                      sx={{ textTransform: "uppercase" }}
                      color="secondary"
                    >
                      Quickstart Guide
                    </Button>
                  </Link>
                  <Link href="/data/documentation/gqi">
                    <Button
                      sx={{ textTransform: "uppercase" }}
                      color="secondary"
                    >
                      Documentation
                    </Button>
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Container>
        </Paper>
      </Grid>
    </Grid>
  );
}
