import { http, fs, shell } from '@tauri-apps/api'
import { cacheDir, has as hasCache, get as getCache, set as setCache } from './cache'
import { v4 as uuid } from 'uuid'

async function parse(url) {
  const response = await http.fetch(url, { responseType: http.ResponseType.Text })
  const domParser = new DOMParser()
  const root = domParser.parseFromString(response.data, 'text/html')
  return root
}

function parseTorrentsList(root) {
  const pagination = root.querySelector('.pagination_div > div').innerText.match(/Page (\d+) of (\d+)/)
  return {
    list: Array.from(root.querySelectorAll('.torrent_element')).map(torrent => {
    	const title = torrent.querySelector('.tdn:nth-child(2)')
    	const info = torrent.querySelectorAll('.teiv')
    	return {
    		title: title.getAttribute('title'),
    		date: info[0].innerText,
    		size: info[1].innerText,
    		seeders: info[4].innerText,
    		leechers: info[5].innerText,
    		id: title.getAttribute('href').match(/^\/t\/([^?]+)\??.*$/)[1]
    	}
    }),
    pagination: { count: Number(pagination[2]), current: Number(pagination[1]) }
  }
}

async function parseTorrent(root) {
  let content = root.querySelector('.torrent_links').getAttribute('data-content')
  content = JSON.parse(content.replaceAll('\\', ''))
  const prependHttps = url => url?.startsWith('https:') ? url : `https:${url}`
  const findExtension = (array, extensions) => array.find(url => extensions.some(ending => url.endsWith(ending)))

  let thumbnail = prependHttps(findExtension(content, ['png', 'jpg', 'jpeg']) ?? content[1] ?? content[0])
  if(thumbnail.endsWith('.html')) {
    const imageHoster = new URL(thumbnail).hostname
    const allowedHosters = ['adultphotosets.best']
    if(allowedHosters.includes(imageHoster)) {
      const thumbnailHTML = await parse(thumbnail)
      switch(imageHoster) {
        case 'adultphotosets.best':
          thumbnail = `https://adultphotosets.best${thumbnailHTML.querySelector('#content img').getAttribute('src')}`
          break
      }
    }
  }

  return {
  	thumbnail: thumbnail,
  	preview: prependHttps(findExtension(content, ['mp4', 'gif']) ?? content[2] ?? content[1] ?? content[0]),
    download: root.querySelector('.torrent_download_div > a:nth-child(1)').getAttribute('href')
  }
}

const fetchTorrentsList = (page = 1) => parse(`https://myporn.club/ts/hits/week/${page}`)

export async function getTorrentsList(page) {
  return await parseTorrentsList(await fetchTorrentsList(page))
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

const fetchTorrentsSearchResults = (term, page = 1) => parse(`https://myporn.club/s/${encodeURIComponent(term.replaceAll(' ', '-'))}/${page}`)

export async function searchTorrents(term, page) {
  return await parseTorrentsList(await fetchTorrentsSearchResults(term, page))
}

export async function downloadTorrent(url) {
  const response = await http.fetch(url, { responseType: http.ResponseType.Binary })
  const filepath = `${await cacheDir()}/${uuid()}.torrent`
  await fs.writeBinaryFile({
    contents: response.data,
    path: filepath
  })
  shell.open(filepath)
  return true
}
