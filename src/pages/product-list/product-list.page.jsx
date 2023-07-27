import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/user.context";
import $ from "jquery";

import DataTable from "datatables.net-bs5";

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const {currentUser} = useContext(UserContext);


  
  useEffect(() => {
    ( async () => {
      if (currentUser) {
        const urlRequest = "http://127.0.0.1:80/spm/get_products";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();

        await setProducts(response_data.products);

        // $(function () {
        //   $("#basic-datatable").DataTable();
        // })
        
      }
    }
    )()

  },[])

  return (

    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
              <div className="col-sm-5">
                  <div className="page-title-box">
                      <h3 className="page-title">Products</h3>
                  </div>
              </div>
          </div>
          <div className="table-responsive table-centered">
            <table id="basic-datatable" className="table dataTable dt-responsive nowrap w-100">
              <thead className="table-light">
                  <tr>
                      <th className="all">Product</th>
                      <th>Project ID</th>
                      <th>Order ID</th>
                      <th>Challan/Bill(s)</th>
                      <th>Recieved</th>
                      <th>Status</th>
                  </tr>
              </thead>
              <tbody>
              {
                products.map(({challan_id, project_name, po_number, product_id, product_type, recieved_quantity,status, quantity_type }) => {
                  return (
                    <tr key={`${product_type}_${product_id}_${recieved_quantity}_${Math.floor(Math.random() * 10)}`}>
                      <td><h5>{`${product_type} - ${product_id}`}</h5></td>
                      <td><span className={`ms-1 badge badge-primary-lighten`}>{project_name}</span></td>
                      <td><span className={`ms-1 badge badge-primary-lighten`}>{po_number}</span></td>
                      <td><span className={`ms-1 badge badge-primary-lighten`}>{challan_id}</span></td>
                      <td><span className={`ms-1 badge badge-${status.toUpperCase() === 'ACCEPTED'? "success": "danger"}-lighten`}>{`${recieved_quantity} ${quantity_type||""}`}</span></td>
                      <td><span className={`ms-1 badge badge-${status.toUpperCase() === 'ACCEPTED'? "success": "danger"}-lighten`}>{status}</span></td>
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