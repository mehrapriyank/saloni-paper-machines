import 'react-bootstrap/'
import { Form } from 'react-bootstrap';
import { useState } from 'react';
import { UserContext } from '../../contexts/user.context';
import { useContext } from 'react';
export const ProjectMasterListForm = () => {
  const {currentUser} = useContext(UserContext);
  const empty_product = {
    "product_type": "",
    "product_id": "",
    "required_quantity": "",
    "required_by_date": ""
  }

  const [productList, setProductList] = useState([empty_product]);
  const [projectName, setProjectName] = useState("");
  const [isInputValid, setIsInputValid] = useState(false);

  const cleanPage = () => {
    setProjectName("")
    setProductList([empty_product])
  }

  const handleProjectChange = (event) => {
    setProjectName(event.target.value)
  }
  const handleFormChange = (event, index) => {
    let data = [...productList];
    data[index][event.target.name] = event.target.value;
    setProductList(data);
    checkValidation()
  }

  const checkValidation = () => {
    if ((projectName) && (productList)) {
      const isNotValid = productList.some(({product_type, product_id, required_quantity, required_by_date}) => {
        return !product_type || !product_id || !required_quantity || !required_by_date;
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

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      "project_name": projectName,
      "project_details": productList,
      "created_by": currentUser.id,
    }
    console.log(data);
    const urlRequest = "http://192.168.1.4:80/spm/create_project";
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

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">

            <div className="row">
                <Form className="col-xl-12 needs-validation" onSubmit={submit}>

                    <div className="col-xl-6 mb-3 col-auto">
                        <label htmlFor="poNum" className="form-label">Project ID</label>
                        <Form.Control type="text" value={projectName} id="poNum" className="form-control" placeholder="Enter Project ID" onChange={(e)=>handleProjectChange(e)} required/>
                    </div>
                    {/* {
                      projectName? (
                        <div className="col-xl-9 mb-3 col-auto">
                            <div class="mb-3">
                                <label for="task-overview" className="form-label">Overview</label>
                                <Form.Control type='text-area' className="form-control" id="task-overview" placeholder="Enter some brief about task.."></Form.Control>
                            </div>
                        </div>
                      ) : ""
                    } */}
                    
                    {
                      projectName?
                      productList.map(({product_type, product_id, required_quantity, required_by_date}, index ) => {
                        return (
                          <div className="row mb-3" style={index < productList.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                            
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="product_type" className="form-label">Product Type</label>
                                <Form.Control name='product_type' type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label htmlFor="product_id" className="form-label">Product Code</label>
                                <Form.Control name='product_id' type="text" placeholder="Product ID" value={product_id} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                              <label htmlFor="required_quantity" className="form-label">Required Quantity</label>
                              <Form.Control name='required_quantity' type="text" placeholder="Quantity" value={required_quantity} onChange={(e) => handleFormChange(e, index)} required/>
                            </div>
                            <div className="col-xl-2 mb-3 col-auto">
                                <label className="form-label">Delivery Date</label>
                                <Form.Control name='required_by_date' type="date" placeholder="Requried By" value={required_by_date} onChange={(e) => handleFormChange(e, index)} required/>
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
                          </div>
                        )
                      }):""
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