import { fs, path } from '@tauri-apps/api'

async function cacheDirPath() {
  const dirPath = await path.cacheDir()
  return dirPath.endsWith('/') ? dirPath.slice(0, -1) : dirPath
}

export const cacheDir = async () => `${await cacheDirPath()}/com.vityaschel.mypron`

export async function has(filename) {
  try {
    await fs.readBinaryFile(`${await cacheDir()}/${filename}`)
  } catch(e) {
    return false
  }
  return true
}

export async function set(filename, data) {
  const cacheDirectory = await cacheDir()
  try { await fs.createDir(cacheDirectory) } catch(e) {/**/}

  const content = JSON.stringify(data)
  const binaryBuffer = new TextEncoder().encode(content)
  await fs.writeBinaryFile({
    contents: binaryBuffer,
    path: `${cacheDirectory}/${filename}`
  })
  return true
}

export async function get(filename) {
  const binaryBuffer = await fs.readBinaryFile(`${await cacheDir()}/${filename}`)
  const rawContent = new TextDecoder().decode(new Uint8Array(binaryBuffer))
  const content = JSON.parse(rawContent)
  return content
}
