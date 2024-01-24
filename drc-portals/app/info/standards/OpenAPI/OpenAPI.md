### Introduction
Application programming interfaces (APIs) provide a set of protocols that broadly allow different software programs to communicate. In the biomedical sciences, many tools and resources have APIs that facilitate querying, downloading, or computing on the available data. For instance, the GTEx DCC provides APIs for programmatically retrieving RNA-seq data, while the GlyGen APIs return information related to different glycans, proteins, and motifs. 

The [OpenAPI specification language](https://spec.openapis.org/oas/latest.html), developed by the [OpenAPI initiative](https://www.openapis.org/), is a standardized language for succinctly describing an API’s functionality, including its inputs and outputs, without requiring users to have any prior knowledge of the backend. OpenAPI specifications are programming-language agnostic, and the standardized format is supported by resources such as [Swagger](https://swagger.io/), which allows for the efficient testing, development, and publishing of API specifications. Within the CFDE, the OpenAPI specification language has the potential to improve the interoperability of DCC APIs with each other and with tools external to the consortium. 

The [SmartAPI specification language](https://github.com/SmartAPI/smartAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md) extends OpenAPI to capture more metadata to maximize the findability, accessibility, interoperability, and reusability (FAIRness) of web-based APIs, especially within the context of biomedical big data. Specifically, SmartAPIs allow for additional metadata fields, such as requiring an API version and a link to the original tool terms of service as well as including a space to list more contacts or external resources related to the API. In addition to the specifications, SmartAPI also provides an editor for writing and testing APIs as well as a registry of 200+ APIs that have already been deployed and published, including several DCC tools. Currently, SmartAPI is supported by the Biomedical Data Translator program from the National Center for Advancing Translational Sciences (NCATS). 

### Resources
- [SmartAPI Registry](https://smart-api.info/registry)
- [Example SmartAPI v3.0 specifications](https://github.com/SmartAPI/smartAPI-Specification/tree/OpenAPI.next/examples/v3.0)

### Designing SmartAPI Specifications

As an example, the following tutorial will adapt two endpoints from the [FAIRshake v2 API specifications](). 

1. Initialize your root document with metadata and server information. OpenAPI/SmartAPI specifications can be written in either JSON or YAML, but the information contained should be generally the same regardless of format, and include the following required fields, as well as any relevant optional fields: 

    - `openapi`: Semantic version number of OpenAPI specification
    - `info`: API metadata
        - `termsOfService`: URL to terms of service for API 
        - `version`: Semantic Version of the API definition
        - `contact`: Name, email, and role of contact information
    - `servers`: List of available servers called by API
    - `paths`: List of endpoints/operations for the API

    JSON:
    ```
    {
      "openapi": "3.0",
      "info": {
        "title": "FAIRshake API",
        "version": "1.0",
        "description": "Web interface for scoring biomedical digital objects", 
        "termsOfService": "https://fairshake.cloud/",
        "contact": {
          "name": "John Doe",
          "email": "johndoe@email.com",
          "x-role": "responsible developer"
        }
      },
      "servers": [
        {
          "url": "https://fairshake.cloud",
        }
      ],
      "paths": {
        ...
      }
    }
    ```

    YAML:
    ```
    openapi: 3.0
    info: 
      title: FAIRshake API
      version: 1.0
      description: Web interface for scoring biomedical digital objects
      termsOfService: https://fairshake.cloud/
      contact:
        name: John Doe
        email: johndoe@email.com
        x-role: responsible developer
    servers:
    - url: https://fairshake.cloud
    paths:
      ...
    ```

2. Identify the core functionality: What queries are available, and from which servers? What types of information can be extracted? Are any credentials needed to access certain data? 

    - In our tutorial, we are concerned with two endpoints: a POST request which creates a new digital object from an integer `id`, a pre-defined `type`, a string `url`, and a list of `authors`; and a GET request to search through a list of existing digital objects using the `url` parameter. 

3. For each potential endpoint, determine the type of request method (POST, GET, DELETE, etc.) and the required input values and content type. Each of these should be listed under `paths` in the document. 

    - For a POST method, the input will take the form of a Request Body Object, which also requires a media type. The most common media types are `text/plain` for plaintext inputs, `application/json` for JSON-formatted inputs, and `multipart/form-data` for single or multiple file upload inputs. Below, we define our example POST request. 

    JSON
    ```
    "paths": {
      "/digital_object": {
        "post": {
          "operationId": "digital_object_create",
          "description": "Create a digital object",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "url"
                  ],
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "data",
                        "repo",
                        "test",
                        "tool"
                      ]
                    },
                    "url": {
                      "type": "string",
                      "maxLength": 255,
                      "minLength: 1
                    },
                    "authors": {
                      "type": "array",
                      "items": {
                        "type": "integer",
                      },
                      "uniqueItems": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Sucess",
              "content": {
                ...
              }
            }
          }
        }
      }
    }
    
    ```

    YAML
    ```
    paths:
      /digital_object:
        post: 
          operationId: digital_object_create
          description: Create a digital object
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  type: object
                  required:
                  - url
                  properties:
                    id:
                      type: integer
                    type: 
                      type: string
                      enum: 
                      - data
                      - repo
                      - test
                      - tool
                    url:
                      type: string
                      maxLength: 255
                      minLength: 1
                    authors:
                      type: array
                      items:
                        type: integer
                      uniqueItems: true
          responses:
            200: 
              description: Success
              content:
                ...
    ```

    - For a GET method, the input may require defined parameters, which can usually be located within the path or the header of a request. 

4. For each potential endpoint, determine the type of response that should be returned for each status. The requested data should be returned only when the status code is 200.

    - For error codes (4XX, 5XX), you may choose to “catch” these errors by defining some behavior that should occur if the error is triggered. 

5. Endpoint by endpoint, fill in and test the API specifications as directed in steps 1-3 using a dedicated OpenAPI or SmartAPI editor, such as Swagger. Such tools designated for writing OpenAPIs or SmartAPIs also usually allow for testing and publishing API documentation. 

Return to [Standards and Protocols page](/info/standards)
