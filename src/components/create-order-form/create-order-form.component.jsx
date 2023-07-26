import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
// import 'bootstrap-datepicker/css/bootstrap-datepicker.min.css';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../contexts/user.context';
import { useNavigate } from 'react-router-dom';

export const CreateOrderForm = () => {
  const navigate = useNavigate();
  const {currentUser} = useContext(UserContext);
  const [project_id_map, set_project_id_map] = useState({});
  const empty_product = {
    "project_id" : "",
    "project_name" : "",
    "product_id" : "",
    "ordered_quantity": "",
    "expected_delivery": "",
    "product_type":"",
    "order_remark": "",
    "productOption": [],
    "required_quantity": "",
    "already_ordered": "",
    "product": "",
    "max_order_limit": 999999,
    "quantity_type": ""
  };
  const [validated, setValidated] = useState(false);
  const [productList, setProductList] = useState([empty_product]);
  const [poNumber, setPONumber] = useState("");
  // const [isInputValid, setIsInputValid] = useState(false);
  const [project_master_list, set_project_master_list] = useState([]);
  const poNumbers = useRef([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [productOptions, setProductOptions] = useState({});
  useEffect( () => {
    ( async () => {
      if (currentUser) {
        const project_prod_map = {};
        const idMap = {};
        const product_options = {};
        const pourlRequest = "http://127.0.0.1:80/spm/get_po_numbers";
        const poresponse =  await fetch(pourlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const poresponse_data = await poresponse.json();
        console.log("PO Numbers: ", poresponse_data);
        
        poNumbers.current = poresponse_data.map(element => element["po_number"]);

        const urlRequest = "http://127.0.0.1:80/spm/get_all_required_products";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();
        console.log("PML: ", response_data);
        
        response_data.forEach(({project_id, project_name, product_id, product_type, required_quantity, already_ordered, quantity_type}) => {
          if (project_name in project_prod_map)
            project_prod_map[project_name].push({project_id, product_id, product_type, required_quantity, already_ordered, quantity_type });
          else 
            project_prod_map[project_name] = [{project_id, product_id, product_type, required_quantity, already_ordered, quantity_type }];
          idMap[project_name] = project_id;
        });

        set_project_id_map(idMap);
        set_project_master_list(project_prod_map);

        const project_options = [];
        Object.keys(project_prod_map).forEach((project_name) => {
          project_options.push({value: project_name, label: project_name});
          const opts = project_prod_map[project_name].map(({product_id, product_type}) => {
            return {
              "label": `${product_type} - ${product_id}`,
              "value": `${product_type} - ${product_id}`
            }
          })
          product_options[project_name] = [{"label": "","value": ""}, ...opts]; 
        })
        setProductOptions(product_options);
        setProjectOptions(project_options);
        console.log("Product Options: ", product_options);
        console.log("Project Options: ", project_options);
      }
    })()
  }, [])
  
  const cleanPage = () => {
    setPONumber("")
    setProductList([empty_product])
  }

  const handlePOChange = (event) => {
    setPONumber(event.target.value)
  }

  const validatePONumber = (event) => {
    if (poNumbers.current.some((e) => e === event.target.value)) {
      alert("PO Number already exists");
      setPONumber("");
    }
  }

  const get_r_o_quantity = (project_name, pid, ptype) => {
    const products = project_master_list[project_name];
    for (let index in products) {
      const {product_type, product_id, required_quantity, already_ordered,  quantity_type} = products[index];
      if (product_type == ptype && product_id == pid) {
        return {
          "required_quantity": Number.parseInt(required_quantity),
          "already_ordered": Number.parseInt(already_ordered),
          "quantity_type": quantity_type
        };
      }
    }
    return {
      "required_quantity":0,
      "already_ordered": 0
    };
  }

  const handleFormChange = (event, index) => {
    let data = [...productList];
    data[index][event.target.name] = event.target.value;
    setProductList(data);
  }

  const submit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      const data = {
        "poNumber": poNumber,
        "productList": productList.filter(({product_type, product_id, project_name,ordered_quantity}) => 
        product_type && product_id && project_name && ordered_quantity),
        "created_by": currentUser.id
      }
      console.log("Sending Data: ", data);
      const urlRequest = "http://127.0.0.1:80/spm/create_order";
      const response = await fetch(urlRequest, {
          headers: new Headers({'content-type': 'application/json'}),
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data)
      })
      const response_data = await response.json;
      console.log("Response on submit" + response_data);
      navigate("/orders");
    } 
    
    setValidated(true);
    event.preventDefault();
  }
  
  const addProduct = () => {
    setProductList([...productList, empty_product]);
  }

  const removeProduct = (e, index) => {
    let data = [...productList];
    data.splice(index, 1);
    setProductList(data);
  }

  const onProjectChange = (e, index) => {
    let data = [...productList];
    data[index] = empty_product;
    if (e?.value){
      const project_name = e.value;
      data[index]["project_name"] = project_name;
      data[index]["project_id"] = project_id_map[project_name];
      data[index]["productOption"] = [...productOptions[project_name]];
    }
    setProductList(data);
  }

  const onProductChange = (e, index) => {
    let data = [...productList];
    data[index]["product"] = "";
    data[index]["product_type"] = "";
    data[index]["product_id"] = "";
    data[index]["required_quantity"] = "";
    data[index]["already_ordered"] = "";
    const project_name = data[index]["project_name"]
    if (e?.value){
      const product_type = data[index]["product_type"]= e.value.split(" - ")[0];
      const product_id = data[index]["product_id"]= e.value.split(" - ")[1];
      data[index]["product"] = e.value;
      const {required_quantity, already_ordered, quantity_type} = get_r_o_quantity(project_name, product_id, product_type);
      data[index]["required_quantity"] = Number.parseInt(required_quantity);
      data[index]["already_ordered"] = already_ordered;
      data[index]["quantity_type"] = quantity_type;
      data[index]["max_order_limit"] = required_quantity - already_ordered;
    }
    setProductList(data);
  }

  return (
    
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">

            <div className="row">
                <Form className="col-xl-12" validated={validated} noValidate onSubmit={submit}>
                    <div className="col-xl-6 mb-3 col-auto">
                        <label htmlFor="poNum" className="form-label">PO Number</label>
                        <Form.Control type="text" value={poNumber} id="poNum" className="form-control" placeholder="Enter PO Number" onChange={(e)=>handlePOChange(e)} onBlur={validatePONumber} required/>
                    </div>
                    {
                      poNumber? 
                      productList.map(({product, project_name, productOption, ordered_quantity, expected_delivery,quantity_type, order_remark, required_quantity, already_ordered, max_order_limit}, index ) => {
                        return (
                          <div className="row mb-3" style={index < productList.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="project_name" className="form-label">Project</label>
                                <Select name='project_name' options={projectOptions} value={{"label": project_name}} isSearchable={true} isClearable={true} onChange={(s)=>onProjectChange(s, index)} required></Select>
                                {/* <Form.Control name='project' type="text" placeholder="Project" value={project} onChange={(e) => handleFormChange(e, index)} required/> */}

                            </div>

                            <div className="col-xl-3 mb-3 col-auto">
                                <label htmlFor="product" className="form-label">Product</label>
                                <Select name='product' value={{"label": product}}
                                options={productOption} isSearchable={true} isClearable={true}
                                 onChange={(s)=>onProductChange(s, index)} required></Select>
                            </div>

                            <div className="col-xl-2 mb-3 col-auto">
                              <label htmlFor="required_quantity" className="form-label">O/R</label>
                              <Form.Control name='required_quantity' type="text" placeholder="Quantity" 
                              value={`${already_ordered || "-"}/${required_quantity || "-"} ${quantity_type || ""}`} readOnly/>
                            </div>
                            
                            <div className="col-xl-1 mb-3 col-auto">
                              <label htmlFor="ordered_quantity" className="form-label">Order</label>
                              <Form.Control name='ordered_quantity' type="number" placeholder="Quantity" 
                              value={ordered_quantity} isInvalid={ordered_quantity>max_order_limit || ordered_quantity === 0} 
                              min="0" max={max_order_limit} onChange={(e) => handleFormChange(e, index)} required/>
                              <Form.Control.Feedback type="invalid">
                                  Please select a value between 0-{max_order_limit}
                              </Form.Control.Feedback>

                            </div>
      
                            <div className="col-xl-2 mb-3 col-auto">
                                <label className="form-label">Delivery Date</label>
                                <Form.Control name='expected_delivery' type="date" placeholder="ETA" value={expected_delivery} onChange={(e) => handleFormChange(e, index)} required/>
                                <Form.Control.Feedback type="invalid">
                                    Please select a value
                                </Form.Control.Feedback>
                            </div>

                            {
                              productList.length > 1 ? (
                                <div className="col-xl-1 mb-3 col-auto">
                                  <label className="form-label d-block invisible">Remove</label>
                                  <button className="btn btn-outline-danger" type='button' onClick={(e) => removeProduct(e, index)}>Remove</button>
                                </div>
                              ): ""
                            }
                            <div className="col-xl-1 mb-3 col-auto">
                              <label className="form-label d-block invisible">Add</label>
                              {
                                index === productList.length-1 ?  (<button className="btn btn-outline-success" type = 'button' onClick={addProduct}>Add</button>): 
                                ("")
                              }
                            </div>
                            <div className="col-xl-4 mb-3 col-auto">
                              <label htmlFor="remark" className="form-label">Remark</label>
                              <Form.Control name='remark' type="text" placeholder="Add Remark" value={order_remark} onChange={(e) => handleFormChange(e, index)}/>
                            </div>

                          </div>
                        )
                      }) : ""
                    }
                    
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