import { Routes, Route } from 'react-router-dom';

import { OrderList } from '../../pages/order-list/order-list.page';
// import { Project } from '../../pages/project/project.page';
import { Order } from '../../pages/order/order.page';

export const OrderRoute = () => {
  return (
    <Routes>
      <Route index element={<OrderList />} />
      <Route path=':order' element={<Order />} />
    </Routes>
  );
};
