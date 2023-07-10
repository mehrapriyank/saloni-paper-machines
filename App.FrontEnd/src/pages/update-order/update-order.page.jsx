import { UpdateOrderForm } from "../../components/update-order-form/update-order-form.component"
export const UpdateOrderPage = () => {
  return (
    <div className="content-page">
        <div className="content">
            <div className="container-fluid">
              <div className="row">
                  <div className="col-12">
                      <div className="page-title-box">
                          <h4 className="page-title">Update Order Details</h4>
                      </div>
                  </div>
              </div>
              <div  className="row">
                <UpdateOrderForm></UpdateOrderForm>
              </div>
            </div>
        </div>
    </div>
    
  )
}