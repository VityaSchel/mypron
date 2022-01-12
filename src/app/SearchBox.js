import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import { searchTorrents } from '/lib/parseTools'

const SearchBox = React.forwardRef((props, ref) => {
  const [value, setValue] = React.useState('')

  const handleSubmit = e => {
    e.preventDefault()
    initSearch(1)
  }

  const initSearch = async (page = 1) => {
    const { list, pagination } = await searchTorrents(value, page)
    list.type = 'search'
    props.setPagination(pagination)
    props.setTorrentsList(list)
  }

  React.useImperativeHandle(ref, () => ({
    changePage(newPage) {
      initSearch(newPage)
    }
  }))

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        value={value}
        onInput={({ target: { value } }) => setValue(value)}
        InputProps={{
          endAdornment: <InputAdornment position='end'>
            <IconButton onClick={handleSubmit}><SearchIcon /></IconButton>
          </InputAdornment>,
        }}
        fullWidth
        label='Поиск'
      />
    </form>
  )
})

SearchBox.propTypes = {
  setTorrentsList: PropTypes.func,
  setPagination: PropTypes.func,
}

export default SearchBox
