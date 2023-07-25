import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user.context';
import { useContext } from 'react';

export const Order = () => {
  const {currentUser} = useContext(UserContext);
  const project_prod_map = {};
  const [project_id_map, set_project_id_map] = useState({});
  const [orderDetails, setorderDetails] = useState([]);
  const [isInputValid, setIsInputValid] = useState(true);
  const [project_master_list, set_project_master_list] = useState([]);
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
    "isUpdated": true,
    "productOption": [{"label": "","value": ""}],
    "required_quantity": "",
    "total_ordered": "",
    "product": "",
    "ordered_without_this": "",
    "order_max_limit": ""
  };

  useEffect( () => {
    ( async () => {
      if (currentUser) {
        const idMap = {};
        const urlRequest = "http://127.0.0.1:80/spm/get_all_required_products";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();
        console.log(response_data);
        
        response_data.forEach(({project_id, project_name, product_id, product_type, required_quantity, already_ordered}) => {
          if (project_name in project_prod_map)
            project_prod_map[project_name].push({project_id, product_id, product_type, required_quantity, already_ordered });
          else 
            project_prod_map[project_name] = [{project_id, product_id, product_type, required_quantity, already_ordered }];
          idMap[project_name] = project_id;
        });

        set_project_id_map(idMap);
        set_project_master_list(project_prod_map);
        
        console.log(project_prod_map);
        const project_options = [];
        Object.keys(project_prod_map).forEach((project_name) => {
          project_options.push({value: project_name, label: project_name})
        })
        setProjectOptions(project_options);
        console.log("project option: ", project_options);

        const ourlRequest = "http://127.0.0.1:80/spm/get_order_details?" + new URLSearchParams({
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
          order["product"] = `${order.product_type} - ${order.product_id}`;
          order["ordered_without_this"] = order.total_ordered - order.ordered_quantity;
          order["order_max_limit"] = order.required_quantity-order["ordered_without_this"];
        })
        setorderDetails([...orderDet]);
        setOriginalList(JSON.parse(JSON.stringify(orderDet)));
      }
    }
    )()
  }, [editOrder])

  const get_required_and_already_ordered_quantity = (project_name, pid, ptype) => {
    const products = project_master_list[project_name];
    for (let index in products) {
      const {product_type, product_id, required_quantity, already_ordered} = products[index];
      if (product_type == ptype && product_id == pid) {
        return {
          "required_quantity": Number.parseInt(required_quantity),
          "total_ordered": Number.parseInt(already_ordered)
        };
      }
    }
    return {
      "required_quantity":0,
      "total_ordered": 0
    };
  }

  const handleFormChange = (event, index) => {
    let data = [...orderDetails];
    data[index][event.target.name] = event.target.value;
    // if (event.target.name === "ordered_quantity"){
    //   const required_quantity = data[index]["required_quantity"];
    //   const total_ordered = data[index]["total_ordered"];
    //   // if (data[index]["order_comp_id"]) {
    //   //   // order getting updated
    //   //   if ( !required_quantity || required_quantity-data[index]["ordered_without_this"]< event.target.value) {
    //   //     alert(`Required: ${required_quantity}\nAlready Ordered: ${total_ordered}\nNew ordered can not be more than ${required_quantity-data[index]["ordered_without_this"]}`);
    //   //     data[index][event.target.name] = required_quantity-data[index]["ordered_without_this"];
    //   //   }
    //   // }
    //   // else if ( !required_quantity || (required_quantity-total_ordered < event.target.value) ){
    //   //   alert(`Required: ${required_quantity}\nAlready Ordered: ${total_ordered}\n
    //   //     New ordered can not be more than ${required_quantity-total_ordered}`);
    //   //   data[index][event.target.name] = required_quantity-total_ordered;
    //   // }
    // }
    data[index]["isUpdated"] = true;
    setorderDetails(data);
    // checkValidation();
  }

  const onEditClick = () => {
    setEditOrder(!editOrder);
    console.log("Original List: ",originalList);
    setorderDetails(JSON.parse(JSON.stringify(originalList)));
  }

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      "order_id": orderID,
      "po_number": poNumber, 
      "orderDetails": orderDetails.filter((item) => item.isUpdated === true),
      "updated_on": Date.now(),
      "updated_by": currentUser.id
    }
    console.log(data);
    const urlRequest = "http://127.0.0.1:80/spm/update_order";
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
  const addProduct = () => {
    setorderDetails([...orderDetails, empty_product])
    setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...orderDetails];
    data.splice(index, 1)
    await setorderDetails(data)
    // checkValidation();
  }

  const onProjectChange = (e, index) => {
    let data = [...orderDetails];
    data[index] = empty_product;
    if (e?.value){
      const project_name = e.value;
      data[index]["project_name"] = project_name;
      data[index]["project_id"] = project_id_map[project_name];
      data[index]["productOption"] = project_master_list[project_name].map((e) => {
        return {"label": `${e.product_type} - ${e.product_id}`, "value": `${e.product_type} - ${e.product_id}`};
      })

      // data[index]["productOption"] = productOptions[project_name];
    }
    console.log(data[index]);
    setorderDetails(data);
    // checkValidation()
  }

  const onProductChange = (e, index) => {
    let data = [...orderDetails];
      data[index]["required_quantity"] = "";
      data[index]["total_ordered"] = "";
    if (e?.value){
      console.log(index, e.value);
      data[index]["product_type"]= e.value.split(" - ")[0];
      data[index]["product_id"]= e.value.split(" - ")[1];
      data[index]["product"] = e.value;

      const {required_quantity, total_ordered} = get_required_and_already_ordered_quantity(data[index]["project_name"],data[index]["product_id"],data[index]["product_type"]);
      data[index]["required_quantity"] = Number.parseInt(required_quantity);
      data[index]["total_ordered"] = total_ordered;
      data[index]["order_max_limit"] = required_quantity - total_ordered;
      console.log(required_quantity, total_ordered);
    }

    setorderDetails(data);
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
                            orderDetails.map(({productOption, product, project_name, ordered_quantity, expected_delivery, order_remark,  order_comp_id, order_max_limit}, index ) => {
                              return (
                                <div className="row mb-3" style={index < orderDetails.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                                  <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="project_name" className="form-label">Project</label>
                                      <Select name='project_name' options={projectOptions} value={{"label": project_name}}
                                       isSearchable={true} isClearable={true} 
                                       onChange={(s)=>onProjectChange(s, index)} isDisabled={!(editOrder && !order_comp_id)} required>
                                      </Select>
                                  </div>

                                  <div className="col-xl-3 mb-3 col-auto">
                                      <label htmlFor="product" className="form-label">Product</label>
                                      <Select name='product' value={{"label": product}}
                                      options={productOption} isSearchable={true} isClearable={true}
                                      onChange={(s)=>onProductChange(s, index)} isDisabled={!(editOrder && !order_comp_id)} required></Select>
                                      
                                      {/* <Form.Select value={product} onChange={(e) => onProductChange(e, index)}>
                                        <option value=""></option>
                                        {productOption.map((opt) => <option value={opt.label}> {opt.value} </option>)}
                                      </Form.Select> */}
                                      {/* <Form.Control name='product' type="text" placeholder="Project" value={project} onChange={(e) => handleFormChange(e, index)} required/> */}

                                  </div>
                                  {/* <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="product_type" className="form-label">Product Type</label>
                                      <Form.Control className={ !editOrder || validProduct ? '' : "border border-danger"} name='product_type' type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder || order_comp_id}/>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                      <label htmlFor="product_id" className="form-label">Product Code</label>
                                      <Form.Control className={ !editOrder || validProductCode ? '' : "border border-danger"} name='product_id' type="text" placeholder="Code" value={product_id} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder || order_comp_id}/>
                                  </div> */}
                                  <div className="col-xl-2 mb-3 col-auto">
                                    <label htmlFor="ordered_quantity" className="form-label">Ordered Quantity</label>
                                    <Form.Control name='ordered_quantity' className={ !editOrder? '' : "border border-primary"} type="number" min="0" max={order_max_limit} placeholder="Quantity" value={ordered_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder} required/>
                                  </div>
                                  <div className="col-xl-2 mb-3 col-auto">
                                    <label htmlFor="expected_delivery" className="form-label">Delivery Date</label>
                                    <Form.Control name='expected_delivery' className={ !editOrder? '' : "border border-primary"} type="date" placeholder="Expected By" value={expected_delivery} onChange={(e) => handleFormChange(e, index)} readOnly={!editOrder} required/>
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
                                  <div className="col-xl-4 mb-3 col-auto">
                                    <label htmlFor="order_remark" className="form-label">Remark</label>
                                    <Form.Control name='order_remark' type="text" placeholder="Add Remark" value={order_remark} onChange={(e) => handleFormChange(e, index)}/>
                                  </div>

                                </div>
                              )
                            }) : ""
                          }
                          
                          {
                            editOrder? (
                              <div className="row">
                                <div className="mb-1 mt-3 col-auto"><button className="btn btn-light px-5" type='button' onClick={onEditClick}>Cancel</button></div>
                                <div className="mb-1 mt-3 col-auto"><button className={`btn px-5 px-sm-15 btn-primary`} type="button" data-bs-toggle="modal" data-bs-target="#standard-modal">Submit</button></div>
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