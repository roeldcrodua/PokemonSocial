import Navbar from './Navbar'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2025 PokemonSocial - Share Your Pokemon Heroes</p>
      </footer>
    </div>
  )
}
