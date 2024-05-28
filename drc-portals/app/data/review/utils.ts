import { z } from 'zod';

export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
    // Define the schema for known parameters
    const schema = z.object({
      q: z.union([
        z.array(z.string()).transform(qs => qs.join(' ')),
        z.string(),
        z.undefined(),
      ]),
      s: z.union([
        z.array(z.string()).transform(ss => ss[ss.length - 1]),
        z.string(),
        z.undefined(),
      ]).transform(ss => {
        if (!ss) return undefined;
        const [type, entity_type] = ss.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }),
      p: z.union([
        z.array(z.string()).transform(ps => +ps[ps.length - 1]),
        z.string().transform(p => +p),
        z.undefined().transform(() => 1),
      ]),
      r: z.union([
        z.array(z.string()).transform(ps => +ps[ps.length - 1]),
        z.string().transform(p => +p),
        z.undefined().transform(() => 10),
      ]).transform(r => ({ 10: 10, 20: 20, 50: 50 }[r] ?? 10)),
      t: z.union([
        z.array(z.string()),
        z.string().transform(ts => ts ? ts.split('|') : undefined),
        z.undefined(),
      ]).transform(ts => ts ? ts.map(t => {
        const [type, entity_type] = t.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }) : undefined),
      et: z.union([
        z.array(z.string()),
        z.string().transform(ts => ts ? ts.split('|') : undefined),
        z.undefined(),
      ]).transform(ts => ts ? ts.map(t => {
        const [type, entity_type] = t.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }) : undefined),
    }).passthrough();
  
    // Parse and return the parameters
    return schema.parse(props.searchParams);
  }