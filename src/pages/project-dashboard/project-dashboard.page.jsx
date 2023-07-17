import { useEffect, useState, useContext} from "react";
import { ProjectTableCard } from "../../components/table-card/table-card.component";
import { useRef } from "react";
import { UserContext } from "../../contexts/user.context";
export const ProjectDashboard = () => {
  const inventory = useRef([]);
  const [projects, setProjects] = useState([]);
  const [poCount, setPOCount] = useState([]);
  const {currentUser} = useContext(UserContext);
  
  useEffect(() => {
    ( async () => {
      if (currentUser){
        const urlRequest = "http://127.0.0.1:80/spm/get_dashboard_items";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();
        inventory.current = response_data;
        
        setProjects(response_data["projects"]);
        setPOCount(response_data["po"]);
        console.log(response_data);
      }
    }
    )()
  }, [])


  if (!currentUser){
    return ("");
  }
  return (
    <div className="content-page">
        <div className="content">
            <div className="container-fluid">
              <div className="row">
                  <div className="col-sm-4">
                      <div className="page-title-box">
                          <h3 className="page-title">Project Dashboard</h3>
                      </div>
                  </div>
              </div>

              <div className="row">
                <div className="col-12">
                    <div className="card widget-inline">
                        <div className="card-body p-0">
                            <div className="row g-0">

                                <div id="pending-project_card" className="col-sm-6 col-lg-6" >
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-briefcase-line text-muted font-24"></i>
                                            <h3><span>{projects.length}</span></h3>
                                            <p className="text-muted font-15 mb-0">Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="project_card" className="col-sm-6 col-lg-6">
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-list-check-2 text-muted font-24"></i>
                                            <h3><span>{poCount}</span></h3>
                                            <p className="text-muted font-15 mb-0">Total Orders Placed</p>
                                            
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div> 
                </div>
              </div>

              <div className="accordion custom-accordion" id="CardaccordionExample">
              { 
                projects.map((project) => {
                    return (
                      <div className="card mb-0" key={project.project_name}>
                        <div className="card-header" id="CardheadingOne">
                            <h5 className="m-0">
                                <a className="custom-accordion-title d-block pt-2 pb-2"
                                    data-bs-toggle="collapse" href={`#project${project.project_name}`}
                                    aria-expanded="true" aria-controls={`project${project.project_name}`}>
                                    Project - {project.project_name}
                                </a>
                            </h5>
                        </div>

                        <div id={`project${project.project_name}`} className="collapse show"
                            aria-labelledby="CardheadingOne">
                            <div className="card-body">
                              <ProjectTableCard projectID={project.project_name} projectDetails={project.project_details}></ProjectTableCard>
                            </div>
                        </div>
                      </div>
                    )
                }) 
              }   
              </div>                              
            </div>
        </div>
    </div>
    
  )
}