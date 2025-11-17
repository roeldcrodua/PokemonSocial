Write-Host "Creating all PokemonSocial project files..." -ForegroundColor Green

# Update App.jsx
$appContent = @"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import MyHeroesPage from './pages/MyHeroesPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/my-heroes" element={<MyHeroesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
"@
Set-Content -Path "src/App.jsx" -Value $appContent
Write-Host "Created App.jsx" -ForegroundColor Cyan

Write-Host "`nAll files created successfully!" -ForegroundColor Green
