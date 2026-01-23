import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Collections } from './pages/Collections'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Admin } from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="collections" element={<Collections />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      {/* Admin route without MainLayout header/footer */}
      <Route path="admin" element={<Admin />} />
    </Routes>
  )
}

export default App
