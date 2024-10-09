import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { FormControl, InputLabel } from "@mui/material";

import { useState } from "react";

import {
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  COMPOUND_LABEL,
  DCC_LABEL,
  DISEASE_LABEL,
  NCBI_TAXONOMY_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
} from "@/lib/neo4j/constants";

const LABEL_VALUES_MAP: ReadonlyMap<string, string[]> = new Map([
  [ANATOMY_LABEL, ["blood plasma", "brain ventricle", "saliva"]],
  [
    DCC_LABEL,
    [
      "4D NUCLEOME DATA COORDINATION AND INTEGRATION CENTER",
      "UCSD Metabolomics Workbench",
      "GlyGen",
      "HuBMAP",
      "The Gabriella Miller Kids First Pediatric Research Program",
      "Stimulating Peripheral Activity to Relieve Conditions",
      "The Extracellular Communication Consortium Data Coordination Center",
      "MoTrPAC Molecular Transducers of Physical Activity Consortium",
      "Genotype-Tissue Expression Project",
      "The Human Microbiome Project",
      "Illuminating the Druggable Genome",
      "Library of Integrated Network-based Cellular Signatures",
    ],
  ],
  [
    SUBJECT_RACE_LABEL,
    [
      "American Indian or Alaska Native",
      "Asian",
      "Asian or Pacific Islander",
      "Black or African American",
      "Native Hawaiian or Other Pacific Islander",
      "White",
      "Other",
    ],
  ],
  [SUBJECT_SEX_LABEL, ["Male", "Female", "Intersex", "Indeterminate"]],
  [NCBI_TAXONOMY_LABEL, ["Homo sapiens"]],
  [DISEASE_LABEL, ["Alzheimer's disease", "breast cancer"]],
  [COMPOUND_LABEL, ["Tamoxifen"]],
  [ASSAY_TYPE_LABEL, ["exome sequencing assay", "small RNA sequencing assay"]],
]);

interface NodeFilterSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function NodeFilterSelect(cmpProps: NodeFilterSelectProps) {
  const { label, onChange } = cmpProps;
  const [value, setValue] = useState<string>(cmpProps.value || "");
  const labelId = `node-filter-select-${label}`;
  const items = LABEL_VALUES_MAP.get(label) || [];

  const handleSelectChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };

  return items.length > 0 ? (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={handleSelectChange}
      >
        <MenuItem key="None" value={""}>
          --
        </MenuItem>
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null;
}
