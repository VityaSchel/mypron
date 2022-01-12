import { http } from '@tauri-apps/api'
import { has as hasCache, get as getCache, set as setCache } from './cache'

async function parse(url) {
  const response = await http.fetch(url, { responseType: http.ResponseType.Text })
  const domParser = new DOMParser()
  const root = domParser.parseFromString(response.data, 'text/html')
  return root
}

function parseTorrentsList(root) {
  return Array.from(root.querySelectorAll('.torrent_element')).map(torrent => {
  	const title = torrent.querySelector('.tdn:nth-child(2)')
  	const info = torrent.querySelectorAll('.teiv')
  	return {
  		title: title.getAttribute('title'),
  		date: info[0].innerText,
  		size: info[1].innerText,
  		seeders: info[4].innerText,
  		leechers: info[5].innerText,
  		id: title.getAttribute('href').substring(3)
  	}
  })
}

function parseTorrent(root) {
  let content = root.querySelector('.torrent_links').getAttribute('data-content')
  content = JSON.parse(content.replaceAll('\\', ''))
  return {
  	thumbnail: `https:${content[2]}`,
  	preview: `https:${content[1]}`,
    download: root.querySelector('.torrent_download_div > a:nth-child(2)').getAttribute('href')
  }
}

const fetchTorrentsList = (page = 1) => parse(`https://myporn.club/ts/hits/week/${page}`)

export async function getTorrentsList() {
  return await parseTorrentsList(await fetchTorrentsList())
}

const fetchTorrent = id => parse(`https://myporn.club/t/${id}`)

export async function getTorrent(id) {
  const cacheFilename = `torrent_${id}`
  if(await hasCache(cacheFilename)){
    return await getCache(cacheFilename)
  } else {
    const torrentInfo = await parseTorrent(await fetchTorrent(id))
    await setCache(cacheFilename, torrentInfo)
    return torrentInfo
  }
}
