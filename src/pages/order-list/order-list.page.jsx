import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from '../../contexts/user.context';
import { useContext } from 'react';

function removeDup(arr) {
  let result = []
  arr.forEach((item, index) => { if (arr.indexOf(item) == index) result.push(item) });
  return result;
}

export const OrderList = () => {
  const {currentUser} = useContext(UserContext);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    ( async () => {
      if (currentUser){
        const order_list = [];
        const urlRequest = "http://127.0.0.1:80/spm/get_po_agg";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();

        response_data.forEach(({po_number, product_ids, product_types, created_by, created_at, expected_deliverys}) => {
          const order_details = {};
          order_details["order_id"] = po_number;
          order_details["product_ids"] = removeDup(JSON.parse(product_ids));
          order_details["product_types"] = removeDup(JSON.parse(product_types));
          order_details["urgent"] = JSON.parse(expected_deliverys).some((delivery) => {
            if (delivery){
              const today = new Date();
              const del_date = new Date(delivery);
              const follow_up_date = new Date(today.setDate(today.getDate() + 20));
              console.log({follow_up_date, del_date});
              return follow_up_date > del_date;
            }
          });
          // order_details["projects"] = removeDup(JSON.parse(projects));
          order_details["created_by"] = created_by;
          order_details["created_at"] = created_at;

          order_list.push(order_details);
        });
        setProjects(order_list);

        console.log(order_list);
      }
    }
    )()
  }, [])

  return (

    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
              <div className="col-sm-4">
                  <div className="page-title-box">
                      <h3 className="page-title">Orders</h3>
                  </div>
              </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-4">
                <Link to="/create-order" className="btn btn-danger rounded-pill mb-3"><i className="mdi mdi-plus"></i> Create New Order</Link>
            </div>
          </div>
          <div className="table-responsive table-centered">
            <table className="table table-centered w-100 dt-responsive nowrap" id="products-datatable">
            <thead className="table-light">
                <tr>
                    <th className="all">Order ID</th>
                    {/* <th>Projects</th> */}
                    <th>Product Type(s)</th>
                    <th>Product ID(s)</th>
                    {/* <th>Created On</th> */}
                    <th>Follow Up</th>
                </tr>
            </thead>
            <tbody>
              {
                
                projects.map(({order_id, product_ids, product_types, urgent}) => {
                  return (
                    <tr key={order_id}>
                      <td><h5><Link to={`/orders/${order_id.split('/').join('--')}`} className="text-body">{order_id}</Link></h5></td>
                      {/* <td>{projects.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td> */}
                      <td style={{"width": "25%"}}>{product_types.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      <td style={{"width": "25%"}}>{product_ids.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      {/* <td>{created_at.split(" ")[0]}</td> */}
                      {
                        urgent? <td><span className="ms-1 badge badge-danger-lighten">Follow Up</span></td>
                        :
                        <td><span className="ms-1 badge badge-success-lighten">No Expected Delivery</span></td>
                      }
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}