"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { PaginationItem } from "@mui/material";

interface PathwayTablePaginationProps {
  page: number;
  lowerBound: number;
  upperBound: number;
  disabled?: boolean;
  onChange?: (page: number) => void;
}

export default function PathwayTablePagination(cmpProps: PathwayTablePaginationProps) {
  const { page, lowerBound, upperBound, disabled, onChange } = cmpProps;
  const handleOnChange = (newPage: number) => {
    if (onChange !== undefined) {
      onChange(newPage);
    }
  }

  return (
    <ul>
      <PaginationItem key="pathway-pagination-prev" type="previous" disabled={disabled || page === lowerBound} slots={{ previous: ArrowBackIcon }} onClick={() => handleOnChange(page - 1)} />
      {
        Array((upperBound - lowerBound) + 1)
          .fill(0)
          .map((_, i) => {
            const p = i + lowerBound;
            return <PaginationItem key={"pathway-pagination-" + i} type="page" disabled={disabled} color="primary" shape="rounded" page={p} selected={p === page} onClick={() => handleOnChange(p)} />
          })
      }
      <PaginationItem key="pathway-pagination-next" type="next" slots={{ next: ArrowForwardIcon }} disabled={disabled || page === upperBound} onClick={() => handleOnChange(page + 1)} />
    </ul>
  )
}
