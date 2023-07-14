import Select from 'react-select'
import { Form } from 'react-bootstrap';
import 'react-bootstrap/'
import "react-datepicker/dist/react-datepicker.css";
// import 'bootstrap-datepicker/css/bootstrap-datepicker.min.css';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../contexts/user.context';

function removeDup(arr) {
  let result = []
  arr.forEach((item, index) => { if (arr.indexOf(item) == index) result.push(item) });
  return result;
}
export const CreateOrderForm = () => {
  const {currentUser} = useContext(UserContext);
  const project_dict = {};
  const empty_product = {
    "project_id" : "",
    "project_name" : "",
    "product_id" : "",
    "ordered_quantity": "",
    "expected_delivery": "",
    "product_type":"",
    "order_remark": "",
    "validProduct": true,
    "validProductCode": true
  };

  const [productList, setProductList] = useState([empty_product]);
  const [poNumber, setPONumber] = useState("");
  const [isInputValid, setIsInputValid] = useState(false);
  const project_master_list = useRef([]);
  const [projectOptions, setProjectOptions] = useState([]);
  useEffect( () => {
    ( async () => {
      const urlRequest = "http://127.0.0.1:80/spm/get_project_agg";
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
      console.log(project_dict)
    }
    )()
  }, [])
  
  const cleanPage = () => {
    setPONumber("")
    setProductList([empty_product])
  }

  const handlePOChange = (event) => {
    setPONumber(event.target.value)
  }
  const handleFormChange = (event, index) => {
    let data = [...productList];
    data[index][event.target.name] = event.target.value;
    const project_name = data[index]["project_name"] || "";
    const prod = project_master_list.current[project_name]
    if (event.target.name === "product_type")
      data[index]["validProduct"] = project_name && (prod && prod.product_types.some((product) => product === event.target.value));
    if (event.target.name === "product_id")
      data[index]["validProductCode"] = project_name && (prod && prod.product_ids.some((product) => product === event.target.value));
    setProductList(data);
    checkValidation()
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

  const checkValidation = () => {
    if ((poNumber) && (productList)) {
      const isNotValid = productList.some(({product_id, project_name, ordered_quantity, expected_delivery, product_type}) => {
        return !product_id || !project_name || !product_type || !ordered_quantity || !expected_delivery;
      })
      setIsInputValid(!isNotValid)
    }
    else {
      setIsInputValid(false);
    }
  }
  const addProduct = () => {
    setProductList([...productList, empty_product])
    setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...productList];
    data.splice(index, 1)
    await setProductList(data)
    checkValidation();
  }

  const onProjectChange = (e, index) => {
    let data = [...productList];
    if (! e){
      data[index]["project_name"] = "";
    }
    else{
      data[index]["project_name"] = e.value;
      data[index]["project_id"] = project_master_list.current[e.value]['project_id'];
    }
    setProductList(data);
    checkValidation()
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
                        <Form.Control type="text" value={poNumber} id="poNum" className="form-control" placeholder="Enter PO Number" onChange={(e)=>handlePOChange(e)} required/>
                    </div>
                    {
                      poNumber? 
                      productList.map(({product_id, project_name, ordered_quantity, expected_delivery, product_type, order_remark, validProduct, validProductCode,}, index ) => {
                        return (
                          <div className="row mb-3" style={index < productList.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="project_name" className="form-label">Project</label>
                                <Select name='project_name' options={projectOptions} isSearchable={true} isClearable={true} onChange={(s)=>onProjectChange(s, index)} required></Select>
                                {/* <Form.Control name='project' type="text" placeholder="Project" value={project} onChange={(e) => handleFormChange(e, index)} required/> */}

                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="product_type" className="form-label">Product Type</label>
                                <Form.Control className={ validProduct ? '' : "border border-danger"} name='product_type' type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="product_id" className="form-label">Product Code</label>
                                <Form.Control className={ validProductCode ? '' : "border border-danger"} name='product_id' type="text" placeholder="Code" value={product_id} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                              <label htmlFor="ordered_quantity" className="form-label">Quantity</label>
                              <Form.Control name='ordered_quantity' type="text" placeholder="Quantity" value={ordered_quantity} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label className="form-label">Delivery Date</label>
                                <Form.Control name='expected_delivery' type="date" placeholder="Date of Birth" value={expected_delivery} onChange={(e) => handleFormChange(e, index)} required/>
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
                            {/* <div className="col-xl-4 mb-3 col-auto">
                              <label htmlFor="remark" className="form-label">Remark</label>
                              <Form.Control name='remark' type="text" placeholder="Add Remark" value={order_remark} onChange={(e) => handleFormChange(e, index)}/>
                            </div> */}

                          </div>
                        )
                      }) : ""
                    }
                    
                    <div className="row">
                        
                        <div className="mb-1 mt-3 col-auto"><button className="btn btn-light px-5" type='button' onClick={cleanPage}>Cancel</button></div>
                        <div className="mb-1 mt-3 col-auto"><button className={`btn px-5 px-sm-15 ${isInputValid? "btn-primary":"btn-outline-primary disabled"}`} type="button" data-bs-toggle="modal" data-bs-target="#standard-modal">Submit</button></div>
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