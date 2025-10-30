import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
  Box,
  Chip,
  CircularProgress,
  debounce,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  HTMLAttributes,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PathwaySearchContext } from "../../contexts/PathwaySearchContext";
import { PathwaySearchNode } from "../../interfaces/pathway-search";
import { StringPropertyConfigs } from "../../types/pathway-search";

interface NodeTextSearchProps<K extends keyof StringPropertyConfigs> {
  node: PathwaySearchNode;
  propName: K;
  fetchFn: (
    filter: string | null,
    nodeId: string,
    tree: string,
    skip?: number,
    limit?: number,
    fetchProps?: RequestInit
  ) => Promise<Response>;
  onChange: (values: string[], propName: K) => void;
}

export default function NodeTextSearch<K extends keyof StringPropertyConfigs>(
  cmpProps: NodeTextSearchProps<K>
) {
  const { node, propName, fetchFn, onChange } = cmpProps;
  const [value, setValue] = useState<string[]>(
    node.data.props === undefined ? [] : node.data.props[propName] || []
  );
  const [input, setInput] = useState<string | null>(null);
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const { tree } = useContext(PathwaySearchContext);
  const synonymMap = useRef(new Map<string, string | null>());
  const listboxRef = useRef<Element>();
  const optionsExhaustedRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());
  const ABORT_ERROR = "Cancelling previous CV terms request (if any).";
  const label = node.data.dbLabel;
  const OPTION_FETCH_LIMIT = 15;

  const abortCVTermRequest = () => {
    const abortController = abortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort(ABORT_ERROR);
      abortControllerRef.current = new AbortController();
    }
  };

  const fetchOptions = useCallback(
    async (
      filter: string | null,
      page: number
    ): Promise<{ name: string; synonym: string | null }[]> => {
      const response = await fetchFn(
        filter,
        node.data.id,
        btoa(JSON.stringify(tree)),
        page * OPTION_FETCH_LIMIT,
        OPTION_FETCH_LIMIT,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    },
    [value, node, tree, fetchFn]
  );

  const replaceOptions = useCallback(
    async (filter: string | null, page: number) => {
      abortCVTermRequest(); // Any time we send a new request, abort the previous request if it's still pending
      setError(null);
      setLoading(true);
      optionsExhaustedRef.current = false;

      try {
        const data = await fetchOptions(filter, page);

        if (data.length === 0) {
          optionsExhaustedRef.current = true;
          return;
        }

        if (synonymMap.current !== undefined) {
          synonymMap.current.clear();
          data.forEach(({ name, synonym }) => {
            synonymMap.current.set(name, synonym);
          });
        }

        setOptions(data.map((obj) => obj.name));
      } catch (error) {
        // Only set an error if it wasn't because we manually aborted the request
        if (error !== ABORT_ERROR) {
          // Note that in dev mode, there's a race condition between the two initial requests so we can't actually use the abort controller
          // status. This is why we instead use the value of the error to check if the request was manually aborted.
          console.error(error);
          setError(
            `An error occurred fetching options for ${label}. Please try again later.`
          );
        }
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [value, fetchOptions]
  );

  const extendOptions = useCallback(
    async (filter: string | null, page: number) => {
      abortCVTermRequest(); // Any time we send a new request, abort the previous request if it's still pending
      setError(null);

      try {
        const data = await fetchOptions(filter, page);

        if (data.length === 0) {
          optionsExhaustedRef.current = true;
          return;
        }

        if (synonymMap.current !== undefined) {
          data.forEach(({ name, synonym }) => {
            synonymMap.current.set(name, synonym);
          });
        }

        setOptions((prev) => {
          return [
            ...prev,
            ...data.map((obj) => obj.name), // Add the new options
          ];
        });
      } catch (error) {
        // Only set an error if it wasn't because we manually aborted the request
        if (error !== ABORT_ERROR) {
          // Note that in dev mode, there's a race condition between the two initial requests so we can't actually use the abort controller
          // status. This is why we instead use the value of the error to check if the request was manually aborted.
          console.error(error);
          setError(
            `An error occurred fetching options for ${label}. Please try again later.`
          );
        }
      }
    },
    [fetchOptions]
  );

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

  const handleOnChange = useCallback(
    (
      event: SyntheticEvent | MouseEvent,
      value: string[],
      reason: AutocompleteChangeReason | "clicked"
    ) => {
      setValue(value);

      // Only emit to the parent when an option is selected from the dropdown, or the field is cleared
      if (
        reason === "selectOption" ||
        reason === "removeOption" ||
        reason === "clicked" ||
        reason === "clear"
      ) {
        abortCVTermRequest();
        onChange(value, propName);
      }
    },
    [propName]
  );

  const handleOnInputChange = useMemo(
    () =>
      debounce((event: SyntheticEvent, input: string, reason: string) => {
        setInput(input);
        setPage(0);
        replaceOptions(input, 0);
      }, 500),
    [replaceOptions]
  );

  const handleRenderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label={label}
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
              ) : value.length > 0 ? (
                <IconButton
                  size="small"
                  title="Clear"
                  onClick={(event) => handleOnChange(event, [], "clear")}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
      />
    ),
    [loading, label, error, value, handleOnChange]
  );

  const handleRenderTags = (
    value: string[],
    getTagProps: AutocompleteRenderGetTagProps
  ) =>
    value.map((option: string, index: number) => {
      const { key, ...itemProps } = getTagProps({ index });
      return <Chip variant="filled" label={option} key={key} {...itemProps} />;
    });

  const getOptionLabel = (option: string) => {
    const synonym = synonymMap.current.get(option);
    return synonym === null || option === synonym ? (
      option
    ) : (
      <>
        {synonym}
        <Box sx={{ marginLeft: "3px" }}>
          <em>({option})</em>
        </Box>
      </>
    );
  };

  const handleRenderOption = (
    props: HTMLAttributes<HTMLLIElement> & { key: any },
    option: string,
    state: AutocompleteRenderOptionState
  ) => {
    const { key, ...optionProps } = props;
    return (
      <Box key={key} component="li" {...optionProps}>
        {getOptionLabel(option)}
      </Box>
    );
  };

  // Add new options any time the page changes
  useEffect(() => {
    extendOptions(input, page);
  }, [page]);

  useEffect(() => {
    // The listbox is replaced any time options changes, so recreate the listener accordingly
    setupScrollListener();
  }, [options]);

  // Clean up
  useEffect(() => {
    // Fetch an initial set of options when the component is first rendered
    replaceOptions(null, 0);

    return () => {
      // Make sure any open requests are canceled if the component is unmounted
      abortCVTermRequest();

      // Clean up scroll listener
      teardownScrollListener();
    };
  }, []);

  return (
    <Autocomplete
      sx={{ width: "550px" }}
      size="small"
      multiple
      disableClearable
      filterSelectedOptions
      value={value}
      options={[...value, ...options]}
      loading={loading}
      open={open}
      onOpen={handleOnOpen}
      onClose={handleOnClose}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderTags={handleRenderTags}
      renderOption={handleRenderOption}
      filterOptions={(x) => x} // Important! Ensures options not matching the text input are shown
    />
  );
}
