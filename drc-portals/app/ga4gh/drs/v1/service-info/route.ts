export async function GET(request: Request) {
  return Response.json({
    "id": "cloud.cfde.drs",
    "name": "CFDE DRS Server",
    "type": {
      "group": "org.ga4gh",
      "artifact": "drs",
      "version": "1.0.0"
    },
    "description": "This service provides DRS for the CFDE submitted files.",
    "organization": {
      "name": "CFDE DRC",
      "url": "https://info.cfde.cloud"
    },
    "contactUrl": "mailto:avi.maayan@mssm.edu",
    "documentationUrl": "https://info.cfde.cloud",
    "createdAt": '2024-02-02T13:00:00Z',
    "environment": "production",
    "version": "1.0.0"
  })
}