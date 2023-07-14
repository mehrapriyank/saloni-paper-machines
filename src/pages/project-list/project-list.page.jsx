import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function removeDup(arr) {
  let result = []
  arr.forEach((item, index) => { if (arr.indexOf(item) == index) result.push(item) });
  return result;
}
export const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  

  useEffect(() => {
    ( async () => {
      const urlRequest = "http://127.0.0.1:80/spm/get_project_agg";
      const response =  await fetch(urlRequest, {
        method: 'get', mode: 'cors', contentType: 'application/json',
      });
      const response_data = await response.json();
      const project_list = [];
      response_data.forEach(({project_name, created_by, product_ids, product_types, created_at}) => {
        const project_details = {};
        project_details["project_id"] = project_name;
        project_details["product_ids"] = removeDup(JSON.parse(product_ids));
        project_details["product_types"] = removeDup(JSON.parse(product_types));
        project_details["created_by"] = created_by;
        project_details["created_at"] = created_at;
        project_list.push(project_details);
      });

      await setProjects(project_list);

      console.log(project_list);
    }
    )()
  }, [])

  return (

    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
              <div className="col-sm-4">
                  <div className="page-title-box">
                      <h3 className="page-title">Projects</h3>
                  </div>
              </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-4">
                <Link to="/create-project" className="btn btn-danger rounded-pill mb-3"><i className="mdi mdi-plus"></i> Create New Project</Link>
            </div>
          </div>
          <div className="table-responsive table-centered">
            <table className="table table-centered w-100 dt-responsive nowrap" id="products-datatable">
              <thead className="table-light">
                  <tr>
                      <th className="all">Project ID</th>
                      <th>Product Type(s)</th>
                      <th>Product ID(s)</th>
                      <th>Created By</th>
                      <th>Created At</th>
                  </tr>
              </thead>
              <tbody>
              {
                
                projects.map(({project_id, product_ids, product_types, created_by,created_at }) => {
                  return (
                    <tr key={project_id}>
                      <td><h5><Link to={`/projects/${project_id}`} className="text-body">{project_id}</Link></h5></td>
                      <td>{product_types.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      <td>{product_ids.map((element) => (
                        <span key={element} className="ms-1 badge badge-primary-lighten">{element}</span>
                      ))}</td>
                      <td>{created_by}</td>
                      <td>{created_at}</td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}