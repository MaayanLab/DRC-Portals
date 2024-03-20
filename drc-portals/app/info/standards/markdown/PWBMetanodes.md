### Table of Contents
* [Introduction](#introduction)
* [Resources](#resources)
* [Building Workflows](#building-workflows)
* [Developing Metanodes](#developing-metanodes)
  * [Core Concepts](#core-concepts)
  * [Contribution Guidelines](#contribution-guidelines)

## Introduction

The Playbook Workflow Builder (PWB) consists of a network of biomedical datasets, API endpoints, and other developed tools from both within and external to the CFDE. Users can traverse the graph database visually by selecting various options for some following data set or imputation task. Each meta node within the PWB can be independently constructed or used, preferably by someone already familiar with a given tool’s functionality. To use the PPWB, users start from a list of possible inputs, and then sequentially select the different transformations, queries, visualizations, or other computations they wish to add to the workflow. 

## Resources

For more detailed tutorials on using or developing for the PPWB, please refer to the following guides:
- [PWB User Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/user/index.md)
- [PWB Developer Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/index.md)

## Building Workflows

The following tutorial, adapted from the PWB User Guide linked above, walks through how to build a workflow for investigating a specific gene. 

1. Navigate to the [PPWB interface](https://playbook-workflow-builder.cloud). You should see a display with multiple input "cards" to choose from, which can be filtered using the toggles on the left. 

2. Select the input card you would like and follow instructions for submitting or uploading the input. 
  - In our example, we will click the **Gene Input** card to enter the gene ACE2, and click the submit button when done. 
  - Note that the PPWB provides autocomplete suggestions for some entity input fields, such as genes. It is possible to move forward with a non-autocomplete suggested input in these cases, at risk of breaking the workflow in a future step. 

3. You should now see a new set of cards that all represent different operations available for your previously entered input. 
  - In our example, the new cards will all be gene-centric options such as identifying product records in GlyGen, finding regulatory elements from the Linked Data Hub, or querying LINCS L1000 signatures which reverse the effect of the gene's knockout. 

4. Select a new card to add to the workflow and wait for the operation to complete. Most operations should provide a new data view or visualization. 
  - As an example, we can select the **Query GTEx Median Tissue Expression** card, which displays a table of tissues from GTEx where the input gene is most significantly expressed. 
  - Some operations, including the example, rely on on-demand API calls, and can be re-computed or updated using the **Recompute** button at the bottom of the page. 

6. To continue the workflow, click the **+** breadcrumb at the top of the page to choose from a new set of option cards, and continue with the analysis. 

5. If you have reached the end of a workflow, you have two main options:
  - You may return to any of the previous nodes by clicking on the corresponding "breadcrumb" graph at the top of the page, and select more operations from a previous node. All "branches" of the workflow, and their results, will be saved. 
  - You may move on to save or publish your workflow.

6. You can view the full workflow, including all results and inputs, in **Report Mode** by clicking the **View Report** button at the top right corner of the screen. 
  - You can add a title and description of the overall workflow at the top of the page. 
  - Re-submitting or re-computing any of the steps will automatically update the following steps in the workflow. 
  - Playbook workflows can be saved to your account, shared via link, or published to the **Published Playbooks** section of the website. 

## Developing Metanodes

### Core Concepts

The PPWB is designed to allow for the independent and parallel development of individual components, known as **metanodes**. There are two main types of metanodes, `Data` and `Process`: 
- **Data:** Entities that can be inputs/outputs of processes and have a designated "view" within the PPWB, e.g. a tabular view for gene count matrix data
- **Process:** Operations that act on an input data type to generate an output data type. Processes are divided into two subtypes:
    - **Prompt:** A user-driven action, such as an input form or a selection interface where the user decides the operation
    - **Resolver:** A programmatic action, such as an API call or a mathematical transformation, where the system automatically executes a pre-determined step

### Contribution Guidelines

1. Ensure that you have installed all system dependencies by following the [Installation Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/installation.md). 

2. Clone the [repository](https://github.com/nih-cfde/playbook-partnership/) from Github and checkout a new branch. 

3. Install dependencies and initialize the development interface using the following commands: 
  ```
  npm i
  npm run dev
  ```

4. Create new component directories under the `components` directory. All components should contain at least the following files:
  - `index.ts` or `index.tsx`: The file containing your exported meta node(s). For details on a specific meta node type, please refer to the full [Developer Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/contributions.md).
  - `package.json`: Name and other metadata for the new meta node, as follows: 

  ```
  {
    "name": "mycomponent",
    "version": "1.0.0",
    "license": "CC-BY-NC-SA-4.0",
    "author": "Your Name <youremail@email.com>",
    "contributors": [],
    "main": "index.tsx",
    "private": true,
    "dependencies": {},
    "devDependencies": {}
  }
  ```

5. Once your component is defined, run the following command to add the new meta node to the interface for development and testing on your local server: 
  ```
  npm run codegen:components
  ```

6. Once the meta node is functional, submit a pull request to the remote main branch, and add any documentation as needed. 

Return to [Standards and Protocols page](/info/standards)