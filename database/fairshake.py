import pandas as pd
import requests
from tqdm import tqdm
from datetime import datetime
import urllib.request
import re
from urllib.parse import urlsplit
import zipfile
import tempfile
from deriva_datapackage import create_offline_client
from c2m2_assessment.__main__ import assess
import os
import glob

def deep_find(root, file):
  ''' Helper for finding a filename in a potentially deep directory
  '''
  return set(glob.glob(os.path.join(root, '**', file), recursive=True))

def find_between_r( s, first, last ):
    try:
        start = s.rindex( first ) + len( first )
        end = s.rindex( last, start )
        return s[start:end]
    except ValueError:
        return ""
    
def check_repo_public(github_url):
    """Checks if the GitHub URL is the link of a public repo."""
    x = requests.head(github_url)
    if x.status_code == 200: 
        return True
    else:
        return False
  
def get_repo_license(github_url):
    """Extracts the license information from a GitHub repository URL using the API."""
    # Extract the owner and repo name from the URL
    repo_url = github_url.split("/")
    owner, repo = repo_url[3], repo_url[4]
    api_url = f"https://api.github.com/repos/{owner}/{repo}/license"
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return data['license']['name']
    else:
        return None
    

def assess_metanode(metanode_name):
    fairshake_description = 0
    fairshake_cite_methods = 0
    fairshake_contact_info = 0
    fairshake_license = 0
    fairshake_persistent_url = 0
    metanode_name = metanode_name
    response= requests.get('https://playbook-workflow-builder.cloud/api/components/' + metanode_name)
    if response.ok: 
        metanode_info = response.json()
        metadata = metanode_info['meta']
        if metadata['description'] != "":
            fairshake_description = 1
        if metadata['license'] != "": 
            fairshake_license = 1
        if '@' in metadata['author']: 
            fairshake_contact_info = 1
        # if metanode_info['type'] == 'process':
        if 'story' in metanode_info:
            if r'\ref{' in metanode_info['story']['abstract']:
                fairshake_cite_methods = 1
        return  [fairshake_description, fairshake_cite_methods, fairshake_contact_info, fairshake_license, fairshake_persistent_url]
    else:
        return None


def format_PWB_results(result):
    return { "Metanode has a clear description": result[0],
            "Metanode cites its methods": result[1],
            "Metanode has contact information": result[2],
            "Metanode has license": result[3],
            "Persistent URL": result[4]}
    
def PWB_metanode_fair(row_name, row_url): 
    result = assess_metanode(row_name)
    if result != None:
        return format_PWB_results(result)
    else: 
        split_url = urlsplit(row_url.replace('/nih-cfde/playbook-partnership/blob/', '/MaayanLab/Playbook-Workflow-Builder/'))
        base_url = split_url.netloc
        if base_url ==  'github.com': #if url was a github url
            metanode_names = re.findall("= MetaNode\('.+?\)", requests.get('https://raw.githubusercontent.com' + split_url.path).text)
            metanode_name = split_url.path.split('/')[-2]
            result = assess_metanode(metanode_name)
            if result != None:
                return format_PWB_results(result)
            elif len(metanode_names) > 0:
                results = [assess_metanode(extracted_name.split("= MetaNode('")[1][:-2]) for extracted_name in metanode_names]
                results = [item for item in results if item != None]
                df = pd.DataFrame(results)
                mean_results = df.mean().to_list()
                return format_PWB_results(mean_results)
            else:
                return format_PWB_results([0,0,0,0,0])
        elif base_url == 'playbook-workflow-builder.cloud': #if url was a playboom url
            component_path = urlsplit(row_url).path
            if '/components/' in component_path: 
                metanode_name = component_path.split('/components/')[1]
                result = assess_metanode(metanode_name)
                if result != None:
                   return format_PWB_results(result)
                else:
                    return format_PWB_results([0,0,0,0,0])
        else:
            return format_PWB_results([0,0,0,0,0])

def entity_page_fair(entityPageExample, link):
    fairshake_templated = 0
    fairshake_return_404 = 0
    fairshake_head_request_support = 0
    fairshake_persistent_url = 0
    example_url = entityPageExample
    template_url = link
    x = requests.head(example_url)
    if x.ok:
        fairshake_head_request_support = 1
    example_term = find_between_r(template_url, '%7B', '%7D' ) 
    missing_element_url = template_url.replace(example_term, '')
    if not(requests.head(missing_element_url).ok):
        fairshake_return_404 = 1
    check_url_templated = re.search("^.*%7B.*%7D.*$", template_url)
    if not(check_url_templated):
        check_url_templated = re.search("^.*{.*}.*$", template_url)
    if check_url_templated: 
        fairshake_templated = 1
    rubric = {"Entity page url can be templated": fairshake_templated,
            "Entity page properly returns 404 on missing element": fairshake_return_404,
            "Entity page supports HEAD requests": fairshake_head_request_support,
            "Persistent URL": fairshake_persistent_url}
    return rubric


def etl_fair(link):
    fairshake_public = 0
    fairshake_license = 0
    fairshake_persistent_url = 0
    repo_public = check_repo_public(link)
    if repo_public: 
        fairshake_public = 1
        license = get_repo_license(link)
        if not(license == None):
            fairshake_license = 1
    rubric= {"Public on Github": fairshake_public, 
            "Defines a License": fairshake_license,
            "Persistent URL": fairshake_persistent_url}
    return rubric


def api_fair(row):
    fairshake_openapi = 0
    fairshake_license = 0
    fairshake_contact = 0
    fairshake_smartapi = 0
    fairshake_persistent_url = 0 
    if row['openAPISpec'] == True: 
        fairshake_openapi = 1
    if row['smartAPISpec'] == True: 
        fairshake_smartapi = 1
    try:
        api_response = requests.get(row['link'])
        if api_response.ok():
            api_info = api_response.json()
            #this is unfinished
    except: 
        return {"Documented with OpenAPI": fairshake_openapi,
                "Usage License specified": fairshake_license,  
                "Contact information available": fairshake_contact,
                "Published in Smart API": fairshake_smartapi,
                "Persistent URL": fairshake_persistent_url}
    rubric = {"Documented with OpenAPI": fairshake_openapi,
                "Usage License specified": fairshake_license,  
                "Contact information available": fairshake_contact,
                "Published in Smart API": fairshake_smartapi,
                "Persistent URL": fairshake_persistent_url}
    return rubric

def code_assets_fair_assessment(code_assets_path, dcc_assets_path):
    with open(code_assets_path, 'r') as fr1:
        code_assets_data=pd.read_csv(fr1,sep='\t', header=0)
    with open(dcc_assets_path, 'r') as fr2:
        dcc_assets_data=pd.read_csv(fr2,sep='\t', header=0)
    merged_code_assets_df = pd.merge(code_assets_data, dcc_assets_data, on="link") 
    fairshake_df_data = []
    for index, row in tqdm(merged_code_assets_df.iterrows(), total=merged_code_assets_df.shape[0]):
        if row['type'] == 'ETL': 
            rubric= etl_fair(row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        if row['type'] == 'Entity Page Template': 
            rubric = entity_page_fair(row['entityPageExample'], row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        if row ['type'] == 'PWB Metanodes':
            rubric = PWB_metanode_fair(row['name'], row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        # if row['type'] == 'API':
        #     rubric = api_fair(row)
        #     fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
    fr1.close()
    fr2.close()
    fairshake_df = pd.DataFrame(fairshake_df_data, columns=['dcc_id', 'link', 'type', 'rubric', 'timestamp'])
    return fairshake_df



def c2m2_fair(directory):
    # file = './LINCS_C2M2_2023-09-18_datapackage.zip'
    # basename, ext = os.path.splitext(file)
    # assert ext == '.zip', 'Expected .zip file'
    # directory = tempfile.mkdtemp()
    # with zipfile.ZipFile(file, 'r') as z:
    #     z.extractall(directory)
    try: 
        CFDE = create_offline_client(
            *(
            deep_find(directory, 'C2M2_datapackage.json')
            | deep_find(directory, 'datapackage.json')
            ),
            cachedir=directory,
        )
        result = assess(CFDE, rubric='amanda2022', full=False)
        rubric = {}
        for index, row in result.iterrows():
            rubric[row["name"]] = row["value"]
        rubric["Accessible via DRS"] = 1
        return rubric
    except: 
        return {'Persistent identifier': 0.0,
                'files with data type': 0.0,
                'files with file format': 0.0,
                'files with assay type': 0.0,
                'files with anatomy': 0.0,
                'files with biosample': 0.0,
                'files with subject': 0.0,
                'biosamples with species': 0.0,
                'biosamples with subject': 0.0,
                'biosamples with file': 0.0,
                'biosamples with anatomy': 0.0,
                'subjects with taxonomy': 0.0,
                'subjects with granularity': 0.0,
                'subjects with taxonomic role': 0.0,
                'subjects with biosample': 0.0,
                'subjects with file': 0.0,
                'files in collections': 0.0,
                'subjects in collections': 0.0,
                'biosamples in collections': 0.0,
                'projects with anatomy': 0.0,
                'projects with files': 0.0,
                'projects with data types': 0.0,
                'projects with subjects': 0.0,
                'biosamples with substance': 0.0,
                'collections with gene': 0.0,
                'collections with substance': 0.0,
                'subjects with substance': 0.0,
                'biosamples with gene': 0.0,
                'phenotypes with gene': 0,
                'proteins with gene': 0,
                'collections with protein': 0.0,
                'subjects with phenotype': 0.0,
                'genes with phenotype': 0.0,
                'diseases with phenotype': 0.0,
                'collections with phenotype': 0.0,
                'Accessible via DRS': 1.0}
    

def check_ontology_in_term(term):
    my_file = open("./ingest/fair_assessment/ontologies.txt", "r") 
    data = my_file.read() 
    all_ontologies = data.split("\n") 
    my_file.close() 
    for ontology in all_ontologies:
        if ontology + ':' in term: 
            return True
    return False