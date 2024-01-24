### Table of Contents
* [Introduction](#introduction)
* [Resources](#resources)
* [Developing Meta Nodes for the PPWB](#developing-meta-nodes)
  * [Core Concepts](#core-concepts)

## Introduction

The Playbook Partnership Workflow Builder (PPWB) consists of a network of biomedical datasets, API endpoints, and other developed tools from both within and external to the CFDE. Users can traverse the graph database visually by selecting various options for some following data set or imputation task. Each meta node within the PWB can be independently constructed or used, preferably by someone already familiar with a given tool’s functionality. To use the PPWB, users start from a list of possible inputs, and then sequentially select the different transformations, queries, visualizations, or other computations they wish to add to the workflow. 

## Resources

For more detailed tutorials on using or developing for the PPWB, please refer to the following guides:
- [PWB User Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/user/index.md)
- [PWB Developer Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/index.md)

## Developing Meta Nodes

### Core Concepts

The PPWB is designed to allow for the independent and parallel development of individual components, known as **meta nodes**. There are two main types of meta nodes, `Data` and `Process`: 
- **Data:** Entities that can be inputs/outputs of processes and have a designated "view" within the PPWB, e.g. a tabular view for gene count matrix data
- **Process:** Operations that act on an input data type to generate an output data type. Processes are divided into two subtypes:
    - **Prompt:** A user-driven action, such as an input form or a selection interface where the user decides the operation
    - **Resolver:** A programmatic action, such as an API call or a mathematical transformation, where the system automatically executes a pre-determined step

Return to [Standards and Protocols page](/info/standards)