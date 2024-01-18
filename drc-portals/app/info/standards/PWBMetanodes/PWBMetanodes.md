### Introduction

The Playbook Partnership Workflow Builder (PPWB) consists of a network of biomedical datasets, API endpoints, and other developed tools from both within and external to the CFDE. Users can traverse the graph database visually by selecting various options for some following data set or imputation task. Each meta node within the PWB can be independently constructed or used, preferably by someone already familiar with a given tool’s functionality. To use the PPWB, users start from a list of possible inputs, and then sequentially select the different transformations, queries, visualizations, or other computations they wish to add to the workflow. 

### Resources
- [PWB User Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/user/index.md)
- [PWB Developer Guide](https://github.com/nih-cfde/playbook-partnership/blob/main/docs/index.md)

### Playbook Workflow Core Concepts

The PPWB is designed to allow for the independent and parallel development of individual components, known as **meta nodes**. There are two main types of meta nodes: 
- Data
- Process
    - Prompt
    - Resolver


