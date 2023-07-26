import { useState, useEffect, Fragment} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { UserContext } from '../../contexts/user.context';
import { useContext } from 'react';
import Select from 'react-select'

const qtypeOption = [
  { "value": "mm", "label": "mm" },
  { "value": "Kg", "label": "Kg" },
  { "value": "No's", "label": "No's" },
]
export const Project = () => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const {currentUser} = useContext(UserContext);
  const { project} = useParams();
  const [projectDetails, setProjectDetails] = useState([]);
  const [editProject, setEditProject ] = useState(false);
  // const [isInputValid, setIsInputValid] = useState(false);
  const [projectID, setProjectID] = useState("");
  const empty_product = {
    "project_id" : projectID,
    "project_comp_id": "",
    "product_type": "",
    "product_id": "",
    "required_quantity": "",
    "required_by_date": "",
    "isUpdated": true,
    "quantity_type": ""
  }
  const [originalList, setOriginalList] = useState([]);
  useEffect(() => {
    ( async () => {
      if (currentUser) {
        const urlRequest = "http://127.0.0.1:80/spm/get_project_items?" + new URLSearchParams({
          "project_name": project
        });
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        })

        const response_data = await response.json();
        console.log(response_data)
        setProjectID(response_data.project_id);
        const project_items = response_data.project_items;
        const projectDet = project_items.map(item => ({...item, isUpdated: false}))
        setProjectDetails([...projectDet]);
        setOriginalList(JSON.parse(JSON.stringify(projectDet)));
        }
    })()
  }, [editProject])
  
  const handleFormChange = (event, index) => {
    let data = [...projectDetails];
    data[index][event.target.name] = event.target.value;
    data[index]["isUpdated"] = true;
    setProjectDetails(data);
  }

  const addProduct = () => {
    setProjectDetails([...projectDetails, empty_product])
    // setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...projectDetails];
    data.splice(index, 1)
    await setProjectDetails(data);
  }

  const handleQTypeChange = (event, index) => {
    console.log(event)
    let data = [...projectDetails];
    if (event) {
     data[index]["quantity_type"] = event.value;
    } else {
      data[index]["quantity_type"] = "";
    }
    setProjectDetails(data);
    data[index]["isUpdated"] = true;
  }


  const submit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || 
      projectDetails.some(project => (project.used_quantity > project.recieved_quantity) || (project.dispatched_quantity > project.used_quantity))) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      const data = {
        "project_id": projectID,
        "project_name": project,
        "project_details": projectDetails.filter((item) => item.isUpdated === true),
        "updated_on": Date.now(),
        "updated_by": currentUser.id
      }
      console.log(data);
      const urlRequest = "http://127.0.0.1:80/spm/update_project";
      const response = await fetch(urlRequest, {
          headers: new Headers({'content-type': 'application/json'}),
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data)
      })
      const response_data = await response.json;
      console.log("Response on submit" + response_data);
      projectDetails.forEach((item)=> item.isUpdated = false);
      setOriginalList(JSON.parse(JSON.stringify(projectDetails)));
      setEditProject(false);
      navigate("/projects");
    }
    setValidated(true);
    event.preventDefault();
  } 
  const onEditClick = () => {
    setEditProject(!editProject);
    console.log("Original List: ",originalList);
    setProjectDetails(JSON.parse(JSON.stringify(originalList)));
  }

  return (
    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-4">
              <div className="page-title-box">
                <h3 className="page-title">Project - {project}</h3>
              </div>
            </div>
          </div>
          {
            editProject? 
            (
              <div className="row mb-2">
                <div className="col-sm-4">
                  <button className="btn btn-success rounded-pill mb-3" onClick={addProduct}><i className="mdi mdi-plus"></i>Add Items</button>
                </div>
              </div>
            ):
            (
              <div className="row mb-2">
                <div className="col-sm-4">
                  <button className="btn btn-danger rounded-pill mb-3" onClick={(e) => onEditClick(e)}><i className="mdi mdi-plus"></i> Edit Project Items</button>
                </div>
              </div>
            )
          }
          
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className="card-body">

                  <div className="row">
                      <Form className="col-xl-12" noValidate validated={validated} onSubmit={submit}>
                        {
                          projectDetails.map(({product_type, product_id, required_quantity, project_comp_id, required_by_date, quantity_type, used_quantity, dispatched_quantity, recieved_quantity}, index ) => {
                            return (
                              <div className="row mb-3" style={index < projectDetails.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                                
                                <div className="col-xl-2 mb-2 col-auto">
                                    <label htmlFor="product_type" className="form-label">Product Type</label>
                                    <Form.Control name='product_type' className={ editProject && !project_comp_id ? "border border-primary" : ""} type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject || project_comp_id} required/>
                                </div>
                                <div className="col-xl-2 mb-2 col-auto">
                                    <label htmlFor="product_id" className="form-label">Product Code</label>
                                    <Form.Control name='product_id' className={ editProject && !project_comp_id ? "border border-primary" : ""} type="text" placeholder="Product ID" value={product_id} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject || project_comp_id} required/>
                                </div>
                                <div className="col-xl-1 mb-2 col-auto">
                                  <label htmlFor="required_quantity" className="form-label">Required</label>
                                  <Form.Control name='required_quantity' className={ editProject ? 'border border-primary' : ""} type="number" min="0" placeholder="Req Quantity" value={required_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject} required/>
                                </div>
                                <div className="col-xl-2 mb-2 col-auto">
                                  <label htmlFor="quantity_type" className="form-label">QType</label>
                                  <Select name='quantity_type' value={{"label": quantity_type}} options={qtypeOption} isSearchable={true} isClearable={true} onChange={(s)=>handleQTypeChange(s, index)} isDisabled={!editProject} required></Select>
                                </div>
                                <div className="col-xl-2 mb-2 col-auto">
                                    <label className="form-label">Req Date</label>
                                    <Form.Control name='required_by_date' className={ editProject ? 'border border-primary' : ""} type="date" placeholder="Required By" value={required_by_date} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject} required/>
                                    {/* <p name='required_by_date'> {required_by_date}</p> */}
                                </div>
                                { project_comp_id? (
                                  <Fragment>
                                    <div className="col-xl-1 mb-2 col-auto">
                                      <label htmlFor="recieved_quantity" className="form-label">Recieved</label>
                                      <Form.Control name='recieved_quantity' type="text" placeholder="Used" value={recieved_quantity || 0} readOnly/>
                                    </div>
                                    <div className="col-xl-1 mb-2 col-auto">
                                      <label htmlFor="used_quantity" className="form-label">Used</label>
                                      <Form.Control name='used_quantity' className={ editProject ? 'border border-primary' : ""} type="number"
                                      min="0" max={recieved_quantity || 0} isInvalid={used_quantity>recieved_quantity} placeholder="Used" value={used_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject}/>
                                      <Form.Control.Feedback type="invalid">
                                          Please select a value between 0-{recieved_quantity || 0}
                                      </Form.Control.Feedback>
                                    </div>
                                    <div className="col-xl-1 mb-2 col-auto">
                                      <label htmlFor="dispatched_quantity" className="form-label">Dispatched</label>
                                      <Form.Control name='dispatched_quantity' className={ editProject ? 'border border-primary' : ""} type="number"
                                      min="0" max={used_quantity || 0} isInvalid={dispatched_quantity>used_quantity} placeholder="Dispatched" value={dispatched_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject}/>
                                      <Form.Control.Feedback type="invalid">
                                          Please select a value between 0-{used_quantity ||0}
                                      </Form.Control.Feedback>
                                    </div>
                                  </Fragment>
                                  ):"" 
                                }
                                {
                                  editProject && projectDetails.length > 1 && !project_comp_id ? (
                                    <div className="col-xl-1 mb-3 col-auto">
                                      <label className="form-label d-block invisible">Remove</label>
                                      <button className="btn btn-outline-danger" type='button' onClick={(e) => removeProduct(e, index)}>Remove</button>
                                    </div>
                                  ): ""
                                }
                                {
                                  editProject? (
                                      <div className="col-xl-1 mb-3 col-auto">
                                        <label className="form-label d-block invisible">Add</label>
                                        {
                                          index === projectDetails.length-1 ?  (<button className="btn btn-outline-success" type = 'button' onClick={addProduct}>Add</button>): 
                                          ("")
                                        }
                                      </div>
                                    ):""
                                }
                                
                              </div>
                            )
                          })
                        }
                        {
                          editProject? (
                            <div className="row">
                              <div className="mb-1 mt-3 col-auto"><button className="btn btn-light px-5" type='button' onClick={onEditClick}>Cancel</button></div>
                              <div className="mb-1 mt-3 col-auto"><button className="btn px-5 px-sm-15 btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#standard-modal">Submit</button></div>
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
                                        This will update the original list.
                                        Do you want to save the new project details?
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