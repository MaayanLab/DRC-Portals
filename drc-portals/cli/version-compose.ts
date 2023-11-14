const fs = require('fs')
const path = require('path')

let compose = fs.readFileSync(path.join(__dirname, '..', 'docker-compose.yaml'), { encoding: 'utf-8' })
compose = compose.replaceAll(/maayanlab\/drc-portal:[\d\.]+/g, `maayanlab/drc-portal:${process.env.npm_package_version}`)
fs.writeFileSync(path.join(__dirname, '..', 'docker-compose.yaml'), compose)
