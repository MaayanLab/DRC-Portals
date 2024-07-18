from openai import OpenAI
import os
import json

from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

uploadFile = False

if uploadFile:
      fileId = os.getenv("FILE_ID")
else:
  file = client.files.create(
    file=open("components/Chat/setup/CFDE_Info.txt", "rb"),
    purpose='assistants'
  )
  fileId = file.id

systemInstructions = """You are an assistant meant to help a user by providing information and calling functions relevant to the
    user query and to the Common Fund Data Ecosystem (CFDE). You will have access to a file with descriptions of the Data Coordinating Centers (DCCs) and their relevant data.
    Additionally you will be provided with a list of functions that be called to process specific types of data such as Gene, Gene Set, Metabolite, Glycan etc...
    You SHOULD NOT state any information that is not relevant to the CFDE and the listed DCCs.
    You SHOULD NOT state any information about the CFDE or DCCs that is not present in the provided file.
    Any user query not directly related to the CFDE or DCCs should be responded with a message stating that the query is not relevant to the CFDE or DCCs."""

with open('components/Chat/setup/functions.json', 'r') as f:
      functions = json.load(f)

assistant = client.beta.assistants.create(
        name='CFDE Assistant',
        instructions=systemInstructions,
        model="gpt-4-turbo-preview",
        tools= functions,
        file_ids=[fileId]
)

print(assistant)