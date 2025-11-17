import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import MyHeroesPage from './pages/MyHeroesPage'
import SearchPage from './pages/SearchPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/my-heroes" element={<MyHeroesPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
