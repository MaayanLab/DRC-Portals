import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))
import csv
import pathlib
from statistics import mean
import numpy as np
import pandas as pd
import requests
from tqdm.auto import tqdm
from datetime import datetime
import re
from urllib.parse import urlsplit
from deriva_datapackage import create_sqlite_client, create_offline_client
from c2m2_assessment.__main__ import assess
import os
import math
import h5py
import yaml
from bs4 import BeautifulSoup
import json
from urllib.parse import urlsplit
from c2m2_assessment.util.fetch_cache import fetch_cache
from c2m2_assessment.util.memo import memo
from ontology.obo import OBOOntology
import zipfile
import traceback
import subprocess
import logging; logging.basicConfig(level=logging.DEBUG, stream=sys.stderr)


def deep_find(root, file):
  ''' Helper for finding a filename in a potentially deep directory
  * Credit to Daniel J. B. Clarke, Amanda Charbonneau - https://github.com/MaayanLab/appyter-catalog/blob/main/appyters/CFDE-C2M2-FAIR-Assessment/C2M2Assessment.ipynb
  '''
  return set(map(str, pathlib.Path(root).rglob(file)))

def find_between_r( s, first, last ):
    try:
        start = s.rindex( first ) + len( first )
        end = s.rindex( last, start )
        return s[start:end]
    except ValueError:
        return ""
    
def check_repo_public(github_url):
    """Checks if the GitHub URL is the link of a public repo."""
    try:
        x = requests.head(github_url)
        return x.status_code == 200
    except KeyboardInterrupt: raise
    except: traceback.print_exc(file=sys.stderr)
    return False
  
def get_repo_license(github_url):
    """Extracts the license information from a GitHub repository URL using the API."""
    # Extract the owner and repo name from the URL
    repo_url = github_url.split("/")
    owner, repo = repo_url[3], repo_url[4]
    api_url = f"https://api.github.com/repos/{owner}/{repo}/license"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        return data['license']['name']
    except KeyboardInterrupt: raise
    except: traceback.print_exc(file=sys.stderr)

def assess_metanode(metanode_name):
    """Run FAIR Assessment for a given PWB metanode given its name using the PWB components API endpoint."""
    fairshake_description = 0
    fairshake_cite_methods = 0
    fairshake_contact_info = 0
    fairshake_license = 0
    fairshake_persistent_url = 0
    metanode_name = metanode_name
    try:
        response= requests.get('https://playbook-workflow-builder.cloud/api/components/' + metanode_name)
        response.raise_for_status()
        metanode_info = response.json()
        metadata = metanode_info['meta']
        if metadata['description'] != "":
            fairshake_description = 1
        if metadata['license'] != "": 
            fairshake_license = 1
        if '@' in metadata['author']: 
            fairshake_contact_info = 1
        # if metanode_info['type'] == 'process':
        if metanode_info['kind'] == 'process':
            if 'story' in metanode_info:
                if r'\ref{' in metanode_info['story']['abstract']:
                    fairshake_cite_methods = 1
        else:
            fairshake_cite_methods = None
        return  [fairshake_description, fairshake_cite_methods, fairshake_contact_info, fairshake_license, fairshake_persistent_url]
    except KeyboardInterrupt: raise
    except: traceback.print_exc(file=sys.stderr)


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
            try:
                text = requests.get('https://raw.githubusercontent.com' + split_url.path).text
            except KeyboardInterrupt: raise
            except:
                text = ''
            metanode_names = re.findall("= MetaNode\('.+?\)", text)
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
    try:
        if type(example_url) == 'string':
            try:
                x = requests.head(example_url)
                x.raise_for_status()
                fairshake_head_request_support = 1
            except KeyboardInterrupt: raise
            except: traceback.print_exc(file=sys.stderr)
        example_term = find_between_r(template_url, '%7B', '%7D' ) 
        missing_element_url = template_url.replace('%7B' +example_term+ '%7D', 'thisstringshouldhopefullynotmatchanything')
        try:
            if requests.head(missing_element_url).status_code == 404:
                fairshake_return_404 = 1
        except KeyboardInterrupt: raise
        except: traceback.print_exc(file=sys.stderr)
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
    except KeyboardInterrupt: raise
    except:
        import traceback; traceback.print_exc()
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
    fairshake_license = None
    fairshake_contact = None
    fairshake_smartapi = 0
    fairshake_persistent_url = 0
    fairshake_aiplugin_compatible = [0] * 6
    fairshake_aiplugin_contact = None
    fairshake_aiplugin_valid_openapi_link = None
    fairshake_ogp = [0] * 4
    openapi_metadata = None
    aiplugin_link = None
    if row['smartAPISpec'] == True:
        smartapi_link = row['link'].replace('/ui/', '/api/metadata/') if 'smart-api.info' in row['link'] else row['smartAPIURL'].replace('/ui/', '/api/metadata/')
        try:
            response = requests.get(smartapi_link)
            response.raise_for_status()
            openapi_metadata = response.json()
            fairshake_openapi = 1
            fairshake_smartapi = 1
        except KeyboardInterrupt: raise
        except: fairshake_smartapi = 0
    elif row['openAPISpec'] == True:
        try:
            response = requests.get(row['link'])
            response.raise_for_status()
            openapi_metadata = yaml.safe_load(response.text())
            fairshake_openapi = 1
        except KeyboardInterrupt: raise
        except: fairshake_openapi = 0
    #
    if openapi_metadata:
        try: aiplugin_link = f"{openapi_metadata['servers'][0]['url']}/.well-known/ai-plugin.json"
        except KeyboardInterrupt: raise
        except: aiplugin_link = None
        #
        metadata = openapi_metadata['info']
        if 'contact' in metadata:
            fairshake_contact = 1 if metadata['contact'].get('url') or metadata['contact'].get('email') else 0
        if 'license' in metadata and 'name' in metadata['license']:
            fairshake_license = 1 if metadata['license']['name'] != '' else 0
    else:
        aiplugin_link = f"{row['link']}/.well-known/ai-plugin.json"
    #
    if aiplugin_link:
        try:
            response = requests.get(aiplugin_link)
            response.raise_for_status()
            chatbot_specs = response.json()
            # check if ai-plugin compatible
            required_plugin_fields = ['schema_version', 'name_for_human', 'name_for_model', 'description_for_model', 'description_for_human', 'api']
            for index, field in enumerate(required_plugin_fields): 
                if field in chatbot_specs: 
                    fairshake_aiplugin_compatible[index] = 1
            if 'api' in chatbot_specs and chatbot_specs['api']['type'] == 'openapi':
                if chatbot_specs['api']['url'] == row['link'].rstrip('/'):
                    fairshake_aiplugin_valid_openapi_link = 1
                else:
                    try:
                        openapi_json_response = requests.get(chatbot_specs['api']['url'])
                        openapi_json_response.raise_for_status()
                    except KeyboardInterrupt: raise
                    except: fairshake_aiplugin_valid_openapi_link = 0
                    else: fairshake_aiplugin_valid_openapi_link = 1
            fairshake_aiplugin_contact = 1 if 'contact_email' in chatbot_specs else 0
        except KeyboardInterrupt: raise
        except: traceback.print_exc(file=sys.stderr)
        split_url = urlsplit(aiplugin_link)
        try:
            webpage_response = requests.get(split_url.scheme + '://' + split_url.netloc + split_url.path.partition('/.well-known/')[0])
            webpage_response.raise_for_status()
            html = webpage_response.text
            soup = BeautifulSoup(html, features="html.parser")
            ogp_title = soup.find('meta', property="og:title")
            ogp_type = soup.find('meta', property="og:type")
            ogp_image = soup.find('meta', property="og:image")
            ogp_url = soup.find('meta', property="og:url")
            ogp_req_metadata = [ogp_title, ogp_type, ogp_image, ogp_url ]
            for index, ogp_req in enumerate(ogp_req_metadata): 
                if ogp_req:
                    fairshake_ogp[index] = 1
        except KeyboardInterrupt: raise
        except: traceback.print_exc(file=sys.stderr)

    rubric = {
        "Compatible with AI Plugins": mean(fairshake_aiplugin_compatible),
        "Website has Open Graph protocol for ChatBot usage": mean(fairshake_ogp),
        "Chatbot specs contain contact information": fairshake_aiplugin_contact,
        "Chatbot Specs contain valid OpenAPI Specifications documentation": fairshake_aiplugin_valid_openapi_link, 
        "Documented with OpenAPI": fairshake_openapi,
        "Usage License specified": fairshake_license,  
        "Contact information available": fairshake_contact,
        "Published in Smart API": fairshake_smartapi,
        "Persistent URL": fairshake_persistent_url,
    }
    return rubric

def apps_urls_fair(apps_url): 
    """Run FAIR Assessment for a given Apps URL asset given its URL"""   
    fairshake_license = 0
    fairshake_description = 0
    fairshake_persistent_url = 0 
    try:
        response = requests.get(apps_url)
        response.raise_for_status()
        html = response.text
        soup = BeautifulSoup(html, features="html.parser")
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
    except KeyboardInterrupt: raise
    except: traceback.print_exc(file=sys.stderr)
    rubric = {"Resource discovery through web search": fairshake_description,
            "Digital resource license": fairshake_license,
            "Persistent URL": fairshake_persistent_url}
    return rubric


def models_fair(row):
    """Run FAIR Assessment for a given model asset given its URL""" 
    fairshake_persistent_url = 0
    fairshake_valid_link = None
    split_url = urlsplit(row['link'])
    fairshake_persistent_url = 1 if split_url.netloc in {'doi.org'} else 0
    try:
        response = requests.get(row['link'])
        response.raise_for_status()
    except KeyboardInterrupt: raise
    except: fairshake_valid_link = 0
    else: fairshake_valid_link = 1
    rubric = {
        "Link is valid": fairshake_valid_link,
        "Persistent URL": fairshake_persistent_url,
    }
    return rubric

def check_ontology_in_term(term):
    """Return boolean defining if a term contains an ontological reference eg RO:922340"""
    my_file = open(__dir__/"ontology/ontologies.txt", "r") 
    data = my_file.read() 
    all_ontologies = data.split("\n")[:-1] 
    my_file.close() 
    for ontology in all_ontologies:
        if str(ontology.lower() + ':') in term.lower(): 
            return True
    return False

def check_standard_ontology(ontology):
    """Return boolean defining if an given ontology is considered community standard"""
    my_file = open(__dir__/"ontology/ontologies.txt", "r") 
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
    """Get all the paths contained within a h5 file
    Code gotten from https://stackoverflow.com/questions/51548551/reading-nested-h5-group-into-numpy-array 
    """
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

def c2m2_fair(directory):
    """Run FAIR Assessment for a C2M2 file asset given its filepath"""
    rubric = {
        'Machine readable metadata': 0.0,
        'Persistent identifier': None,
        'files with data type': None,
        'files with file format': None,
        'files with assay type': None,
        'files with anatomy': None,
        'files with biosample': None,
        'files with subject': None,
        'biosamples with species': None,
        'biosamples with subject': None,
        'biosamples with file': None,
        'biosamples with anatomy': None,
        'subjects with taxonomy': None,
        'subjects with granularity': None,
        'subjects with taxonomic role': None,
        'subjects with biosample': None,
        'subjects with file': None,
        'files in collections': None,
        'subjects in collections': None,
        'biosamples in collections': None,
        'projects with anatomy': None,
        'projects with files': None,
        'projects with data types': None,
        'projects with subjects': None,
        'biosamples with substance': None,
        'collections with gene': None,
        'collections with substance': None,
        'subjects with substance': None,
        'biosamples with gene': None,
        'phenotypes with gene': None,
        'proteins with gene': None,
        'collections with protein': None,
        'subjects with phenotype': None,
        'genes with phenotype': None,
        'diseases with phenotype': None,
        'collections with phenotype': None,
        'Accessible via DRS': 1.0
    }
    try:
        packages = (
            deep_find(directory, 'C2M2_datapackage.json')
            | deep_find(directory, 'datapackage.json')
        )
        if not packages:
            raise RuntimeError(f"Couldn't locate C2M2_datapackage.json")
        else:
            package, *more_packages = packages
        if len(packages) > 1:
            print(f"Assessing {package=}, but also found {more_packages=}")
        package_pathlib = pathlib.Path(package)
        os.chdir(package_pathlib.parent)
        # make sure we have the right name
        if package_pathlib.name != 'C2M2_datapackage.json':
            package_pathlib = package_pathlib.rename('C2M2_datapackage.json')
        # run our validation script (which also indexes the database)
        validate_proc = subprocess.run([sys.executable, '-m', 'cfde_c2m2', 'validate'], stdout=sys.stdout, stderr=sys.stderr)
        if validate_proc.returncode == 0:
            rubric['Machine readable metadata'] = 1
        else:
            print('ERROR: Validate failed! Trying to continue anyway...')
        #
        if pathlib.Path('C2M2_datapackage.sqlite').exists():
            # re-use indexed database for fair assessment
            CFDE = create_sqlite_client('sqlite:///C2M2_datapackage.sqlite')
        else:
            CFDE = create_offline_client('C2M2_datapackage.json')
        #
        result = assess(CFDE, rubric='drc2024', full=False)
        for index, row in result.iterrows():
            if math.isnan(row['value']):
                rubric[row["name"]] = None
            else:
                rubric[row["name"]] = row["value"]
    except KeyboardInterrupt: raise
    except:
        import traceback; traceback.print_exc()
    return rubric

def xmt_fair(xmt_path, row):
    """Run FAIR Assessment for a XMT file asset given its filepath and database row"""
    # initialize fairshake variables
    fairshake_drs = 1
    fairshake_persistent = 0
    fairshake_ontological_count = 0
    fairshake_standard_elements = []
    gene_set_count = 0
    set_labels = set()
    with xmt_path.open('r') as fr:
      for line in tqdm(fr, desc=f"Processing {row['dcc_short_label']}/{row['filename']}..."):
        gene_set_count += 1
        line_split = list(map(str.strip, line.split('\t')))
        if len(line_split) < 3: continue
        x_set_label, x_set_description, *x_set_elements = line_split
        set_labels.add(x_set_label)
        term_ontological = check_ontology_in_term(x_set_label.replace('_', ' '))
        if term_ontological:
          fairshake_ontological_count +=1
        # standard_elements = []
        # if row['filename'].endswith('.gmt'):
        #     standard_elements = [1 if len(gene_lookup.get(raw_gene, [])) > 0 else 0 for raw_gene in x_set_elements]
        # else:
        #     standard_elements = [1 if check_ontology_in_term(raw_gene.replace('_', ':')) else 0 for raw_gene in x_set_elements]
        # sum_standard_elements = sum(standard_elements)  
        # fairshake_standard_elements.append(sum_standard_elements/len(x_set_elements))

    fair_assessment_results={"XMT Terms contain ontological reference": fairshake_ontological_count/gene_set_count if gene_set_count > 0 else None,
                            # "XMT Elements are normalized to a standard": mean(fairshake_standard_elements), 
                            "XMT Elements are normalized to a standard": None,
                            "XMT Terms are unique": 1. if gene_set_count == len(set_labels) else 0.,
                            "Accessible via DRS": fairshake_drs,
                            "Persistent URL": fairshake_persistent
                            }
    return fair_assessment_results
          

def attribute_tables_fair(attr_table_path, row):
    """Run FAIR Assessment for an Attribute table file asset given its filepath and database row"""
    # initialize fairshake variables
    fairshake_drs = 1
    fairshake_persistent = 0
    fairshake_row_ontological = 0
    fairshake_col_ontological = 0
    if row['filename'].endswith('.h5'):
        with h5py.File(attr_table_path, 'r') as f:
            for dset in traverse_datasets(f):
                if dset == '/col/id': 
                    col_values = np.array(f[dset])
                    col_reference_ontological = np.array([check_ontology_in_term(xi.decode()) for xi in col_values])
                    fairshake_col_ontological = np.mean(col_reference_ontological).tolist()
                if dset == '/row/id': 
                    row_values = np.array(f[dset])
                    row_reference_ontological = np.array([check_ontology_in_term(xi.decode()) for xi in row_values])
                    fairshake_row_ontological = np.mean(row_reference_ontological).tolist()
            fair_assessment_results={"Columns reference a community standardized id": fairshake_col_ontological,
                                    "Rows reference a community standardized id":fairshake_row_ontological, 
                                    "Accessible via DRS": fairshake_drs,
                                    "Persistent URL": fairshake_persistent
                                    }
    else:
        fair_assessment_results={"Columns reference a community standardized id": fairshake_col_ontological,
        "Rows reference a community standardized id":fairshake_row_ontological, 
        "Accessible via DRS": fairshake_drs,
        "Persistent URL": fairshake_persistent
        }
    return fair_assessment_results


def kg_assertions_fair(assertions_extract_path):
    """Run FAIR Assessment for a KG Assertions file asset given its filepath and database row"""
    # initialize fairshake metric variables
    fairshake_drs = 1
    fairshake_persistent = 0
    fairshake_node_standard = []
    fairshake_predicate_standard = []
    RO = memo(lambda: OBOOntology(fetch_cache('https://raw.githubusercontent.com/oborel/obo-relations/master/ro.obo', 'ro.obo')))

    for assertion_node_file in assertions_extract_path.glob('*.nodes.csv'):
        with assertion_node_file.open('r') as fr:
            columns = next(fr).strip().split(',')
            columns[0] = 'id'
            #fair assessment: check if there is a community ontology acronym as a column header
            ontology_columns = [col for col in columns if check_standard_ontology(col)]
            rows_ontology_check = []
            # fairshake_node_standard.append(1 if check_ontology_in_columns(columns) else 0)
            assertion_node_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
            for assertion_node in tqdm(assertion_node_reader, desc=f"Processing {assertion_node_file.name}..."):
            # check if at least one of standard ontology rows contains non-empty value
                row_valid_ontology = 0
                for col in ontology_columns:
                    if assertion_node[col] != '':
                        row_valid_ontology = 1
                rows_ontology_check.append(1 if row_valid_ontology == 1 else 0)
            fairshake_node_standard.append(mean(rows_ontology_check) if len(ontology_columns) > 0 else 0)
    for assertion_edge_file in assertions_extract_path.glob('*.edges.csv'):
        file_predicate_standard_scores = []
        with assertion_edge_file.open('r') as fr:
            columns = next(fr).strip().split(',')
            assertion_edge_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
            for assertion in tqdm(assertion_edge_reader, desc=f"Processing {assertion_edge_file.name}..."):
                if 'RO' in columns: 
                    ontology_lookup = RO().get(assertion['RO'])
                    file_predicate_standard_scores.append(0 if ontology_lookup is None or ontology_lookup['name'] != assertion['RO'].replace('_', ' ') else 1)
                else: 
                    file_predicate_standard_scores.append(0)
        fairshake_predicate_standard.append(mean(file_predicate_standard_scores))
    fair_assessment_results={"Subjects/Objects reference a community standardized id": mean(fairshake_node_standard) if len(fairshake_node_standard) > 0 else 0,
                                "Predicates reference a community standardized id": mean(fairshake_predicate_standard) if len(fairshake_predicate_standard) > 0 else 0 , 
                                "Accessible via DRS": fairshake_drs,
                                "Persistent URL": fairshake_persistent
                                }
    return fair_assessment_results


def code_assets_fair_assessment():
    """Run FAIR Assessment for all current code assets"""
    from ingest_common import current_code_assets
    current_code_asset_df = current_code_assets()
    fairshake_df_data = []
    for index, row in tqdm(current_code_asset_df.iterrows(), total=current_code_asset_df.shape[0], desc='Processing code assets..'):
        if row['type'] == 'ETL': 
            rubric= etl_fair(row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        elif row['type'] == 'Entity Page Template': 
            rubric = entity_page_fair(row['entityPageExample'], row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        elif row ['type'] == 'PWB Metanodes':
            rubric = PWB_metanode_fair(row['name'], row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        elif row['type'] == 'API':
            rubric = api_fair(row)
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        elif row['type'] == 'Apps URL':
            rubric = apps_urls_fair(row['link'])
            fairshake_df_data.append([row['dcc_id'], row['link'], row['type'], rubric, datetime.now()])
        else:
            raise NotImplementedError(f"Assessment for {row['type']} not implemented")
    fairshake_df = pd.DataFrame(fairshake_df_data, columns=['dcc_id', 'link', 'type', 'rubric', 'timestamp'])
    return fairshake_df

def file_assets_fair_assessment():
    """Run FAIR Assessment for all current file assets"""
    ingest_path = __dir__.parent / 'ingest'
    from ingest_common import current_dcc_assets
    current_file_asset_df = current_dcc_assets()
    fairshake_df_data = []
    for index, row in tqdm(current_file_asset_df.iterrows(), total=current_file_asset_df.shape[0], desc='Processing file assets..'):
        asset_type = row['filetype']
        row['dcc_short_label'] = row['link'].split('/')[3]
        if asset_type == 'XMT': 
            xmts_path = ingest_path / 'xmts'
            xmt_path = xmts_path/row['dcc_short_label']/row['filename']
            xmt_path.parent.mkdir(parents=True, exist_ok=True)
            if not xmt_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'], xmt_path)
            rubric = xmt_fair(xmt_path, row)
            fairshake_df_data.append([row['dcc_id'], row['link'], asset_type, rubric, datetime.now()])
        elif asset_type == 'Attribute Table': 
            if '.h5' in row['link']:
                attr_tables_path = ingest_path / 'attribute_tables'
                attr_table_path = attr_tables_path/row['dcc_short_label']/row['filename']
                attr_table_path.parent.mkdir(parents=True, exist_ok=True)
                if not attr_table_path.exists():
                    import urllib.request
                    urllib.request.urlretrieve(row['link'].replace(' ', '%20'), attr_table_path)
                rubric = attribute_tables_fair(attr_table_path, row)
                fairshake_df_data.append([row['dcc_id'], row['link'], asset_type, rubric, datetime.now()])
        elif asset_type == 'C2M2': 
            c2m2s_path = ingest_path / 'c2m2s'
            c2m2_path = c2m2s_path/row['dcc_short_label']/row['filename']
            c2m2_path.parent.mkdir(parents=True, exist_ok=True)
            if not c2m2_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), c2m2_path)
            c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
            if not c2m2_extract_path.exists():
                with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
                    c2m2_zip.extractall(c2m2_extract_path)
            # run fair assessment here: 
            rubric = c2m2_fair(str(c2m2_extract_path))
            fairshake_df_data.append([row['dcc_id'], row['link'], asset_type, rubric, datetime.now()])
        elif asset_type == 'KG Assertions': 
            assertions_path = ingest_path / 'assertions'
            # assemble the full file path for the DCC's asset
            file_path = assertions_path/row['dcc_short_label']/row['filename']
            file_path.parent.mkdir(parents=True, exist_ok=True)
            if not file_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), file_path)
            # extract the KG Assertion bundle
            assertions_extract_path = file_path.parent / file_path.stem
            if not assertions_extract_path.exists():
                with zipfile.ZipFile(file_path, 'r') as assertions_zip:
                    assertions_zip.extractall(assertions_extract_path)
            rubric = kg_assertions_fair(assertions_extract_path) 
            fairshake_df_data.append([row['dcc_id'], row['link'], asset_type, rubric, datetime.now()])
        else:
            raise NotImplementedError(f"Assessment for {asset_type} not implemented")
    fairshake_df = pd.DataFrame(fairshake_df_data, columns=['dcc_id', 'link', 'type', 'rubric', 'timestamp'])
    return fairshake_df