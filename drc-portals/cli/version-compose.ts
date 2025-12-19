import fs from 'fs'
import path from 'path'
import packageJson from '@/package.json'

const image = process.argv[2]
if (!image) throw new Error('missing argument')
const rc = process.argv[3] === 'rc'
const version = process.env.npm_package_version ?? packageJson.version

let compose = fs.readFileSync(path.join(__dirname, '..', 'docker-compose.yaml'), { encoding: 'utf-8' })
const m = new RegExp(`${image.replace('/','\\/')}:([\\d\\.]+)(-rc.(\\d+))?`, 'g').exec(compose)
if (!m) throw new Error(`${image} not found`)
if (rc) {
  const imageVersion = m[1]
  const rcVersion = imageVersion === version ? Number(m[3] ?? '0') : 0
  compose = compose.replace(m[0], `${image}:${version}-rc.${rcVersion+1}`)
} else {
  compose = compose.replace(m[0], `${image}:${version}`)
}
fs.writeFileSync(path.join(__dirname, '..', 'docker-compose.yaml'), compose)
