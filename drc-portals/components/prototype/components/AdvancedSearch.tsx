"use client";

import { Tabs } from "@mui/base/Tabs";
import HubIcon from "@mui/icons-material/Hub";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { useSearchParams } from "next/navigation";

import { Tab, TabPanel, TabsList } from "../constants/advanced-search";

import SchemaSearch from "./AdvancedSearch/SchemaSearch";
import TextSearch from "./AdvancedSearch/TextSearch";

export default function AdvancedSearch() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.has("q") || searchParams.has("as_q") || searchParams.size === 0
      ? 0
      : 1;

  return (
    <Tabs defaultValue={initialTab}>
      <TabsList>
        <Tab value={0}>
          Text Search <TextFieldsIcon sx={{ marginLeft: 1 }} />
        </Tab>
        <Tab value={1}>
          Schema Search <HubIcon sx={{ marginLeft: 1 }} />
        </Tab>
      </TabsList>
      <TabPanel value={0}>
        <TextSearch></TextSearch>
      </TabPanel>
      <TabPanel value={1}>
        <SchemaSearch></SchemaSearch>
      </TabPanel>
    </Tabs>
  );
}
