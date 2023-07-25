import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
// import 'bootstrap-datepicker/css/bootstrap-datepicker.min.css';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../contexts/user.context';

export const CreateOrderForm = () => {
  
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
    "productOption": [{"label": "","value": ""}],
    "required_quantity": "",
    "already_ordered": "",
    "product": "",
    "max_order_limit": 999999
  };

  const [productList, setProductList] = useState([empty_product]);
  const [poNumber, setPONumber] = useState("");
  // const [isInputValid, setIsInputValid] = useState(false);
  const [project_master_list, set_project_master_list] = useState([]);
  const poNumbers = useRef([]);
  const [projectOptions, setProjectOptions] = useState([]);
  useEffect( () => {
    ( async () => {
      if (currentUser) {
        const project_prod_map = {};
        const idMap = {};
        const pourlRequest = "http://127.0.0.1:80/spm/get_po_numbers";
        const poresponse =  await fetch(pourlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const poresponse_data = await poresponse.json();
        console.log(poresponse_data);
        
        poNumbers.current = poresponse_data.map(element => element["po_number"]);

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

  const get_required_and_already_ordered_quantity = (project_name, pid, ptype) => {
    const products = project_master_list[project_name];
    for (let index in products) {
      const {product_type, product_id, required_quantity, already_ordered} = products[index];
      if (product_type == ptype && product_id == pid) {
        return {
          "required_quantity": Number.parseInt(required_quantity),
          "already_ordered": Number.parseInt(already_ordered)
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
    const project_name = data[index]["project_name"] || "";
    // const prod = project_master_list[project_name]
    // if (event.target.name === "product_type")
    //   data[index]["validProduct"] = project_name && (prod && prod.some(({product_type}) => product_type.toUpperCase() === event.target.value.toUpperCase()));
    // if (event.target.name === "product_id")
    //   data[index]["validProductCode"] = project_name && (prod && prod.some(({product_id}) => product_id.toUpperCase() === event.target.value.toUpperCase()));
    // if (event.target.name === "ordered_quantity"){
    //   const required_quantity = data[index]["required_quantity"];
    //   const already_ordered = data[index]["already_ordered"];
    //   if ( !required_quantity || (required_quantity-already_ordered < event.target.value) ){
    //     alert(`Required: ${required_quantity}\nAlready Ordered: ${already_ordered}\n
    //       New ordered can not be more than ${required_quantity-already_ordered}`);
    //     data[index][event.target.name] = required_quantity-already_ordered;
    //   }
    // }
    setProductList(data);
    // checkValidation()
  }

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      "poNumber": poNumber,
      "productList": productList,
      "created_by": currentUser.id
    }
    console.log(data);
    const urlRequest = "http://127.0.0.1:80/spm/create_order";
    const response =  await fetch(urlRequest, {
        headers: new Headers({'content-type': 'application/json'}),
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data)
    })
    const response_data = await response.json;
    console.log("Response on submit" + response_data);
    cleanPage();
  }

  
  const addProduct = () => {
    setProductList([...productList, empty_product])
    // setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...productList];
    data.splice(index, 1);
    console.log("on removing", data);
    await setProductList(data)
    // checkValidation();
  }

  const onProjectChange = (e, index) => {
    let data = [...productList];
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
    setProductList(data);
    // checkValidation()
  }

  const onProductChange = (e, index) => {
    let data = [...productList];
      data[index]["required_quantity"] = "";
      data[index]["already_ordered"] = "";
    if (e?.value){
      console.log(index, e.value);
      data[index]["product_type"]= e.value.split(" - ")[0];
      data[index]["product_id"]= e.value.split(" - ")[1];
      data[index]["product"] = e.value;
      const {required_quantity, already_ordered} = get_required_and_already_ordered_quantity(data[index]["project_name"],data[index]["product_id"],data[index]["product_type"]);
      data[index]["required_quantity"] = Number.parseInt(required_quantity);
      data[index]["already_ordered"] = already_ordered;
      data[index]["max_order_limit"] = required_quantity - already_ordered;
      console.log(required_quantity, already_ordered);
    }

    setProductList(data);
  }

  return (
    
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">

            <div className="row">
                <Form className="col-xl-12 needs-validation" onSubmit={submit}>

                    <div className="col-xl-6 mb-3 col-auto">
                        <label htmlFor="poNum" className="form-label">PO Number</label>
                        <Form.Control type="text" value={poNumber} id="poNum" className="form-control" placeholder="Enter PO Number" onChange={(e)=>handlePOChange(e)} onBlur={validatePONumber} required/>
                    </div>
                    {
                      poNumber? 
                      productList.map(({product, project_name, productOption, ordered_quantity, expected_delivery, order_remark, required_quantity, already_ordered, max_order_limit}, index ) => {
                        return (
                          <div className="row mb-3" style={index < productList.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="project_name" className="form-label">Project</label>
                                {/* <Form.Select value={project_name} onChange={(e) => onProjectChange(e, index)}>
                                  <option value=""></option>
                                  {projectOptions.map((opt) => <option value={opt.label}> {opt.value} </option>)}
                                </Form.Select> */}
                                <Select name='project_name' options={projectOptions} value={{"label": project_name}} isSearchable={true} isClearable={true} onChange={(s)=>onProjectChange(s, index)} required></Select>
                                {/* <Form.Control name='project' type="text" placeholder="Project" value={project} onChange={(e) => handleFormChange(e, index)} required/> */}

                            </div>

                            <div className="col-xl-3 mb-3 col-auto">
                                <label htmlFor="product" className="form-label">Product</label>
                                <Select name='product' value={{"label": product}}
                                options={productOption} isSearchable={true} isClearable={true}
                                 onChange={(s)=>onProductChange(s, index)} required></Select>
                                 
                                {/* <Form.Select value={product} onChange={(e) => onProductChange(e, index)}>
                                  <option value=""></option>
                                  {productOption.map((opt) => <option value={opt.label}> {opt.value} </option>)}
                                </Form.Select> */}
                                {/* <Form.Control name='product' type="text" placeholder="Project" value={project} onChange={(e) => handleFormChange(e, index)} required/> */}

                            </div>

                            <div className="col-xl-1 mb-3 col-auto">
                              <label htmlFor="required_quantity" className="form-label">O/R</label>
                              <Form.Control name='required_quantity' type="number" placeholder="Quantity" value={`${already_ordered}/${required_quantity}`} readOnly/>
                            </div>
                            
                            <div className="col-xl-2 mb-3 col-auto">
                              <label htmlFor="ordered_quantity" className="form-label">Order Quantity</label>
                              <Form.Control name='ordered_quantity' type="number" placeholder="Quantity" value={ordered_quantity} min="0" max={max_order_limit} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
      
                            <div className="col-xl-2 mb-3 col-auto">
                                <label className="form-label">Delivery Date</label>
                                <Form.Control name='expected_delivery' type="date" placeholder="ETA" value={expected_delivery} onChange={(e) => handleFormChange(e, index)} required/>
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