import React from 'react'
import { getTorrent, getTorrentsList } from './parseTools'
import { shell } from '@tauri-apps/api'
import styles from './styles.module.scss'
import Skeleton from '@mui/material/Skeleton'

export function App(props) {
  const [torrentsList, setTorrentsList] = React.useState([])

  const handleClick = async () => {
    const list = await getTorrentsList()
    setTorrentsList(list)
  }

  return (
    <>
      <div className={styles.grid}>
        {torrentsList.map(item => <Item data={item} />)}
      </div>
      <button onClick={handleClick}>Hello world</button>
    </>
  )
}

function Item(props) {
  const [thumbnails, setThumbnails] = React.useState({})
  const [showPreview, setShowPreview] = React.useState(false)

  React.useEffect(() => fetchInfo(), [])
  const fetchInfo = async () => {
    const thumbnailsInfo = await getTorrent(props.data.id)
    setThumbnails(thumbnailsInfo)
  }

  const handlePointerOver = () => setShowPreview(true)
  const handlePointerOut = () => setShowPreview(false)

  const handleClick = () => {
    shell.open(thumbnails.download)
  }

  return (
    <div className={styles.item} onClick={handleClick}>
      <div className={styles.preview} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        {thumbnails.thumbnail
          ? (
            <>
              {showPreview && <video src={thumbnails.preview} autoplay mute></video>}
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
