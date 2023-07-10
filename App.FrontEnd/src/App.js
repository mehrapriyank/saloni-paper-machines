import { Route, Routes } from 'react-router-dom';
import TopNavigation from './components/top-navigation/top-navigation.component';
import SideNavigaiton from './components/side-navigation/side-navigation.component';
import { InventoryDashboard } from './pages/inventory-dashboard/inventory-dashboard.page';
import { CreateOrderPage } from './pages/create-order/create-order.page';
import { UpdateOrderPage } from './pages/update-order/update-order.page';
import { CreateProjectPage } from './pages/create-project/create-project.page';
import { ProjectRoute } from './routes/projects/projects.route';
import { OrderRoute } from './routes/orders/orders.route';

function App() {
  const url = window.location.href.split('/')
  const projectID = url[url.length-1];
  return (
    <Routes>
      <Route path='/' element={<TopNavigation></TopNavigation>}>
        <Route path='/' element={<SideNavigaiton/>}>
          <Route index element={<InventoryDashboard/>}>
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
