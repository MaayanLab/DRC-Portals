import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import { Box, Grid, Stack } from "@mui/material";
import Image from "next/image";

type dccsInfoType = {
  shortName: string;
  longName: string;
  imgString: string;
};

export const dccInfo: dccsInfoType[] = [
  {
    shortName: "Metabolomics",
    longName: "Metabolomics",
    imgString: "/img/Metabolomics.png",
  },
  {
    shortName: "GlyGen",
    longName: "GlyGen",
    imgString: "/img/glygen.png",
  },
  {
    shortName: "LINCS",
    longName: "Library of Integrated Network-based Cellular Signatures",
    imgString: "/img/lincs.png",
  },
  {
    shortName: "KOMP2",
    longName: "Knockout Mouse Phenotyping Program",
    imgString: '/img/KOMP2.png',
  },
  {
    shortName: "GTEx",
    longName: "Genotype Tissue Expression",
    imgString: '/img/GTEx.png',
  },
  {
    shortName: "IDG",
    longName: "Illuminating the Druggable Genome",
    imgString: "/img/IDG.png",
  },
  {
    shortName: "MoTrPAC",
    longName: "Molecular Transducers of Physical Activity Consortium",
    imgString: "/img/MoTrPAC.png",
  },
  {
    shortName: "HuBMAP",
    longName: "The Human BioMolecular Atlas Program",
    imgString: "/img/HuBMAP.png",
  },
];

export const CFDEDCCOptions = Object.fromEntries(
  Object.entries({
    "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures": "LINCS",
    "GTEx Tissue Gene Expression Profiles": "GTEx",
    "Metabolomics Gene-Metabolite Associations": "Metabolomics",
    "IDG Drug Targets": "IDG",
    "Glygen Glycosylated Proteins": "GlyGen",
    "KOMP2 Mouse Phenotypes": "KOMP2",
    "MoTrPAC Rat Endurance Exercise Training": "MoTrPAC",
    "Human BioMolecular Atlas Program Azimuth": "HuBMAP",
  }).map(([key, value]) => [value, key])
);

const CustomCard = ({
  image,
  title,
  subtitle,
  selected,
  handleClick,
}: {
  image: string;
  title: string;
  subtitle: string;
  selected: string[];
  handleClick?: Function;
}) => (
  <Card
    sx={{
      flexShrink: 0,
      height: "100px",
      // width: '120px',
      width: `calc(80% / ${8})`,
      margin: 1,
      backgroundColor: selected.includes(title) ? "lightblue" : "white",
    }}
    onClick={handleClick ? () => handleClick(title) : undefined}
  >
    <CardActionArea>
      <CardMedia sx={{ position: "relative", height: "90px" }}>
        <Image
          src={image}
          fill
          alt=""
          style={{ padding: "10%", objectFit: "contain" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </CardMedia>
    </CardActionArea>
  </Card>
);

export const DCCIcons = ({
  selected,
  setSelected,
  selectedLibs,
  setSelectedLibs,
}: {
  selected: string[];
  setSelected?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLibs?: string[];
  setSelectedLibs?: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  function handleClick(lib: string) {
    // setLibrary(event.target.value as string);
    const newArr = selectedLibs ? [...selectedLibs] : [];
    const newArrDCCs = selected ? [...selected] : [];
    if (selectedLibs) {
      if (selectedLibs[0] == "") {
        newArr.splice(0, 1, CFDEDCCOptions[lib]);
        newArrDCCs.splice(0, 1, lib);
      } else {
        newArr.splice(1, 1, CFDEDCCOptions[lib]);
        newArrDCCs.splice(1, 1, lib);
      }
    }
    if (setSelectedLibs) setSelectedLibs(newArr);
    if (setSelected) setSelected(newArrDCCs);
    console.log(selected, selectedLibs);
  }
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        spacing={0.5}
        width={"100%"}
      >
        {dccInfo.map((dcc, i) => (
          <CustomCard
            key={dcc.shortName}
            image={dcc.imgString}
            title={dcc.shortName}
            subtitle={dcc.longName}
            selected={selected}
            handleClick={handleClick}
          />
        ))}
      </Stack>
    </Box>
  );
};