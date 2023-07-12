import { useEffect, useState, useContext} from "react";
import { ProjectTableCard, ProductTableCard, ToOrderProjectTableCard } from "../../components/table-card/table-card.component";
import { useRef } from "react";
import { UserContext } from "../../contexts/user.context";
export const InventoryDashboard = () => {
  const inventory = useRef([]);
  const [projects, setProjects] = useState([]);
  const [poCount, setPOCount] = useState([]);
  const [products, setProducts] = useState([]);
  const [layout, setLayout] = useState("projects");
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
        
        setProducts(response_data["products"]);
        setProjects(response_data["projects"]);
        setPOCount(response_data["po"]);
        console.log(response_data);
      }
    }
    )()
  }, [])

  const layoutHandler = (event) => {
    const newLayout = event.currentTarget.id.split("_")[0];
    setLayout(newLayout);
  }

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
                          <h3 className="page-title">Inventory Dashboard</h3>
                      </div>
                  </div>
                  <div className="col-sm-8">
                      <div className="page-title-box text-sm-end">
                          <div className="btn-group mt-3 ms-1">
                              {/* <button type="button" id="pending-project" className={`btn btn-${layout === "pending-project"? "" : "outline-"}primary`} onClick={(e) => layoutHandler(e)}>Pending</button> */}
                              <button type="button" id="ordered-project" className={`btn btn-${layout === "ordered-project"? "" : "outline-"}primary`} onClick={(e) => layoutHandler(e)}>Projects</button>
                              <button type="button" id="ordered-product" className={`btn btn-${layout === "ordered-product"? "" : "outline-"}primary`} onClick={(e) => layoutHandler(e)}>Products</button>
                          </div>
                          
                      </div>
                  </div>
              </div>

              <div className="row">
                <div className="col-12">
                    <div className="card widget-inline">
                        <div className="card-body p-0">
                            <div className="row g-0">

                                <div id="pending-project_card" className="col-sm-6 col-lg-4" >
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-briefcase-line text-muted font-24"></i>
                                            <h3><span>{projects.length}</span></h3>
                                            <p className="text-muted font-15 mb-0">Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="project_card" className="col-sm-6 col-lg-4">
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-list-check-2 text-muted font-24"></i>
                                            <h3><span>{poCount}</span></h3>
                                            <p className="text-muted font-15 mb-0">Total Orders Placed</p>
                                            
                                        </div>
                                    </div>
                                </div>

                                <div id="product_card" className="col-sm-6 col-lg-4">
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-group-line text-muted font-24"></i>
                                            <h3><span>{products.length}</span></h3>
                                            <p className="text-muted font-15 mb-0">Product Types</p>
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
                layout.includes("pending")?
                  projects.map(({project_id, projectDetails})=> {
                    return (
                      <div className="card mb-0" key={project_id}>
                          <div className="card-header" id="CardheadingOne">
                              <h5 className="m-0">
                                  <a className="custom-accordion-title d-block pt-2 pb-2"
                                      data-bs-toggle="collapse" href={`#project${project_id}`}
                                      aria-expanded="true" aria-controls={`project${project_id}`}>
                                      Project - {project_id}
                                  </a>
                                  
                              </h5>
                          </div>

                          <div id={`project${project_id}`} className="collapse show"
                              aria-labelledby="CardheadingOne">
                              <div className="card-body">
                                <ToOrderProjectTableCard projectID={project_id} projectDetails={projectDetails}></ToOrderProjectTableCard>
                              </div>
                          </div>
                      </div>
                    )
                  })
                  :
                layout.includes("project")?
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
                  :
                  products.map((product) => {
                    return (
                        <div className="card mb-0" key={product.product_type}>
                          <div className="card-header" id="CardheadingOne">
                              <h5 className="m-0">
                                  <a className="custom-accordion-title d-block pt-2 pb-2"
                                      data-bs-toggle="collapse" href={`#product${product.product_type}`}
                                      aria-expanded="true" aria-controls={`product${product.product_type}`}>
                                      Product - {product.product_type}
                                  </a>
                              </h5>
                          </div>

                          <div id={`product${product.product_type}`} className="collapse show"
                              aria-labelledby="CardheadingOne">
                              <div className="card-body">
                                <ProductTableCard productType={product.product_type} productDetails={product.product_details}></ProductTableCard>
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