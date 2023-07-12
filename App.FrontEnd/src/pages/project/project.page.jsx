import { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { timeDay } from 'd3';

export const Project = () => {
  const { project} = useParams();
  const [projectDetails, setProjectDetails] = useState([]);
  const [editProject, setEditProject ] = useState(false);
  const [isInputValid, setIsInputValid] = useState(false);
  const [projectID, setProjectID] = useState("");
  const empty_product = {
    "project_id" : projectID,
    "project_comp_id": "",
    "product_type": "",
    "product_id": "",
    "required_quantity": "",
    "required_by_date": "",
    "isUpdated": true
  }
  const [originalList, setOriginalList] = useState([]);
  useEffect(() => {
    ( async () => {
      const urlRequest = "http://192.168.1.4:80/spm/get_project_items?" + new URLSearchParams({
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
    })()
  }, [project])
  
  const handleFormChange = (event, index) => {
    let data = [...projectDetails];
    data[index][event.target.name] = event.target.value;
    data[index]["isUpdated"] = true;
    setProjectDetails(data);
    checkValidation()
  }

  const checkValidation = () => {
    if (projectDetails) {
      const isNotValid = projectDetails.some(({product_type, product_id, required_quantity, required_by_date}) => {
        return !product_type || !product_id || !required_quantity || !required_by_date;
      })
      setIsInputValid(!isNotValid)
    }
    else {
      setIsInputValid(false);
    }
  }
  const addProduct = () => {
    setProjectDetails([...projectDetails, empty_product])
    setIsInputValid(false);
  }

  const removeProduct = async (e, index) => {
    let data = [...projectDetails];
    data.splice(index, 1)
    await setProjectDetails(data)
    checkValidation();
  }

  const submit = async (e) => {
    const data = {
      "project_id": projectID,
      "project_name": project,
      "project_details": projectDetails.filter((item) => item.isUpdated === true),
      "updated_on": Date.now(),
      "updated_by": 1
    }
    console.log(data);
    const urlRequest = "http://192.168.1.4:80/spm/update_project";
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
            editProject? "":
            (<div className="row mb-2">
              <div className="col-sm-4">
                  <button className="btn btn-danger rounded-pill mb-3" onClick={(e) => onEditClick(e)}><i className="mdi mdi-plus"></i> Edit Project Items</button>
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
                          projectDetails.map(({product_type, product_id, required_quantity, project_comp_id, required_by_date}, index ) => {
                            return (
                              <div className="row mb-3" style={index < projectDetails.length-1? {"borderBottom": "1px solid #d8d8d8"} : {}} key={index}>
                                
                                <div className="col-xl-2 mb-3 col-auto">
                                    <label htmlFor="product_type" className="form-label">Product Type</label>
                                    <Form.Control name='product_type' type="text" placeholder="Product" value={product_type} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject || project_comp_id}/>
                                </div>
                                <div className="col-xl-2 mb-3 col-auto">
                                    <label htmlFor="product_id" className="form-label">Product Code</label>
                                    <Form.Control name='product_id' type="text" placeholder="Product ID" value={product_id} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject || project_comp_id}/>
                                </div>
                                <div className="col-xl-2 mb-3 col-auto">
                                  <label htmlFor="required_quantity" className="form-label">Required Quantity</label>
                                  <Form.Control name='required_quantity' type="text" placeholder="Req Quantity" value={required_quantity} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject}/>
                                </div>
                                <div className="col-xl-2 mb-3 col-auto">
                                    <label className="form-label">Required By Date</label>
                                    <Form.Control name='required_by_date' type="date" placeholder="Required By" value={required_by_date} onChange={(e) => handleFormChange(e, index)} readOnly={!editProject}/>
                                    {/* <p name='required_by_date'> {required_by_date}</p> */}
                                </div>
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