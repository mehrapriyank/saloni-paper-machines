import { Route, Routes } from 'react-router-dom';
import TopNavigation from './components/top-navigation/top-navigation.component';
import SideNavigaiton from './components/side-navigation/side-navigation.component';
import { InventoryDashboard } from './pages/inventory-dashboard/inventory-dashboard.page';
import { CreateOrderPage } from './pages/create-order/create-order.page';
import { UpdateOrderPage } from './pages/update-order/update-order.page';
import { CreateProjectPage } from './pages/create-project/create-project.page';
import { ProjectRoute } from './routes/projects/projects.route';
import { OrderRoute } from './routes/orders/orders.route';
import { LoginPage } from './pages/login/login.page';
import { UserContext } from './contexts/user.context';
import { useContext } from 'react';

function App() {
  const {currentUser} = useContext(UserContext);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}> </Route>
      <Route path='/' element={<TopNavigation></TopNavigation>}>
        
        <Route path='' element={<SideNavigaiton/>}>
          <Route path="/dashboard" element={<InventoryDashboard/>}>
          </Route>
          <Route path="projects/*" element={<ProjectRoute/>}>
          </Route>
          <Route path="orders/*" element={<OrderRoute/>}>
          </Route>
          <Route path='create-project' element={<CreateProjectPage/>}>
          </Route>
          <Route path='create-order' element={<CreateOrderPage/>}>
          </Route>
          <Route path='update-order' element={<UpdateOrderPage/>}>
          </Route>
        </Route>
        
        
      </Route>
     
    </Routes>
  )
}

export default App;
