
import Logo from '../../assets/images/logo.png';
import ProfilePhoto from '../../assets/images/avatar-10.jpg'
import { Fragment } from 'react';
import { Link, Outlet } from "react-router-dom"

const TopNavigation = () => {
    const onMenuclick = () => {
        document.getElementsByTagName("html")[0].dataset.sidenavSize = 
            document.getElementsByTagName("html")[0].dataset.sidenavSize=== "condensed"? "default":"condensed";
    }
    return (
        <Fragment>
            <div className="navbar-custom">
            <div className="topbar container-fluid">
                <div className="d-flex align-items-center gap-lg-2 gap-1">
                    <div className="logo-topbar">    
                        <a href="/" className="logo-dark">
                            <span className="logo-lg">
                                <img src={Logo} alt="logo"/>
                            </span>
                            <span className="logo-sm">
                                <img src={Logo} alt="small logo"/>
                            </span>
                        </a>
                    </div>
                        <button className="button-toggle-menu" onClick={onMenuclick}>
                            <i className="mdi mdi-menu"></i>
                        </button>

                </div>

                <ul className="topbar-menu d-flex align-items-center gap-3">
            
                    <li className="dropdown">
                        <a className="nav-link dropdown-toggle arrow-none nav-user px-2" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                            <span className="account-user-avatar">
                                <img src={ProfilePhoto} alt="user-image" width="32" className="rounded-circle"/>
                            </span>
                            <span className="d-lg-flex flex-column gap-1 d-none">
                                <h5 className="my-0">Saloni Sharma</h5>
                                <h6 className="my-0 fw-normal">Executive Director</h6>
                            </span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated profile-dropdown">
                            
                            <div className=" dropdown-header noti-title">
                                <h6 className="text-overflow m-0">Welcome !</h6>
                            </div>

                            
                            <a href="#" className="dropdown-item">
                                <i className="mdi mdi-account-circle me-1"></i>
                                <span>My Profile</span>
                            </a>

                            <a href="#" className="dropdown-item">
                                <i className="mdi mdi-logout me-1"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
            </div>
            <Outlet></Outlet>
        </Fragment>
        
  )
}

export default TopNavigation;