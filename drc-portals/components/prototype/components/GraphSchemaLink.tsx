import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "@mui/material";

export default function GraphSchemaLink() {
  return (
    <Link
      href="/data/c2m2/graph/schema"
      target="_blank"
      rel="noopener"
      color="secondary"
    >
      Graph Schema Diagram
      <OpenInNewIcon fontSize="small" color="secondary" />
    </Link>
  );
}
