"use client";
import { Typography, Button, Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import React from "react";
import { DCC } from "@prisma/client";

export default function DccIcons({ submit }: { submit: Function }) {
  const [dccs, setDccs] = useState<null | DCC[]>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/chat/dccInfo");
      const data = await response.json();
      setDccs(data.dccs);
    };
    fetchData();
  }, []);

  return (
    <>
      <Typography variant="body1" color="secondary" className="text-center">
        Learn about the Common Fund Programs:
      </Typography>

      <div className="flex flex-wrap items-center justify-center">
        {" "}
        {dccs ? (
          dccs.map((dcc) => (
            <Button
              onClick={() => {
                submit({
                  role: "user",
                  content: `Can you tell me about the ${dcc.label} (${dcc.short_label}) DCC?`,
                  output: null,
                  options: null,
                  args: null,
                });
              }}
              
              key={dcc.id}
            >
              <Box sx={{width: 75, height: 75, position: "relative", margin: 1}}>
                <Image src={dcc.icon || ''} alt={dcc.label} fill={true} style={{objectFit: "contain"}}/>
              </Box>
            </Button>
          ))
        ) : (
          <></>
        )}{" "}
      </div>
    </>
  );
}
