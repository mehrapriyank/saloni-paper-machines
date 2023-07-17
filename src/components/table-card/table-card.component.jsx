import $ from 'jquery';
import { Link } from 'react-router-dom';
// import 'datatables.net'
// import 'datatables.net-responsive-bs5';
// import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
// import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';

import { Fragment } from 'react';
export const ProjectTableCard = ({projectID, projectDetails}) => {
  return (
    <div className="table-responsive">
      <table className="table table-centered table-nowrap table-hover mb-0">
          <tbody>
          {
            projectDetails.map((project) => {
              const { product_id, ordered_quantity, product_type, required_quantity, recieved_accepted,
               recieved_rejected, quantity_type} = project;
              return (
                <tr key={`${projectID}_${product_id}_${Math.floor(Math.random() * 10)}`}>
                    
                  <td className='col-xl-2 text-center'>
                      <span className="text-muted font-13">Product Type</span>
                      <h5 className="font-14 mt-1 fw-normal">{product_type}</h5>
                  </td>
                  <td className='col-xl-2 text-center'>
                      <span className="text-muted font-13">Product ID</span> <br/>
                      <h5 className="font-14 mt-1 fw-normal">{product_id}</h5>
                  </td>
                  <td className='col-xl-2 text-center'>
                      <span className="text-muted font-13">Required</span>
                      <h5 className="font-14 mt-1 fw-normal">{`${required_quantity} ${quantity_type || ""}`}</h5>
                  </td>
                  <td className='col-xl-2 text-center'>
                      <span className="text-muted font-13">Ordered</span>
                      <h5 className="font-14 mt-1 fw-normal">{ordered_quantity}</h5>
                  </td>
                  
                  <td className='col-xl-2 text-center'>
                      <span className="text-muted font-13">Recieved</span><br></br>
                      <span className={`font-14 mt-1 badge badge-${recieved_accepted/ordered_quantity === 1? "success" : "warning"}-lighten`}>{recieved_accepted}</span>
                      {
                        recieved_rejected !== "0" ? (
                          <Fragment>
                            <span className="font-14 mt-1 ">{`  `}</span>
                            <span className="font-14 mt-1 badge badge-danger-lighten">{recieved_rejected}</span>
                          </Fragment>
                        ):""
                      }
                      {/* <h5 className={`font-14 mt-1 fw-normal badge badge-${recieved_accepted/order_quantity === 1? "success" : "warning"}-lighten`}>{`${recieved_accepted}/${recieved_rejected}`}`</h5> */}
                  </td>
                </tr>
              )
            })
          }
          </tbody>
      </table>
    </div> 
  )
}

export const ProductTableCard = ({productType, productDetails}) => {
  return (
    <div className="table-responsive">
      <table className="table table-centered table-nowrap table-hover mb-0">
          <tbody>
          {
            productDetails.map((product) => {
              const {product_id, recieved, used, dispatched, quantity_type} = product;
              return (
                <tr key={`${productType}_${Math.floor(Math.random() * 10)}_${product_id}`}>
                    
                    <td className='col-xl-2 text-center'>
                        <span className="text-muted font-13">Product ID</span>
                        <h5 className="font-14 mt-1 fw-normal">{product_id}</h5>
                    </td>
                    
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Recieved</span> <br/>
                        <span className="font-14 mt-1 badge badge-primary-lighten">{`${recieved} ${quantity_type || ""}`}</span>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Used</span><br/>
                        <span className="font-14 mt-1  badge badge-warning-lighten">{used}</span>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Dispatched</span><br/>
                        <span className="font-14 mt-1  badge badge-warning-lighten">{dispatched}</span>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Remaining</span><br/>
                        <span className={`font-14 mt-1 badge badge-${recieved - dispatched > 0 ? "success":"danger"}-lighten`}>{recieved - dispatched}</span>
                    </td>
              
                </tr>
              )
            })
          }
          </tbody>
      </table>
    </div> 
  )
}
