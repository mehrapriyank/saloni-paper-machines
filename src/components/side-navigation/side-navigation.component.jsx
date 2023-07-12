
import { Fragment, useState } from 'react';
import profilePhoto from '../../assets/images/avatar-10.jpg';
import { Link, Outlet } from "react-router-dom"

const SideNavigaiton = () => {
    const url = window.location.href.split('/')
    
    const [selectedPage, setSelectedPage] = useState(url[url.length-1] || "home") ;

    const onClickHandler = (event) => {
      event.preventDefault();
      setSelectedPage(event.currentTarget.id);
    }
    return (
      <Fragment>
        <div className="leftside-menu">
          <div className="h-100" id="leftside-menu-container" data-simplebar>
              
              <div className="leftbar-user">
                  <a href="pages-profile.html">
                      <img src={profilePhoto} alt = "" height="42" className="rounded-circle shadow-sm"/>
                      <span className="leftbar-user-name mt-2">Saloni Sharma</span>
                  </a>
              </div>

              <ul className="side-nav">
                  <li className="side-nav-title">Navigation</li>

                  <li id="home" className={`side-nav-item ${selectedPage.includes('home')?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/dashboard">
                          <i className="uil-home-alt"></i>
                          <span> Dashboard </span>
                      </Link>
                  </li>
                
                  <li id="projects" className={`side-nav-item ${selectedPage === 'projects'?  "menuitem-active": ""}`} onClick={onClickHandler}>
                      <Link className="side-nav-link" to="/projects">
                          <i className="uil-briefcase-alt"></i>
                          <span> Projects </span>
                      </Link>
                  </li>

                  <li id="orders" className={`side-nav-item ${selectedPage === 'orders'?  "menuitem-active": ""}`} onClick={onClickHandler}>
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
                  </li>

                  
              </ul>

              <div className="clearfix"></div>
          </div>
        </div>
        <Outlet></Outlet>
      </Fragment>

    )
}

export default SideNavigaiton;