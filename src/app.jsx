import React from 'react'
import { getTorrentsList } from './parseTools'
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
  const parseHashtags = text => (
    <>
      {
        text.split(' ').map(
          text => text[0] === '#'
            ? <span className={styles.hastag}>{text}</span>
            : text
        ).reduce(
          (prev, word) => typeof word === 'string'
            ? prev.slice(0, -1).concat(
                prev[prev.length - 1]
                  ? `${prev[prev.length - 1]} ${word}`
                  : word
              )
            : prev.concat(word)
        , [])
      }
    </>
  )

  return (
    <div className={styles.item}>
      <div className={styles.preview}>
        <Skeleton variant='rectangular' animation='wave' />
      </div>
      <span className={styles.title}>{parseHashtags(props.data.title)}</span>
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
