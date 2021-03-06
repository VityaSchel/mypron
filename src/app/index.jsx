import React from 'react'
import { getTorrent, getTorrentsList, downloadTorrent } from '/lib/parseTools'
import { remove } from '/lib/cache'
import { shell } from '@tauri-apps/api'
import { listen } from '@tauri-apps/api/event'
import styles from './styles.module.scss'
import Skeleton from '@mui/material/Skeleton'
import SearchBox from './SearchBox'
import Pagination from '@mui/material/Pagination'

export function App(props) {
  const searchRef = React.useRef()
  const [torrentsList, setTorrentsList] = React.useState([])
  const [pagination, setPagination] = React.useState({ count: 1, current: 1 })

  React.useEffect(() => handleLoadHits(1), [])
  const handleLoadHits = async page => {
    const { list, pagination } = await getTorrentsList(page)
    list.type = 'hits'
    setPagination(pagination)
    setTorrentsList(list)
  }

  const handleChangePagination = (e, value) => {
    window.scrollTo(0, 0)
    setPagination({ ...pagination, current: value })
    switch(torrentsList.type) {
      case 'hits':
        handleLoadHits(value)
        break

      case 'search':
        searchRef.current.changePage(value)
        break
    }
  }

  React.useEffect(() => {
    let unlisten = () => {}
    (async () => {
      unlisten = await listen('clearPageCache', event => {
        torrentsList.map(({ id }) => id).forEach(id => remove(`torrent_${id}`))
      })
    })()
    return () => unlisten()
  }, [torrentsList])

  return (
    <>
      <SearchBox
        setTorrentsList={setTorrentsList}
        setPagination={setPagination}
        ref={searchRef}
      />
      <p>Страница {pagination.current} из {pagination.count}</p>
      <div className={styles.grid}>
        {torrentsList.map(item => <Item data={item} key={item.id} />)}
      </div>
      <Pagination
        count={pagination.count}
        page={pagination.current}
        onChange={handleChangePagination}
      />
    </>
  )
}

function Item(props) {
  const [thumbnails, setThumbnails] = React.useState({})
  const [showPreview, setShowPreview] = React.useState(false)
  const [showPreviewTimeout, setShowPreviewTimeout] = React.useState()

  React.useEffect(() => fetchInfo(), [])
  const fetchInfo = async () => {
    const thumbnailsInfo = await getTorrent(props.data.id)
    setThumbnails(thumbnailsInfo)
  }

  const handlePointerOver = () => { setShowPreviewTimeout(setTimeout(() => setShowPreview(true))) }
  const handlePointerOut = () => { clearTimeout(showPreviewTimeout); setShowPreview(false) }

  const handleClick = () => {
    downloadTorrent(thumbnails.download)
  }

  return (
    <div className={styles.item} onClick={handleClick} data-id={props.data.id}>
      <div className={styles.preview} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        {thumbnails.thumbnail
          ? (
            <>
              {showPreview && <video src={thumbnails.preview} autoplay mute loop></video>}
              <img src={thumbnails.thumbnail} alt='Предпросмотр' />
            </>
          ) : <Skeleton variant='rectangular' animation='wave' />
        }
      </div>
      <span className={styles.title}>{props.data.title.replaceAll(/#[^ #]+/g, '')}</span>
      <div className={styles.info}>
        <div className={styles.fileInfo}>
          <span className={styles.downloaders}>
            <span>{props.data.seeders}</span>/<span>{props.data.leechers}</span>
          </span>
          <span>{props.data.size}</span>
        </div>
        <span>{props.data.date}</span>
      </div>
    </div>
  )
}
