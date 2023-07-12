import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user.context';
import { useContext } from 'react';

function removeDup(arr) {
  let result = []
  arr.forEach((item, index) => { if (arr.indexOf(item) == index) result.push(item) });
  return result;
}

export const Order = () => {
  const {currentUser} = useContext(UserContext);
  const project_dict = {};
  const [orderDetails, setorderDetails] = useState([]);
  const [isInputValid, setIsInputValid] = useState(true);
  const project_master_list = useRef([])
  const [projectOptions, setProjectOptions] = useState([]);
  const [editOrder, setEditOrder ] = useState(false);
  const [originalList, setOriginalList] = useState([]);
  const [orderID, setOrderId] = useState([]);
  const poNumber = useParams().order.split("--").join('/');
  const empty_product = {
    orderID: orderID,
    "order_comp_id": "",
    "project_id": "",
    "project_name" : "",
    "product_id" : "",
    "ordered_quantity": "",
    "expected_delivery": "",
    "product_type":"",
    "order_remark": "",
    "validProduct": true,
    "validProductCode": true,
    "isUpdated": true
  };

  useEffect( () => {
    ( async () => {
      const urlRequest = "http://192.168.1.4:80/spm/get_project_agg";
      const response =  await fetch(urlRequest, {
        method: 'get', mode: 'cors', contentType: 'application/json',
      });
      const response_data = await response.json();
      console.log(response_data);
      
      response_data.forEach(({project_id, project_name, product_ids, product_types}) => {
        const project = {};
        project["project_id"] = project_id;
        project["product_ids"] = removeDup(JSON.parse(product_ids));
        project["product_types"] = removeDup(JSON.parse(product_types));
        project["project_name"] = project_name;

        project_dict[project_name] = project;
      });
      project_master_list.current = project_dict;
      
      console.log(project_dict)
      const project_options = [];
      Object.keys(project_master_list.current).forEach((project_name) => {
        project_options.push({value: project_name, label: project_name})
      })

      setProjectOptions(project_options);
      console.log("project option: ", project_options);

      const ourlRequest = "http://192.168.1.4:80/spm/get_order_details?" + new URLSearchParams({
        "po_number": poNumber
      });
      const oresponse =  await fetch(ourlRequest, {
        method: 'get', mode: 'cors', contentType: 'application/json',
      })

      const oresponse_data = await oresponse.json();
      console.log("purchase_order: ",oresponse_data)
      setOrderId(oresponse_data.order_id)
      const orderDet = oresponse_data.order_items;
      console.log(orderDet);

      orderDet.forEach((order) => {
        order["isUpdated"] = false;
        order["validProduct"] = true;
        order["validProductCode"] = true;
      })
      setorderDetails([...orderDet]);
      setOriginalList(JSON.parse(JSON.stringify(orderDet)));
    }
    )()
  }, [])

  const handleFormChange = (event, index) => {
    let data = [...orderDetails];
    data[index][event.target.name] = event.target.value;
    data[index]["isUpdated"] = true;
    const project_name = data[index]["project_name"] || "";
    const prod = project_master_list.current[project_name]
    if (event.target.name === "product_type")
      data[index]["validProduct"] = project_name && (prod && prod.product_types.some((product) => product === event.target.value));
    if (event.target.name === "product_id")
      data[index]["validProductCode"] = project_name && (prod && prod.product_ids.some((product) => product === event.target.value));
    setorderDetails(data);
    checkValidation();
  }

  const onEditClick = () => {
    setEditOrder(!editOrder);
    console.log("Original List: ",originalList);
    setorderDetails(JSON.parse(JSON.stringify(originalList)));
  }

  const submit = async (e) => {
    const data = {
      "order_id": orderID,
      "po_number": poNumber, 
      "orderDetails": orderDetails.filter((item) => item.isUpdated === true),
      "updated_on": Date.now(),
      "updated_by": currentUser.id
    }
    console.log(data);
    const urlRequest = "http://192.168.1.4:80/spm/update_order";
    const response =  await fetch(urlRequest, {
        headers: new Headers({'content-type': 'application/json'}),
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data)
    })
    const response_data = await response.json;
    console.log("Response on submit" + response_data);
    orderDetails.forEach((item)=> item.isUpdated = false);
    setOriginalList(JSON.parse(JSON.stringify(orderDetails)));
    setEditOrder(false);
  }

  const checkValidation = () => {
    if ((poNumber) && (orderDetails)) {
      const isNotValid = orderDetails.some(({product_id, project_name, ordered_quantity, expected_delivery, product_type}) => {
        return !product_id || !project_name || !product_type || !ordered_quantity || !expected_delivery;
      })
      setIsInputValid(!isNotValid)
    }
    else {
      setIsInputValid(false);
    }
  }
  const addProduct = () => {
    setorderDetails([...orderDetails, empty_product])
    setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...orderDetails];
    data.splice(index, 1)
    await setorderDetails(data)
    checkValidation();
  }

  const onProjectChange = (e, index) => {
    let data = [...orderDetails];
    if (! e){
      data[index]["project_name"] = "";
    }
    else{
      data[index]["project_name"] = e.value;
      data[index]["project_id"] = project_master_list.current[e.value]['project_id'];
    }
    setorderDetails(data);
    checkValidation()
  }

  return (
    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-4">
              <div className="page-title-box">
                <h3 className="page-title">Order - {poNumber}</h3>
              </div>
            </div>
          </div>
          {
            editOrder? "":
            (<div className="row mb-2">
              <div className="col-sm-4">
                  <button className="btn btn-danger rounded-pill mb-3" onClick={(e) => onEditClick(e)}><i className="mdi mdi-plus"></i> Edit Order Items</button>
              </div>
            </div>)
          }
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className="card-body">

                  <div className="row">
                      <Form className="col-xl-12 needs-validation" onSubmit={submit}>
                          {
                            poNumber? 
                            orderDetails.map(({product_id, project_name, ordered_quantity, expected_delivery, product_type, order_remark, validProduct, validProductCode,  order_comp_id}, index ) => {
                              return (
                                <div className="row mb-3" style={index < orderDetails.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                                  <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="project_name" className="form-label">Project</label>
                                      <Select name='project_name' value = {
                                                                    projectOptions.filter(option => 
                                                                        option.label === project_name)
                                                                  } options={projectOptions} isSearchable={true} isClearable={true} onChange={(s)=>onProjectChange(s, index)} isDisabled={!editOrder  || order_comp_id}></Select>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="product_type" className="form-label">Product Type</label>
                                      <Form.Control className={ !editOrder || validProduct ? '' : "border border-danger"} name='product_type' type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder || order_comp_id}/>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="product_id" className="form-label">Product Code</label>
                                      <Form.Control className={ !editOrder || validProductCode ? '' : "border border-danger"} name='product_id' type="text" placeholder="Code" value={product_id} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder || order_comp_id}/>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                    <label htmlFor="quantitiy" className="form-label">Ordered Quantity</label>
                                    <Form.Control name='ordered_quantity' type="text" placeholder="Quantity" value={ordered_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder}/>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                    <label className="form-label">Delivery Date</label>
                                    <Form.Control name='expected_delivery' type="date" placeholder="Expected By" value={expected_delivery} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder}/>
                                  </div>
                                  {
                                    editOrder && orderDetails.length > 1 && !order_comp_id ? (
                                      <div className="col-xl-1 mb-3 col-auto">
                                        <label className="form-label d-block invisible">Remove</label>
                                        <button className="btn btn-outline-danger" type='button' onClick={(e) => removeProduct(e, index)}>Remove</button>
                                      </div>
                                    ): ""
                                  }
                                  {
                                    editOrder? (
                                      <div className="col-xl-1 mb-3 col-auto">
                                        <label className="form-label d-block invisible">Add</label>
                                        {
                                          index === orderDetails.length-1 ?  (<button className="btn btn-outline-success" type = 'button' onClick={addProduct}>Add</button>): 
                                          ("")
                                        }
                                      </div>
                                    ):""
                                  }
                                  {/* <div className="col-xl-4 mb-3 col-auto">
                                    <label htmlFor="order_remark" className="form-label">Remark</label>
                                    <Form.Control name='order_remark' type="text" placeholder="Add Remark" value={order_remark} onChange={(e) => handleFormChange(e, index)}/>
                                  </div> */}

                                </div>
                              )
                            }) : ""
                          }
                          
                          {
                            editOrder? (
                              <div className="row">
                                <div className="mb-1 mt-3 col-auto"><button className="btn btn-light px-5" type='button' onClick={onEditClick}>Cancel</button></div>
                                <div className="mb-1 mt-3 col-auto"><button className={`btn px-5 px-sm-15 ${isInputValid? "btn-primary":"btn-outline-primary disabled"}`} type="button" data-bs-toggle="modal" data-bs-target="#standard-modal">Submit</button></div>
                              </div>
                            ): ""
                          }

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
          </div>   
      </div>
    </div>
  )
}