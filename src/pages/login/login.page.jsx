import { useContext, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import { UserContext } from '../../contexts/user.context';

export const LoginPage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [userPass, setUserPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const {setCurrentUser} = useContext(UserContext);
    const navigate = useNavigate();

    const onFieldChange = (e) => {
        if(e.target.id === "emailaddress") setUserEmail(e.target.value);
        else if(e.target.id === "password") setUserPass(e.target.value);
    }

    const submit = async (e) => {
        e.preventDefault();
        console.log("submitted: ", [userEmail, userPass])
        if (userEmail) {
            const urlRequest = "http://127.0.0.1:80/spm/login?" + new URLSearchParams({
                "email": userEmail,
                "password": userPass
            });
            const response =  await fetch(urlRequest, {
                method: 'get', mode: 'cors', contentType: 'application/json',
            })

            const response_data = await response.json();
            console.log(response_data);

            if (response_data.login === "1") {
                await setCurrentUser(response_data);
                navigate('/dashboard');
            }
        }
    }

    return (
        <div className="authentication-bg">
            <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xxl-4 col-lg-5">
                            <div className="card">

                                <div className="card-header py-4 text-center bg-primary">
                                    <a href="index.html">
                                        <span><img src={Logo} alt="logo" height="22"/></span>
                                    </a>
                                </div>

                                <div className="card-body p-4">
                                    
                                    <div className="text-center w-75 m-auto">
                                        <h4 className="text-dark-50 text-center pb-0 fw-bold">Sign In</h4>
                                        <p className="text-muted mb-4">Enter your email address and password to access admin panel.</p>
                                    </div>

                                    <Form onSubmit={submit}>

                                        <div className="mb-3">
                                            <label htmlFor="emailaddress" className="form-label">Email address</label>
                                            <input className="form-control" type="email" id="emailaddress" required="" placeholder="Enter your email" value={userEmail} onChange={(e) => onFieldChange(e)}/>
                                        </div>

                                        <div className="mb-3">
                                            {/* <a href="pages-recoverpw.html" className="text-muted float-end"><small>Forgot your password?</small></a>
                                            <label htmlFor="password" className="form-label">Password</label> */}
                                            <div className="input-group input-group-merge">
                                                <input type={showPass? "text":"password"} id="password" className="form-control" placeholder="Enter your password"  value={userPass} onChange={(e) => onFieldChange(e)}/>
                                                <div className="input-group-text" data-password="false">
                                                    <span className="password-eye" onClick={()=> setShowPass(!showPass)}></span>
                                                </div>
                                            </div>
                                        </div>
    {/* 
                                        <div className="mb-3 mb-3">
                                            <div className="form-check">
                                                <input type="checkbox" className="form-check-input" id="checkbox-signin" checked/>
                                                <label className="form-check-label" htmlFor="checkbox-signin">Remember me</label>
                                            </div>
                                        </div> */}

                                        <div className="mb-3 mb-0 text-center">
                                            <button className="btn btn-primary" type="submit"> Log In </button>
                                        </div>

                                    </Form>
                                </div>
                            </div>

                            {/* <div className="row mt-3">
                                <div className="col-12 text-center">
                                    <p className="text-muted">Don't have an account? <a href="pages-register.html" className="text-muted ms-1"><b>Sign Up</b></a></p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer footer-alt">
                2023 - <script>document.write(new Date().getFullYear())</script> © Saloni Paper Machines
            </footer>
        </div>
    )
}