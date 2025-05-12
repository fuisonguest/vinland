import React, { useState, useEffect } from 'react';
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBInput,
  MDBCheckbox,
  MDBIcon,
}
from 'mdb-react-ui-kit';
import { Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import GoogleSignIn from './GoogleSignIn';
import { useToast } from "@chakra-ui/react";
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth';


function Login() {
  const [err, setErr] = useState();
  const [justifyActive, setJustifyActive] = useState('tab1');
  const [registered, setRegistered] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPhoneNumber, setIsPhoneNumber] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Clean up reCAPTCHA when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  useEffect(() => {
    // Check if input is a phone number
    const phoneRegex = /^(\+\d{1,3})?[-.\s]?\d{10}$/;
    setIsPhoneNumber(phoneRegex.test(userIdentifier));
    
    // Reset OTP state when identifier changes
    if (otpSent) {
      setOtpSent(false);
      setVerificationCode('');
      setVerificationId('');
      
      // Clear recaptcha if it exists
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.log("Error clearing reCAPTCHA:", error);
        }
        window.recaptchaVerifier = null;
      }
    }
  }, [userIdentifier]);

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }

    // Reset states when switching tabs
    setUserIdentifier('');
    setPassword('');
    setIsPhoneNumber(false);
    setOtpSent(false);
    setVerificationCode('');
    setVerificationId('');
    setShowPassword(false);
    setShowRePassword(false);
    
    // Clean up reCAPTCHA when switching tabs
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.log("Error clearing reCAPTCHA:", error);
      }
      window.recaptchaVerifier = null;
    }
    
    // Clear the recaptcha container
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = '';
    }

    setJustifyActive(value);
  };

  function register(event){
      event.preventDefault();
      var email = document.getElementById("reemail").value;
      var password = document.getElementById("repassword").value;
      var rpassword = document.getElementById("rpassword").value;
      var name = document.getElementById("name").value;
      if (password === rpassword){
      axios
      .post("https://retrend-final.onrender.com/register", {
          email,password,name,
      })
      .then((response) => {
        console.log(response.data);
        setRegistered(true)
        toast({
          title: 'Account created.',
          description: "We've created your account for you.",
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
      })
      .catch((error) => {
        console.log(error);
        if(error.response.status === 409){
          setErr(409);
        }
      });
    }
    else{
      document.getElementById("alert").innerHTML = "Passwords do not match";
    }
  }

  function handleLogin(event) {
    event.preventDefault();
    
    if (isPhoneNumber) {
      // If OTP not sent yet, send OTP
      if (!otpSent) {
        sendOTP(event);
      } else {
        // If OTP sent, verify OTP
        verifyOTP(event);
      }
    } else {
      // Regular email login
      loginWithEmail(event);
    }
  }

  function loginWithEmail(event) {
    event.preventDefault();
    axios
      .post("https://retrend-final.onrender.com/login", {
        email: userIdentifier,
        password: password,
      })
      .then((response) => {
        console.log(response.data);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authemail', response.data.email);
        localStorage.setItem('authname', response.data.name);
        localStorage.setItem('authphone', response.data.phone);
        localStorage.setItem('authpicture', response.data.picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
        window.location.href = '/';
      })
      .catch((error) => {
        console.log(error);
        if(error.response.status === 404){
          setErr(404);
        }
        else if(error.response.status === 400){
          setErr(400);
        }
      });
  }

  // Setup reCAPTCHA verifier
  const setupRecaptcha = () => {
    // Clear any existing reCAPTCHA instances first
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.log("Error clearing reCAPTCHA:", error);
      }
      window.recaptchaVerifier = null;
    }
    
    // Create a unique ID for the reCAPTCHA container
    const recaptchaContainerId = `recaptcha-container-${Date.now()}`;
    
    // Create a new div element for the reCAPTCHA
    const recaptchaContainer = document.getElementById('recaptcha-container');
    recaptchaContainer.innerHTML = ''; // Clear any existing content
    const recaptchaElement = document.createElement('div');
    recaptchaElement.id = recaptchaContainerId;
    recaptchaContainer.appendChild(recaptchaElement);
    
    // Initialize the reCAPTCHA verifier with the new element
    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      'size': 'invisible',
      'callback': (response) => {
        console.log("reCAPTCHA verified");
      },
      'expired-callback': () => {
        console.log("reCAPTCHA expired");
        toast({
          title: 'reCAPTCHA expired',
          description: "Please try again",
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  // Send OTP to phone number
  const sendOTP = async (e) => {
    e.preventDefault();
    
    if (!userIdentifier || !isPhoneNumber) {
      toast({
        title: 'Invalid phone number',
        description: "Please enter a valid phone number",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      setupRecaptcha();
      
      // Format phone number with country code if not already included
      const formattedPhoneNumber = userIdentifier.startsWith('+') 
        ? userIdentifier 
        : `+91${userIdentifier}`; // Assuming India (+91) as default
      
      const appVerifier = window.recaptchaVerifier;
      
      // Render the reCAPTCHA widget
      await appVerifier.render();
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      
      // Save the verification ID
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
      
      toast({
        title: 'OTP sent',
        description: `We've sent an OTP to ${formattedPhoneNumber}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: 'Error sending OTP',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.log("Error clearing reCAPTCHA:", clearError);
        }
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: "Please enter a valid 6-digit OTP",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Sign in with credential
      const result = await auth.signInWithCredential(credential);
      const user = result.user;
      
      // Get ID token for backend verification
      const idToken = await user.getIdToken();
      
      // Send token to backend
      const response = await axios.post('https://retrend-final.onrender.com/phone-auth', {
        credential: idToken,
        phoneNumber: user.phoneNumber
      });
      
      // Store auth data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authemail', response.data.email || '');
      localStorage.setItem('authname', response.data.name || user.phoneNumber);
      localStorage.setItem('authphone', user.phoneNumber);
      localStorage.setItem('authpicture', response.data.picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
      
      toast({
        title: 'Login successful',
        description: "You've been successfully logged in",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: 'Error verifying OTP',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  return (
    <MDBContainer className="p-3 mt-1 mb-1 my-5 d-flex flex-column dynamic-login-form">
      <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
            LOGIN
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
            REGISTER
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>

        <MDBTabsPane show={justifyActive === 'tab1'}>

          <div className="text-center mb-3">
            <p>Sign in with:</p>

            <div className="d-flex justify-content-center mb-4">
              <GoogleSignIn />
            </div>

            <p className="text-center mt-3">or:</p>
          </div>
          
          {/* reCAPTCHA container - styled to be invisible but accessible */}
          <div 
            id="recaptcha-container" 
            style={{ 
              position: 'relative',
              minHeight: '60px',
              marginBottom: '10px',
              overflow: 'hidden'
            }}
          ></div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <MDBInput 
                label='Email or Phone Number' 
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                type='text' 
                required
                disabled={isPhoneNumber && otpSent}
              />
            </div>

            {!isPhoneNumber && (
              <div className="mb-4 input-transition password-field-container">
                <MDBInput 
                  label='Password' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} 
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  <MDBIcon icon={showPassword ? 'eye-slash' : 'eye'} />
                </button>
              </div>
            )}
            
            {isPhoneNumber && otpSent && (
              <div className="mb-4 input-transition">
                <MDBInput 
                  label='Enter 6-digit OTP' 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  type='text' 
                  required
                  disabled={loading}
                  maxLength={6}
                  className="otp-input"
                />
              </div>
            )}

            {(!isPhoneNumber || !otpSent) && (
              <div className="d-flex justify-content-between mx-4 mb-4">
                <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                <a href="!#">Forgot password?</a>
              </div>
            )}

            <MDBBtn className="mb-4 w-100 login-btn" type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isPhoneNumber && !otpSent) ? 'Send OTP' : (isPhoneNumber && otpSent) ? 'Verify OTP' : 'Sign in'}
            </MDBBtn>
            
            {isPhoneNumber && otpSent && (
              <p className="text-center mb-4 input-transition">
                Didn't receive the code?{' '}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  // Reset OTP state
                  setOtpSent(false);
                  setVerificationCode('');
                }}>
                  Resend OTP
                </a>
              </p>
            )}
          </form>
          
          {err === 404 && <Alert variant='danger'>Incorrect Email</Alert>}
          {err === 400 && <Alert variant='danger'>Incorrect Password</Alert>}
          <p className="text-center">Not a member? <a href='#' onClick={() => handleJustifyClick('tab2')}>Register</a></p>

        </MDBTabsPane>

        <MDBTabsPane show={justifyActive === 'tab2'}>

          <div className="text-center mb-3">
            <p>Sign up with:</p>

            <div className="d-flex justify-content-center mb-4">
              <GoogleSignIn />
            </div>

            <p className="text-center mt-3">or:</p>
          </div>
          {registered === false &&
          <form onSubmit={register}>
            <MDBInput wrapperClass='mb-4' label='Name' id='name' type='text' required/>
            <MDBInput wrapperClass='mb-4' label='Email' id='reemail' type='email' required/>
            
            <div className="mb-4 password-field-container">
              <MDBInput 
                wrapperClass='' 
                label='Password' 
                id='repassword' 
                type={showPassword ? 'text' : 'password'} 
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
              >
                <MDBIcon icon={showPassword ? 'eye-slash' : 'eye'} />
              </button>
            </div>
            
            <div className="mb-4 password-field-container">
              <MDBInput 
                wrapperClass='' 
                label='Repeat your password' 
                id='rpassword' 
                type={showRePassword ? 'text' : 'password'} 
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={toggleRePasswordVisibility}
              >
                <MDBIcon icon={showRePassword ? 'eye-slash' : 'eye'} />
              </button>
            </div>

            <Badge id="alert" className="mb-1" bg="danger"></Badge>

            <div className='d-flex justify-content-center mb-4'>
              <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='I have read and agree to the terms' required/>
            </div>
            {err === 409 && <Alert variant='danger'>User Already Exist,Please Login</Alert>}
            <MDBBtn className="mb-4 w-100 register-btn" type='submit'>Sign up</MDBBtn>
          </form>
        }
          {registered === true && <Alert variant='success'> Registered successfully</Alert>}

        </MDBTabsPane>

      </MDBTabsContent>

    </MDBContainer>
  );
}

export default Login;
