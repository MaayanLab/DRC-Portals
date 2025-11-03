"use client";

import Autocomplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import {
  debounce,
  Box,
  InputAdornment,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchCVTerms } from "@/lib/neo4j/api";
import { CVTermsResult, NodeResult } from "@/lib/neo4j/types";

import { createNodeElement } from "../../utils/shared";

interface PathwaySearchBarProps {
  onSubmit: (cvTerm: NodeResult) => void;
}

export default function PathwaySearchBar(cmpProps: PathwaySearchBarProps) {
  const { onSubmit } = cmpProps;
  const [filter, setFilter] = useState<string>("");
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const listboxRef = useRef<Element>();
  const optionsExhaustedRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());
  const cvTermsMap = useRef(new Map<string, [string, NodeResult]>());
  const OPTION_FETCH_LIMIT = 15;

  const abortCVTermRequest = () => {
    const abortController = abortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort("Cancelling previous CV terms request (if any).");
      abortControllerRef.current = new AbortController();
    }
  };

  const fetchOptions = async (
    input: string,
    page: number
  ): Promise<CVTermsResult[]> => {
    const response = await fetchCVTerms(input, page * OPTION_FETCH_LIMIT, {
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  };

  const replaceOptions = useMemo(
    () =>
      debounce(async (input: string, page: number) => {
        if (input.length === 0) {
          setOptions([]);
          return;
        }

        abortCVTermRequest(); // Any time we send a new request, abort the previous request if it's still pending
        setError(null);
        setLoading(true);
        optionsExhaustedRef.current = false;

        const abortController = abortControllerRef.current;
        try {
          const data: CVTermsResult[] = await fetchOptions(input, page);

          if (data.length === 0) {
            optionsExhaustedRef.current = true;
            return;
          }

          cvTermsMap.current.clear();
          data.forEach((row) => {
            cvTermsMap.current.set(row.cvTerm.properties.name || "Unknown", [
              row.synonym,
              row.cvTerm,
            ]);
          });
          setOptions(Array.from(cvTermsMap.current.keys()));
        } catch (error) {
          // Only set an error if it wasn't because we manually aborted the request
          if (!abortController.signal.aborted) {
            console.error(error);
            setError(
              `An error occurred fetching options for ${input}. Please try again later.`
            );
          }
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  const extendOptions = useCallback(
    async (input: string, page: number) => {
      abortCVTermRequest(); // Any time we send a new request, abort the previous request if it's still pending
      setError(null);

      const abortController = abortControllerRef.current;
      try {
        const data = await fetchOptions(input, page);

        if (data.length === 0) {
          optionsExhaustedRef.current = true;
          return;
        }

        data.forEach((row) => {
          cvTermsMap.current.set(row.cvTerm.properties.name || "Unknown", [
            row.synonym,
            row.cvTerm,
          ]);
        });

        setOptions((prev) => {
          return [
            ...prev,
            ...data.map((row) => row.cvTerm.properties.name || "Unknown"), // Add the new options
          ];
        });
      } catch (error) {
        // Only set an error if it wasn't because we manually aborted the request
        if (!abortController.signal.aborted) {
          console.error(error);
          setError(
            `An error occurred fetching options for ${input}. Please try again later.`
          );
        }
        setOptions([]);
      }
    },
    [fetchOptions]
  );

  const submit = (cvTerm: NodeResult | undefined) => {
    if (cvTerm !== undefined) {
      onSubmit(cvTerm);
    }
  };

  const clearInput = () => {
    setFilter("");
    setOptions([]);
  };

  const handleScroll = useMemo(
    () =>
      debounce(() => {
        if (listboxRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = listboxRef.current;
          const nearBottom = scrollHeight - scrollTop - clientHeight < 50;

          if (nearBottom && !optionsExhaustedRef.current) {
            setPage((prev) => prev + 1);
          }
        }
      }, 500),
    []
  );

  const teardownScrollListener = useCallback(() => {
    if (listboxRef.current) {
      listboxRef.current.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const setupScrollListener = useCallback(() => {
    // Remove the previous listener if any
    teardownScrollListener();

    // Wait for listbox to render
    setTimeout(() => {
      const listbox = document.querySelector(".MuiAutocomplete-listbox");
      if (listbox) {
        listboxRef.current = listbox;
        listbox.addEventListener("scroll", handleScroll);
      }
    });
  }, [handleScroll]);

  // Attach scroll listener when dropdown opens
  const handleOnOpen = useCallback(() => {
    setOpen(true);
    setupScrollListener();
  }, [setupScrollListener]);

  const handleOnClose = () => {
    setOpen(false);
  };

  const handleOnInputChange = (
    event: SyntheticEvent,
    input: string,
    reason: string
  ) => {
    setFilter(input);
    setPage(0);
    replaceOptions(input, 0);
  };

  const handleRenderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label='Enter a keyword ("diabetes", "human", etc...)'
        helperText={error}
        error={error !== null}
        InputProps={{
          ...params.InputProps,
          sx: {
            backgroundColor: "#FFF",
          },
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{ position: "absolute", right: "7px" }}
            >
              {loading ? (
                <CircularProgress color="inherit" size={20} />
              ) : filter.length > 0 ? (
                <IconButton size="small" title="Clear" onClick={clearInput}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              ) : (
                <IconButton title="Search" disabled>
                  <SearchIcon fontSize="inherit" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    ),
    [loading, error, filter]
  );

  const getOptionLabel = (option: string) => {
    const synonymAndTerm = cvTermsMap.current.get(option);
    const synonymName =
      synonymAndTerm !== undefined ? synonymAndTerm[0] : "Unknown";
    return option === synonymName ? (
      option
    ) : (
      <>
        {synonymName} <em>({option})</em>
      </>
    );
  };

  const handleRenderOption = (
    props: any,
    option: string,
    state: AutocompleteRenderOptionState
  ) => {
    const { key, ...optionProps } = props;
    const synonymAndTerm = cvTermsMap.current.get(option);
    const label =
      synonymAndTerm !== undefined
        ? synonymAndTerm[1].labels[0] || "Unknown"
        : "Unknown";

    return (
      <Box
        key={key}
        component="li"
        sx={{ display: "flex" }}
        {...optionProps}
        onClick={(event: MouseEvent) => {
          const synonymAndTerm = cvTermsMap.current.get(option);
          submit(
            synonymAndTerm !== undefined ? synonymAndTerm[1] : undefined
          );
          optionProps.onClick(event);
        }}
      >
        <Box
          display="flex"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box>{getOptionLabel(option)}</Box>
          <Box>{createNodeElement(label)}</Box>
        </Box>
      </Box>
    );
  };

  // Add new options any time the page changes
  useEffect(() => {
    if (page === 0) {
      replaceOptions(filter, page);
    } else {
      extendOptions(filter, page);
    }
  }, [page]);

  useEffect(() => {
    // The listbox is replaced any time options changes, so recreate the listener accordingly
    setupScrollListener();
  }, [options]);

  // Clean up
  useEffect(() => {
    return () => {
      // Make sure any open requests are canceled if the component is unmounted
      abortCVTermRequest();

      // Clean up scroll listener
      teardownScrollListener();
    };
  }, []);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      openOnFocus={true}
      options={options}
      loading={loading}
      open={open}
      inputValue={filter}
      onOpen={handleOnOpen}
      onClose={handleOnClose}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderOption={handleRenderOption}
      filterOptions={(x) => x}
      ListboxProps={{
        style: {
          maxHeight: "280px",
        },
      }}
      sx={{
        borderRadius: "4px",
        width: "auto",
        minWidth: "480px",
        backgroundColor: "transparent",
        "& .MuiOutlinedInput-root": {
          paddingRight: "120px!important",
        },
      }}
    />
  );
}
