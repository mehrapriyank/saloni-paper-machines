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
               recieved_rejected, used_quantity, dispatched_quantity, quantity_type} = project;
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
                  <td className='col-xl-1 text-center'>
                      <span className="text-muted font-13">Required</span>
                      <h5 className="font-14 mt-1 fw-normal">{`${required_quantity} ${quantity_type || ""}`}</h5>
                  </td>
                  <td className='col-xl-1 text-center'>
                      <span className="text-muted font-13">Ordered</span>
                      <h5 className="font-14 mt-1 fw-normal">{ordered_quantity}</h5>
                  </td>
                  
                  <td className='col-xl-1 text-center'>
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
                  <td className='col-xl-1 text-center'>
                      <span className="text-muted font-13">Used</span>
                      <h5 className="font-14 mt-1 fw-normal">{used_quantity}</h5>
                  </td>
                  <td className='col-xl-1 text-center'>
                      <span className="text-muted font-13">Dispatched</span>
                      <h5 className="font-14 mt-1 fw-normal">{dispatched_quantity}</h5>
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
              const {project_name,product_id, required_quantity,ordered_quantity, recieved_accepted, 
              recieved_rejected, used_quantity, dispatched_quantity, quantity_type} = product;
              return (
                <tr key={`${productType}_${Math.floor(Math.random() * 10)}_${product_id}_${project_name}`}>
                    <td className='col-xl-2 text-center'>
                        <span className="text-muted font-13">Project ID</span>
                        <h5 className="font-14 mt-1 fw-normal"><Link to={`/projects/${project_name}`} className="text-body">{project_name}</Link></h5>
                    </td>
                    <td className='col-xl-2 text-center'>
                        <span className="text-muted font-13">Product ID</span>
                        <h5 className="font-14 mt-1 fw-normal">{product_id}</h5>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Required</span>
                        <h5 className="font-14 mt-1 fw-normal">{`${required_quantity} ${quantity_type || ""}`}</h5>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Ordered</span>
                        <h5 className="font-14 mt-1 fw-normal">{ordered_quantity}</h5>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Recieved</span> <br/>
                        <span className={`font-14 mt-1 fw-normal badge badge-${recieved_accepted/ordered_quantity === 1? "success" : "warning"}-lighten`}>{recieved_accepted}</span>
                        {
                          
                          recieved_rejected !== "0" ? (
                            <Fragment>
                              <span className="font-14 mt-1 ">{`  `}</span>
                              <span className="font-14 mt-1 badge badge-danger-lighten">{recieved_rejected}</span>
                            </Fragment>
                          ):""
                        }
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Used</span>
                        <h5 className="font-14 mt-1 fw-normal">{used_quantity}</h5>
                    </td>
                    <td className='col-xl-1 text-center'>
                        <span className="text-muted font-13">Dispatched</span>
                        <h5 className="font-14 mt-1 fw-normal">{dispatched_quantity}</h5>
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

export const ToOrderProjectTableCard = ({projectID, projectDetails}) => {
  return (
    <div className="table-responsive">
      <table className="table table-centered table-nowrap table-hover mb-0">
          <tbody>
          {
            projectDetails.filter(({required_quantity, ordered_quantity}) => required_quantity - ordered_quantity > 0).map((project) => {
              const { product_id, required_quantity, ordered_quantity, product_type} = project;
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
                        <span className="text-muted font-13">Required Quantity</span>
                        <h5 className="font-14 mt-1 fw-normal">{required_quantity}</h5>
                    </td>
                    <td className='col-xl-2 text-center'>
                        <span className="text-muted font-13">Ordered Quantity</span><br></br>
                        <h5 className={`font-14 mt-1 badge badge-${ordered_quantity === 0? "danger" : "warning"}-lighten`}>{ordered_quantity}</h5>
                        
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