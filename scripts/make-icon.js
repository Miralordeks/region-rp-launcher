const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')

async function main() {
  const pngToIco = (await import('png-to-ico')).default
  const input = path.join(__dirname, '../build/icon.png')
  const output = path.join(__dirname, '../build/icon.ico')
  const sizes = [256, 128, 64, 48, 32, 16]
  const tempFiles = []

  for (const size of sizes) {
    const temp = path.join(__dirname, `../build/_icon-${size}.png`)
    await sharp(input)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(temp)
    tempFiles.push(temp)
  }

  const buf = await pngToIco(tempFiles)
  fs.writeFileSync(output, buf)

  for (const file of tempFiles) {
    fs.unlinkSync(file)
  }

  console.log(`Wrote ${output} (${buf.length} bytes)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
