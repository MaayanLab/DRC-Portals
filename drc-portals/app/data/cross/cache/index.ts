import NodeCache from "node-cache"
import singleton from "@/lib/singleton";

export default singleton('cache', () => {
  return new NodeCache();
})