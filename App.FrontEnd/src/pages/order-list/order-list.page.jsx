import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function removeDup(arr) {
  let result = []
  arr.forEach((item, index) => { if (arr.indexOf(item) == index) result.push(item) });
  return result;
}

export const OrderList = () => {
  const [projects, setProjects] = useState([]);
  const order_list = [];
  useEffect(() => {
    ( async () => {
      const urlRequest = "http://192.168.1.4:80/spm/get_po_agg";
      const response =  await fetch(urlRequest, {
        method: 'get', mode: 'cors', contentType: 'application/json',
      });
      const response_data = await response.json();

      response_data.forEach(({po_number, product_ids, product_types, created_by, created_at}) => {
        const order_details = {};
        order_details["order_id"] = po_number;
        order_details["product_ids"] = removeDup(JSON.parse(product_ids));
        order_details["product_types"] = removeDup(JSON.parse(product_types));
        // order_details["projects"] = removeDup(JSON.parse(projects));
        order_details["created_by"] = created_by;
        order_details["created_at"] = created_at;

        order_list.push(order_details);
      });
      setProjects(order_list);

      console.log(response_data);
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
                    <th>Created By</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>
              {
                
                projects.map(({order_id, product_ids, product_types, created_by,created_at }) => {
                  return (
                    <tr key={order_id}>
                      <td><h5><Link to={`/orders/${order_id.split('/').join('--')}`} className="text-body">{order_id}</Link></h5></td>
                      {/* <td>{projects.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td> */}
                      <td>{product_types.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      <td>{product_ids.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      <td>{created_by}</td>
                      <td>{created_at}</td>
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