"use client";

import { useState } from "react";
import Box from "@mui/material/Box";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HubIcon from "@mui/icons-material/Hub";

import QueryTab from "./QueryTab";
import TemplatesTab from "./TemplatesTab";
import SchemaTab from "./SchemaTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box sx={{ pt: 3, width: "100%" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TabsContainer() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const tabs = [
    {
      label: "Query",
      icon: MessageIcon,
      component: QueryTab,
    },
    {
      label: "Templates",
      icon: AssignmentIcon,
      component: TemplatesTab,
    },
    {
      label: "Schema",
      icon: HubIcon,
      component: SchemaTab,
    },
  ];

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="main tabs">
          {tabs.map(({ label, icon: Icon }, index) => (
            <Tab
              key={label}
              label={label}
              icon={<Icon />}
              aria-label={label.toLowerCase()}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map(({ label, component: Component }, index) => (
        <TabPanel key={label} value={tabIndex} index={index}>
          <Component />
        </TabPanel>
      ))}
    </>
  );
}
