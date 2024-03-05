"use client";
import { Typography } from "@mui/material";
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
            <button
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
              <div
                data-te-chip-init
                data-te-ripple-init
                className="dcc-button fit-content [word-wrap: break-word] my-[5px] mx-[5px] flex h-[60px] cursor-pointer items-center justify-between rounded-[16px] bg-[#eeeeee] px-[12px] py-0 text-[13px] font-normal normal-case leading-loose text-[#4f4f4f] shadow-none transition-[opacity] duration-300 ease-linear hover:!shadow-none active:bg-[#cacfd1]"
                key={dcc.id}
              >
                <img
                  className="max-w-12 max-h-10"
                  alt={dcc.id}
                  width={"100%"}
                  height={"100%"}
                  src={dcc.icon as string}
                />
              </div>
            </button>
          ))
        ) : (
          <></>
        )}{" "}
      </div>
    </>
  );
}
