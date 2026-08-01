import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoleRoute from './components/RoleRoute'
import SupervisorReports from './pages/SupervisorReports'
import ManagerReports from './pages/ManagerReports'
import CEOReports from './pages/CEOReports'
import LandingPage from "./pages/LandingPage"
import OrderPage from "./pages/OrderPage"
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Production from './pages/Production' 
import Harvest from './pages/Harvest' 
import AgroChemicals from './pages/AgroChemicals' 
import Fertilizers from './pages/Fertilizers' 
import AdminOrders from './pages/AdminOrders'
import AuditReport from './pages/AuditReport'
import ObservationNotes from './pages/ObservationNotes'
import WaterSupply from './pages/WaterSupply'
import Broilers from './pages/Broilers'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AdminBlog from './pages/AdminBlog'
import ProfitLoss from './pages/ProfitLoss'
import PrivateRoute from './components/PrivateRoute'




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<OrderPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/sales" element={
          <PrivateRoute>
            <Sales />
          </PrivateRoute>
        } />

       <Route path="/production" element={
          <PrivateRoute>
            <Production /> 
          </PrivateRoute>
        } />

        <Route path="/harvest" element={
          <PrivateRoute>
            <Harvest /> 
          </PrivateRoute>
        } />

        <Route path="/agrochemicals" element={
          <PrivateRoute>
            <AgroChemicals /> 
          </PrivateRoute>
        } />

        <Route path="/fertilizers" element={
          <PrivateRoute>
            <Fertilizers /> 
          </PrivateRoute>
        } />

        <Route path="/admin/orders" element={
          <PrivateRoute>
            <AdminOrders /> 
          </PrivateRoute>
        } />

        <Route path="/admin/blog" element={
          <PrivateRoute>
            <AdminBlog />
          </PrivateRoute>
        } />

        <Route path="/profit-loss" element={
          <PrivateRoute>
            <ProfitLoss />
          </PrivateRoute>
        } />

        <Route path="/audit-report" element={
          <PrivateRoute>
            <AuditReport /> 
          </PrivateRoute>
        } />

        <Route path="/observation-notes" element={
          <PrivateRoute>
            <ObservationNotes  /> 
          </PrivateRoute>
        } />

        <Route path="/water-supply" element={
          <PrivateRoute>
            <WaterSupply /> 
          </PrivateRoute>
        } />

        <Route path="/broilers" element={
          <PrivateRoute>
            <Broilers /> 
          </PrivateRoute>
        } />

        
        <Route path="/reports/supervisor" element={
          <RoleRoute allowedRoles={['supervisor']}>
            <SupervisorReports />
          </RoleRoute>
        } />

        <Route path="/reports/manager" element={
          <RoleRoute allowedRoles={['manager']}>
            <ManagerReports />
          </RoleRoute>
        } />

        <Route path="/reports/ceo" element={
          <RoleRoute allowedRoles={['ceo']}>
            <CEOReports />
          </RoleRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App