import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  Chip,
  CircularProgress,
  debounce,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import {
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
  propName: K,
  fetchFn: (
    filter: string | null,
    nodeId: string,
    tree: string,
    fetchProps?: RequestInit
  ) => Promise<Response>,
  onChange: (values: string[], propName: K) => void;
}

export default function NodeTextSearch<K extends keyof StringPropertyConfigs>(cmpProps: NodeTextSearchProps<K>) {
  const { node, propName, fetchFn, onChange } = cmpProps;
  const [value, setValue] = useState<string[]>(node.data.props === undefined ? [] : (node.data.props[propName] || []));
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tree } = useContext(PathwaySearchContext);
  const label = node.data.dbLabel;
  const abortControllerRef = useRef(new AbortController());

  const abortCVTermRequest = () => {
    const abortController = abortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort("Cancelling previous CV terms request (if any).");
      abortControllerRef.current = new AbortController();
    }
  };

  const handleOnChange = useCallback((
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
  }, [propName]);

  const handleOnInputChange = (
    event: SyntheticEvent,
    input: string,
    reason: string
  ) => {
    abortCVTermRequest(); // Any time value changes, abort any pending request
    fetchOptions(input);
  };

  const handleRenderInput = (params: AutocompleteRenderInputParams) => (
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
          <InputAdornment position="end" sx={{ position: "absolute", right: "7px" }}>
            {
              loading
                ? <CircularProgress color="inherit" size={20} />
                : <>
                  <IconButton size="small" title="Clear" onClick={(event) => handleOnChange(event, [], "clear")}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </>
            }

          </InputAdornment>
        ),
      }}
    />
  );

  const handleRenderTags = (value: string[], getTagProps: AutocompleteRenderGetTagProps) =>
    value.map((option: string, index: number) => {
      const { key, ...itemProps } = getTagProps({ index });
      return (
        <Chip variant="filled" label={option} key={key} {...itemProps} />
      );
    })

  const fetchOptions = useMemo(
    () =>
      debounce(async (input: string | null) => {
        setError(null);
        setLoading(true);

        const abortController = abortControllerRef.current;
        try {
          const response = await fetchFn(
            input,
            node.data.id,
            btoa(JSON.stringify(tree)),
            {
              signal: abortController.signal,
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data: string[] = await response.json();
          setOptions(data);
        } catch (error) {
          // Only set an error if it wasn't because we manually aborted the request
          if (!abortController.signal.aborted) {
            console.error(error);
            setError(
              `An error occurred fetching options for ${label}. Please try again later.`
            );
          }
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 400),
    [abortControllerRef, value, tree, fetchFn]
  );

  // Fetch an initial set of options when the component is first rendered
  useEffect(() => {
    fetchOptions(null);

    return () => {
      // Make sure any open requests are canceled if the component is unmounted
      abortCVTermRequest();
    }
  }, []);

  return (
    <Autocomplete
      sx={{ width: "700px" }}
      size="small"
      multiple
      disableClearable
      filterSelectedOptions
      value={value}
      options={options}
      loading={loading}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderTags={handleRenderTags}
    />
  );
}
