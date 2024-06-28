from statistics import mean
import pandas as pd
import requests
from tqdm import tqdm
from datetime import datetime
import re
from urllib.parse import urlsplit
from deriva_datapackage import create_offline_client
from c2m2_assessment.__main__ import assess
import os
import glob
import math
import h5py
from bs4 import BeautifulSoup
import json
from urllib.parse import urlsplit

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
    """Run FAIR Assessment for a given PWB metanode given its name using the PWB components API endpoint."""
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
    """Convert list of scores to dictionary with PWB FAIR asssessment results."""
    return { "Metanode has a clear description": result[0],
            "Metanode cites its methods": result[1],
            "Metanode has contact information": result[2],
            "Metanode has license": result[3],
            "Persistent URL": result[4]}
    
def PWB_metanode_fair(row_name, row_url): 
    """Run FAIR Assessment for a given PWB metanode asset given its name and url."""
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
        elif base_url == 'playbook-workflow-builder.cloud': #if url was a playbook url
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
    """Run FAIR Assessment for a given Entity page template asset given its template and example"""
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
    """Run FAIR Assessment for a given ETL asset"""
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
    """Run FAIR Assessment for a given API asset given its row from code assets table"""
    fairshake_openapi = 0
    fairshake_license = 0
    fairshake_contact = 0
    fairshake_smartapi = 0
    fairshake_persistent_url = 0 
    if row['openAPISpec'] == True: 
        fairshake_openapi = 1
    if row['smartAPISpec'] == True: 
        fairshake_smartapi = 1
        smartapi_link = row['link'].replace('/ui/', '/api/metadata/') if 'smart-api.info' in row['link'] else row['smartAPIURL'].replace('/ui/', '/api/metadata/')
        try:
            api_response = requests.get(smartapi_link).json()
            metadata = api_response['info']
            if 'contact' in metadata and 'email' in metadata['contact']:
                fairshake_contact = 1 if metadata['contact']['email'] != '' else 0
            if 'license' in metadata and 'name' in metadata['license']:
                fairshake_license = 1 if metadata['license']['name'] != '' else 0
                return {"Documented with OpenAPI": fairshake_openapi,
                "Usage License specified": fairshake_license,  
                "Contact information available": fairshake_contact,
                "Published in Smart API": fairshake_smartapi,
                "Persistent URL": fairshake_persistent_url}
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

def apps_urls_fair(apps_url): 
    """Run FAIR Assessment for a given Apps URL asset given its URL"""   
    fairshake_license = 0
    fairshake_description = 0
    fairshake_persistent_url = 0 
    response = requests.get(apps_url)
    if response.ok:
        html = response.text
        soup = BeautifulSoup(html)
        schema_json = soup.find('script', type='application/ld+json')
        if schema_json:
            data = json.loads(schema_json.text)
            objects = data['@graph']
            webpageObjects = [object_dict for object_dict in objects if '@type' in object_dict if object_dict['@type'] == 'WebPage']
            if len(webpageObjects) > 0:
                for webpageObject in webpageObjects:
                    if 'license' in webpageObject:
                        fairshake_license = 1
                    if 'description' in webpageObject: 
                        fairshake_description = 1
    rubric = {"Resource discovery through web search": fairshake_description,
            "Digital resource license": fairshake_license,
            "Persistent URL": fairshake_persistent_url}
    return rubric


def chatbot_specs_fair(chatbot_specs_url):
    """Run FAIR Assessment for a given chatbot specification asset given its URL""" 
    fairshake_persistent_url = 0 
    fairshake_aiplugin_compatible = [0] * 6
    fairshake_valid_openapi_link = 0
    fairshake_contact = 0
    fairshake_ogp = [0] * 4
    response = requests.get(chatbot_specs_url)
    if response.ok:
        chatbot_specs = response.json()
        # check if ai-plugin compatible
        required_plugin_fields = ['schema_version', 'name_for_human', 'name_for_model', 'description_for_model', 'description_for_human', 'api']
        for index, field in enumerate(required_plugin_fields): 
            if field in chatbot_specs: 
                fairshake_aiplugin_compatible[index] = 1
        if 'api' in chatbot_specs and chatbot_specs['api']['type'] == 'openapi':
            openapi_json_response = requests.get(chatbot_specs['api']['url'])
            fairshake_valid_openapi_link = 1 if openapi_json_response.ok else 0
        fairshake_contact = 1 if 'contact_email' in chatbot_specs else 0
    split_url = urlsplit(chatbot_specs_url)
    webpage_response = requests.get(split_url.scheme + '://' + split_url.netloc)
    if webpage_response.ok:
        html = webpage_response.text
        soup = BeautifulSoup(html)
        ogp_title = soup.find('meta', property="og:title")
        ogp_type = soup.find('meta', property="og:type")
        ogp_image = soup.find('meta', property="og:image")
        ogp_url = soup.find('meta', property="og:url")
        ogp_req_metadata = [ogp_title, ogp_type, ogp_image, ogp_url ]
        for index, ogp_req in enumerate(ogp_req_metadata): 
            if ogp_req:
                fairshake_ogp[index] = 1
    rubric = {"Compatible with AI Plugins": mean(fairshake_aiplugin_compatible),
              "Chatbot Specs contain valid OpenAPI Specifications documentation": fairshake_valid_openapi_link, 
              "Website has Open Graph protocol for ChatBot usage": mean(fairshake_ogp),
            "Chatbot specs contain contact information": fairshake_contact,
            "Persistent URL": fairshake_persistent_url}
    return rubric


def code_assets_fair_assessment(code_assets_path, dcc_assets_path):
    """Run FAIR Assessment for all code assets"""
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
        if row['type'] == 'API':
            rubric = api_fair(row)
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        if row['type'] == 'Apps URL':
            rubric = apps_urls_fair(row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        if row['type'] == 'Chatbot Specifications':
            rubric = chatbot_specs_fair(row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
    fr1.close()
    fr2.close()
    fairshake_df = pd.DataFrame(fairshake_df_data, columns=['dcc_id', 'link', 'type', 'rubric', 'timestamp'])
    return fairshake_df



def c2m2_fair(directory):
    """Run FAIR Assessment for a C2M2 file asset given its filepath"""
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
            if math.isnan(row['value']):
                rubric[row["name"]] = None
            else:
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
    """Return boolean defining if a term contains an ontological reference eg RO:922340"""
    my_file = open("./ontology/ontologies.txt", "r") 
    data = my_file.read() 
    all_ontologies = data.split("\n")[:-1] 
    my_file.close() 
    for ontology in all_ontologies:
        if str(ontology.lower() + ':') in term.lower(): 
            return True
    return False

def check_standard_ontology(ontology):
    """Return boolean defining if an given ontology is considered community standard"""
    my_file = open("./ontology/ontologies.txt", "r") 
    data = my_file.read() 
    all_ontologies = data.split("\n")[:-1] 
    my_file.close() 
    if ontology in all_ontologies: 
        return True
    return False

def check_ontology_in_columns(columns):
    """Return boolean defining a list contains a community standard ontology"""
    for col in columns:
        if check_standard_ontology(col):
            return True
    else: 
        return False 

def traverse_datasets(hdf_file):
    """Get all the paths contained within a h5 file"""
    def h5py_dataset_iterator(g, prefix=''):
        for key in g.keys():
            item = g[key]
            path = f'{prefix}/{key}'
            if isinstance(item, h5py.Dataset): # test for dataset
                yield (path, item)
            elif isinstance(item, h5py.Group): # test for group (go down)
                yield from h5py_dataset_iterator(item, path)

    for path, _ in h5py_dataset_iterator(hdf_file):
        yield path