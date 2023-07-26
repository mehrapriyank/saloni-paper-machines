
import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/user.context';
import { useNavigate } from 'react-router-dom';
let options = [];
const statusOptions = [
    { "value": "Accepted", "label": "Accepted" },
    { "value": "Rejected", "label": "Rejected" }
  ]
export const UpdateOrderForm = () => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [productList, setProductList] = useState([]);
  const [poNumber, setPONumber] = useState("");
  const [poList, setPOOptions] = useState([]);
  const [bill, setBill] = useState("");
  const {currentUser} = useContext(UserContext);
  useEffect( ()=> {
      ( async () => {
        if (currentUser) {
          const urlRequest = "http://127.0.0.1:80/spm/get_purchase_orders";
          const response =  await fetch(urlRequest, {
            method: 'get', mode: 'cors', contentType: 'application/json',
          });
          const response_data = await response.json();
          console.log("Purchase order list: "+response_data)
          
          options = [];
          response_data.forEach(({po_number}) => {
            options.push({value: po_number, label: po_number})
          })

          setPOOptions(options);
        }
        
      }
      )()
  }, []);
  

  const onPOChange = async (selected) => {
    if (selected){
      setPONumber(selected.value);
      const urlRequest = "http://127.0.0.1:80/spm/get_order_details?" + new URLSearchParams({
        "po_number": selected.value
      });
      const response =  await fetch(urlRequest, {
        method: 'get', mode: 'cors', contentType: 'application/json',
      })

      const response_data = await response.json()

      const order_items = response_data.order_items;  
      order_items.forEach((item) => {
        item["recieved_quantity"] = "";
        item["status"] = "";
        item["delivery_remark"] = "";
        item["recieved_date"] = "";
      })

      console.log(order_items)
      setProductList(order_items);
    } else {
      setPONumber("");
      setProductList([]);
    } 
  }
  
  const cleanPage = () => {
    setPONumber(null);
    setProductList([]);
  }

  const handleFormChange = (event, index) => {
    if (event.target.name === "bill"){
      setBill(event.target.value);
    }
    else {
      let data = [...productList];
      data[index][event.target.name] = event.target.value;
      setProductList(data);
    }
  }

  const handleStatusChange = (event, index) => {
    console.log(event)
    let data = [...productList];
    if (event) {
     data[index]["status"] = event.value;
    } else {
      data[index]["status"] = "";
    }
    setProductList(data);
  }

  const submit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || !productList.some(({recieved_quantity, recieved_date, status}) => recieved_quantity && recieved_date && status)) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      const prod_list = productList.map((product) => {
        let updated = false;
        const {order_comp_id, recieved_quantity, recieved_date, status, delivery_remark} = product;
        if (recieved_quantity && recieved_date && status && bill){
          updated =  true;
        }
        return {order_comp_id,recieved_quantity,recieved_date, updated, status,delivery_remark};
      }).filter((product) => product.updated === true);
      const data = {
        "po_id": poNumber,
        "productList": prod_list,
        "bill": bill
      }
      console.log(data);
      const urlRequest = "http://127.0.0.1:80/spm/recieve_order";
      const response =  await fetch(urlRequest, {
          headers: new Headers({'content-type': 'application/json'}),
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data)
      })
      const response_data = await response.json
      console.log("Response on submit" + response_data)
      cleanPage();
    }
    setValidated(true);
    event.preventDefault();
  }

  return (
    
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">

            <div className="row">
                <Form className="col-xl-12" validated={validated} noValidate onSubmit={submit}>
                  <div className='row'>
                    <div className="col-xl-5 mb-4 col-auto">
                          <label htmlFor="poNum" className="form-label">PO Number</label>
                          <Select name='PO' value={{"label": poNumber}} options={poList} isSearchable={true} isClearable={true} onChange={(s)=>onPOChange(s)} required></Select>
                    </div>
                  </div>
                  <div className='row'>
                    {
                      poNumber? (
                        <div className="col-xl-4 mb-4 col-auto">
                            <label htmlFor="bill" className="form-label">Challan/Bill</label>
                            <Form.Control name='bill' type="text" placeholder="Challan/Bill" value={bill} onChange={(e) => handleFormChange(e)} required/>
                        </div>
                      ): ""
                    }
                  </div>
                  
                  <div>
                    {
                      productList? (productList.map((
                        {product_type, product_id, project_name,  order_remark,expected_delivery, ordered_quantity,status, recieved_quantity,recieved_date, delivery_remark, already_recieved },
                         index ) => {
                        return (
                          <div className="row mb-3" style={index < productList.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                            <div className="col-xl-1 mb-1 col-auto text-center">
                                <label htmlFor="project_name" className="form-label">Project</label>
                                <p>{project_name}</p>
                            </div>
                            <div className="col-xl-2 mb-1 col-auto text-center">
                                <label htmlFor="producttype" className="form-label">Product Type</label>
                                <p>{product_type}</p>
                            </div>
                            <div className="col-xl-2 mb-1 col-auto text-center">
                                <label htmlFor="product" className="form-label">Product Code</label>
                                <p>{product_id}</p>
                            </div>
                            <div className="col-xl-1 mb-1 col-auto text-center">
                              <label htmlFor="quantitiy" className="form-label">#Ordered</label>
                              <p>{ordered_quantity}</p>
                            </div>
                            <div className="col-xl-2 mb-1 col-auto text-center">
                              <label className="form-label">Delivery Date</label>
                              <p>{expected_delivery}</p>
                            </div>
                            
                            <div className="col-xl-4 mb-1 col-auto text-center">
                              <label htmlFor="oremark" className="form-label">Order Remarks</label>
                              <p>{order_remark? order_remark: "No remarks"}</p>
                            </div>
                            
                            <div className="col-xl-2 mb-1 col-auto text-center">
                              <label htmlFor="recieved_quantity" className="form-label">#Recieved</label>
                              <Form.Control name='recieved_quantity' type="number" id="recieved_quantity" 
                                  className="form-control" placeholder="Quantity" value={recieved_quantity} 
                                  isInvalid={recieved_quantity && recieved_quantity> Number.parseInt(ordered_quantity)-Number.parseInt(already_recieved)} 
                                  required={(recieved_date || status) && !recieved_quantity}
                                  onChange={(e) => handleFormChange(e, index)}/>
                              <Form.Control.Feedback type="invalid">
                                  Please select a value between 0-{Number.parseInt(ordered_quantity)-Number.parseInt(already_recieved)}
                              </Form.Control.Feedback>
                            </div>
                            <div className="col-xl-2 mb-1 col-auto text-center">
                                <label className="form-label">Recieved Date</label>
                                <Form.Control name='recieved_date' type="date" placeholder="Date" value={recieved_date} 
                                  onChange={(e) => handleFormChange(e, index)} 
                                  required={recieved_quantity || status }/>
                            </div>
                            <div className="col-xl-2 mb-1 col-auto text-center">
                                <label htmlFor="status" className="form-label">Status</label>
                                <Select name='status' value={{"label": status}} options={statusOptions} isSearchable={true} isClearable={true} 
                                required= {recieved_quantity } onChange={(s)=>handleStatusChange(s, index)}></Select>
                            </div>
                            <div className="col-xl-6 mb-3 col-auto text-center">
                              <label htmlFor="delivery_remark" className="form-label">Delivery Remarks</label>
                              <Form.Control name='delivery_remark' type="text" placeholder="Add Remark" value={delivery_remark} onChange={(s)=>handleFormChange(s, index)}/>
                            </div>
                          </div>
                        )
                      })) : ""
                    }
                  </div>
                  <div className="row">
                      <div className="mb-1 mt-3 col-auto"><button className="btn btn-light px-5" type='button' onClick={cleanPage}>Cancel</button></div>
                      <div className="mb-1 mt-3 col-auto"><button className={`btn px-5 px-sm-15 btn-primary`} type="button" data-bs-toggle="modal" data-bs-target="#standard-modal">Submit</button></div>
                  </div>

                  <div id="standard-modal" className="modal fade" tabIndex="-1" role="dialog" aria-labelledby="standard-modalLabel" aria-hidden="true">
                      <div className="modal-dialog">
                          <div className="modal-content">
                              <div className="modal-header">
                                  <h4 className="modal-title" id="standard-modalLabel">Modal Heading</h4>
                                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                              </div>
                              <div className="modal-body">
                                  Do you want to save the order details?
                              </div>
                              <div className="modal-footer">
                                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Keep Editing</button>
                                  <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                              </div>
                          </div>
                      </div>
                  </div>
                </Form> 
            </div> 
          </div> 
        </div>              
      </div> 
    </div>
  )
}