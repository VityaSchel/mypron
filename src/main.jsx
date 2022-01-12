import { render } from 'preact'
import { App } from './app'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const darkTheme = createTheme({
  palette: { mode: 'dark' }
})

render(
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>,
  document.getElementById('app')
)
