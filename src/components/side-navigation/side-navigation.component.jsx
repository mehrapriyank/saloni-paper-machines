
import { useContext } from 'react';
import { Fragment, useState } from 'react';
import { Link, Outlet } from "react-router-dom"
import { UserContext } from '../../contexts/user.context';

const SideNavigaiton = () => {
    const url = window.location.href.split('/')
    const {currentUser} = useContext(UserContext);
    const [selectedPage, setSelectedPage] = useState(url[url.length-1] || "project-dashboard") ;

    const onClickHandler = (event) => {
      event.preventDefault();
      setSelectedPage(event.currentTarget.id);
    }
    return (
      <Fragment>
        <div className="leftside-menu">
          <div className="h-100" id="leftside-menu-container" data-simplebar>
              
              <div className="leftbar-user">
                  <h4 className="leftbar-user-name mt-2">{currentUser?.name}</h4>
              </div>

              <ul className="side-nav">
                  <li className="side-nav-title">Navigation</li>

                  {/* <li id="home" className={`side-nav-item ${selectedPage.includes('home')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/dashboard">
                          <i className="uil-home-alt"></i>
                          <span> Dashboard </span>
                      </Link>
                  </li> */}
                  
                  <li className="side-nav-item">
                      <a data-bs-toggle="collapse" href="#sidebarDashboards" aria-expanded="false" aria-controls="sidebarDashboards" className="side-nav-link">
                          <i className="uil-home-alt"></i>
                          <span className="badge bg-success float-end">2</span>
                          <span> Dashboards </span>
                      </a>
                      <div className="collapse" id="sidebarDashboards">
                          <ul className="side-nav-second-level">
                            <li id="project-dashboard" className={`${selectedPage.includes('project-dashboard')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="project-dashboard">
                                  <span>Project</span>
                              </Link>
                            </li>
                            <li id="inventory-dashboard" className={`${selectedPage.includes('inventory-dashboard')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="inventory-dashboard">
                                  <span>Inventory</span>
                              </Link>
                            </li>
                          </ul>
                      </div>
                  </li>

                  <li className="side-nav-item">
                      <a data-bs-toggle="collapse" href="#sidebarProjects" aria-expanded="false" aria-controls="sidebarProjects" className="side-nav-link">
                          <i className="uil-briefcase-alt"></i>
                          <span> Projects </span>
                      </a>
                      <div className="collapse" id="sidebarProjects">
                          <ul className="side-nav-second-level">
                            <li id="projects" className={`${selectedPage.includes('projects')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="/projects">
                                  <span>Project List</span>
                              </Link>
                            </li>
                            <li id="create-project" className={`${selectedPage.includes('create-project')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="/create-project">
                                  <span>Create Project</span>
                              </Link>
                            </li>
                          </ul>
                      </div>
                  </li>

                  <li className="side-nav-item">
                      <a data-bs-toggle="collapse" href="#sidebarOrders" aria-expanded="false" aria-controls="sidebarOrders" className="side-nav-link">
                          <i className="uil-list-ui-alt"></i>
                          <span> Orders </span>
                      </a>
                      <div className="collapse" id="sidebarOrders">
                          <ul className="side-nav-second-level">
                            <li id="orders" className={`${selectedPage.includes('orders')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="/orders">
                                  <span>Order List</span>
                              </Link>
                            </li>
                            <li id="create-order" className={`${selectedPage.includes('create-order')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="/create-order">
                                  <span>Create Order</span>
                              </Link>
                            </li>
                            <li id="update-order" className={`${selectedPage.includes('update-order')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                              <Link to="/update-order">
                                  <span>Recieve Order</span>
                              </Link>
                            </li>
                          </ul>
                      </div>
                  </li>



                  {/* <li id="projects" className={`side-nav-item ${selectedPage === 'projects'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/projects">
                          <i className="uil-briefcase-alt"></i>
                          <span> Projects </span>
                      </Link>
                  </li> */}

                  {/* <li id="orders" className={`side-nav-item ${selectedPage === 'orders'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/orders">
                          <i className="uil-briefcase-alt"></i>
                          <span> Orders </span>
                      </Link>
                  </li>

                  <li id="create-project" className={`side-nav-item ${selectedPage === 'create-project'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/create-project">
                          <i className="uil-file-plus-alt"></i>
                          <span> Create Project </span>
                      </Link>
                  </li>

                  <li id="create-order" className={`side-nav-item ${selectedPage === 'create-order'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/create-order">
                          <i className=" uil-list-ui-alt"></i>
                          <span> Create Order </span>
                      </Link>
                  </li>
                  
                  <li id="update-order" className={`side-nav-item ${selectedPage === 'update-order'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                    <Link className="side-nav-link" to="/update-order">
                          <i className=" uil-list-ui-alt"></i>
                          <span> Update Order </span>
                      </Link>
                  </li> */}

                  
              </ul>

              <div className="clearfix"></div>
          </div>
        </div>
        <Outlet></Outlet>
      </Fragment>

    )
}

export default SideNavigaiton;