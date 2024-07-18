import sys
import requests
from uuid import uuid5, NAMESPACE_URL
import pandas as pd
# python resolve_publications.py PMID 1 PMID 2
pmids = sys.argv[1:]

publications_df = pd.DataFrame("", index=[], columns=(['title', 'year', 'page', 'volume', 'issue', 'journal', 'pmid', 'pmcid', 'doi', 'authors', 'landmark', 'tool_id', "dccs", "partnerships"]))

def resolve_publication(pmid):
	res = requests.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=%s&retmode=json"%pmid)
	if not res.ok:
		raise Exception(res.text)
	else:
		data = {}
		info = res.json()["result"]
		meta = info[str(pmid)]
		title = meta["title"]
		uid = uuid5(NAMESPACE_URL, title)
		data["title"] = title
		data["year"] = meta["sortpubdate"].split("/")[0]
		data["page"] = meta["pages"]
		data["volume"] = meta["volume"]
		data["issue"] = meta["issue"]
		data["journal"] = meta["fulljournalname"]
		data["pmid"] = pmid
		for i in meta["articleids"]:
			if i["idtype"] == 'pmcid':
				data["pmcid"] = i['value'].split(";")[0].replace("pmc-id: ","").strip()
			if i["idtype"] == 'doi':
				data["doi"] = i['value']
		data["authors"] = ", ".join([i["name"] for i in meta["authors"]])
		return uid, data

for pmid in pmids:
	pmid = pmid.strip()
	try:
		uid, data = resolve_publication(pmid)
		publications_df.loc[uid] = data
	except Exception as e:
		print(e)

publications_df.to_csv("resolved_publications.tsv", sep="\t")