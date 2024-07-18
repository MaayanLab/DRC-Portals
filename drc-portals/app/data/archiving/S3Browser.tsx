import {
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";

function human_size(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unit
  for (let i = 0; i < units.length-1; i++) {
    unit = units[i]
    if (size < 1000) {
      break
    } else {
      size /= 1000
    }
  }
  return `${size.toFixed(2)} ${unit}`
}

export default async function S3Browser() {
  const client = new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_KEY as string,
    },
  })
  const command = new ListObjectsCommand({
    Bucket: "cfde-archive"
  });
  const response = await client.send(command)

  return (
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {response.Contents?.map((o) => (
          <tr key={o.ETag}>
            <td className="px-2">s3://cfde-archive/{o.Key}</td>
            <td className="px-2">{o.Size ? human_size(o.Size) : null}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}