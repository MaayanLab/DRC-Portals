"use client";

import { Tabs } from "@mui/base/Tabs";
import HubIcon from "@mui/icons-material/Hub";
import TextFieldsIcon from "@mui/icons-material/TextFields";

import { Tab, TabPanel, TabsList } from "../constants/advanced-search";

import AdvancedSchemaSearch from "./AdvancedSearch/AdvancedSchemaSearch";
import AdvancedSynonymSearch from "./AdvancedSearch/AdvancedSynonymSearch";

export default function AdvancedSearch() {
  return (
    <Tabs defaultValue={0}>
      <TabsList>
        <Tab value={0}>
          Text Search <TextFieldsIcon sx={{ marginLeft: 1 }} />
        </Tab>
        <Tab value={1}>
          Schema Search <HubIcon sx={{ marginLeft: 1 }} />
        </Tab>
      </TabsList>
      <TabPanel value={0}>
        <AdvancedSynonymSearch></AdvancedSynonymSearch>
      </TabPanel>
      <TabPanel value={1}>
        <AdvancedSchemaSearch></AdvancedSchemaSearch>
      </TabPanel>
    </Tabs>
  );
}
