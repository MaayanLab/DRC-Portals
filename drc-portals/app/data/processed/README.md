# Processed Data Portal

This is a website designed to navigate across XMTs. Some things to be aware of:

`XEntity` ids have their types embedded into them as a namespace:
- `[entityType]/[entityId]`
- e.g. `gene/somegeneid` (A single gene term)
- e.g. `drug/somedrugid` (A single drug term)

`XSet` ids have their entity types and term types embedded into them as a namespace:
- `[entityType]/set/[termType]/[setId]`
- e.g. `gene/set/tissue/someid` (A gene set with tissue set labels)
- e.g. `drug/set/phenotype/someid` (A drug set with phenotype set labels)

`XDatasets` correspond to the original XMT, they define the entityType (what are the sets made of) and the termType (what are the terms describing).

Finally, regardless of what it is, you get an `XIdentity` to describe it containing a `label` and `description` and possibly more in the future. This is what allows us to search across datasets, entities, and sets regardless of type.

The structured ids mean that any thing whether it's a dataset, a gene, or a drug set, has a unique-namespaced id which can always be put after `/data/processed/{id}`. It also means that prefixed based indexes can help the database with separating these things.
