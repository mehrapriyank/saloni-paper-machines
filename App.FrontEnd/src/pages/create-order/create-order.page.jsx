import { CreateOrderForm } from "../../components/create-order-form/create-order-form.component";

export const CreateOrderPage = () => {
  return (
    <div className="content-page">
        <div className="content">
            <div className="container-fluid">
              <div className="row">
                  <div className="col-12">
                      <div className="page-title-box">
                          <h4 className="page-title">Create Order</h4>
                      </div>
                  </div>
              </div>
              <div  className="row">
                <CreateOrderForm></CreateOrderForm>
              </div>
            </div>
        </div>
    </div>
    
  )
}