import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import './Nav.css'

export function Layout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  )
}
