import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Collections } from "./pages/Collections";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Checkout } from "./pages/Checkout";
import AdminLogin from "./pages/admins/AdminLogin";
import AdminDashboard from "@/pages/admins/Admin";
import AdminProducts from "@/pages/admins/AdminProducts";
import { AdminCategory } from "@/pages/admins/AdminCategory";
import AdminLogs from "@/pages/admins/AdminLogs";
import { AdminOrders } from "@/pages/admins/AdminOrders";
import AdminLayout from "@/layouts/AdminLayout";
import AdminWilaya from "@/pages/admins/AdminWilaya";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="collections" element={<Collections />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="shipping-zones" element={<AdminWilaya />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>
    </Routes>
  );
}

export default App;
