import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { Carousel } from "react-bootstrap";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { MDBCardImage, MDBCol, MDBRow } from "mdb-react-ui-kit";
import MapComponent from "./MapComponent";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Modallogin from "./Modallogin";
import Loading from "./resources/Loading";
import NotFoundComponent from "./resources/NotFound";
import { initializeRazorpay } from './razorpayUtils';
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareProduct from "./components/ShareProduct";
import StaticMap from './components/StaticMap';
import { FaDirections } from 'react-icons/fa';
import PropertyDetailsDisplay from './components/PropertyDetailsDisplay';
import MobileDetailsDisplay from './components/MobileDetailsDisplay';
import JobDetailsDisplay from './components/JobDetailsDisplay';
import FixJobData from './components/FixJobData';
import { extractPropertyData } from './utils/PropertyDataUtils';
import { extractJobData } from './utils/JobDataUtils';
import VehicleDetailsDisplay from './components/VehicleDetailsDisplay';
import { API_BASE_URL, RAZORPAY_KEY_ID, getApiUrl, devLog } from './utils/config';

const PreviewAd = ({auth}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [own, setOwn] = useState();
  const [loading, setLoading] = useState(true);
  const [NotFound, setNotFound] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const authToken = localStorage.getItem("authToken");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // New state for debug data
  const [debugData, setDebugData] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState(null);

  // for register and login
  const [staticModal, setStaticModal] = useState(false);
  const toggleShow = () => setStaticModal(!staticModal);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.post(
        `https://retrend-final.onrender.com/previewad/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setOwn(response.data.own);
      setData(response.data.product);
      setLoading(false); // Set loading state to false when data is fetched successfully
    } catch (error) {
      // console.error(error);
      // when not loged in
      // make changes for not loged in user as authToken is not updated so data is not recieved .
      setOwn(false);
      try{
        const notlogedindata = await axios.post(`https://retrend-final.onrender.com/previewad/notloggedin/${id}`);
      setData(notlogedindata.data.product);
      setLoading(false); // Set loading state to false when data is fetched successfully
      }
      catch(e){
        setLoading(false);
        setNotFound(true); 
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Also fetch debug data
    fetchDebugData();
  }, []);

  useEffect(() => {
    console.log("Full data:", data);
    console.log("Vehicle data:", data.vehicleData);
    console.log("Property data:", data.propertyData);
    console.log("Job data:", data.jobData);
    console.log("Property data type:", data.propertyData ? typeof data.propertyData : 'No property data');
    console.log("Job data type:", data.jobData ? typeof data.jobData : 'No job data');
    
    // Extract and normalize property data if it exists
    if (data && data.propertyData) {
      const normalizedPropertyData = extractPropertyData(data);
      
      if (Object.keys(normalizedPropertyData).length > 0) {
        console.log("Normalized property data:", normalizedPropertyData);
        
        // Only update if we have extracted valid property data
        setData(prevData => ({
          ...prevData,
          propertyData: normalizedPropertyData
        }));
      }
    }

    // Extract and normalize job data if it exists
    if (data && data.jobData) {
      try {
        let jobData = data.jobData;
        
        // Handle string vs object format
        if (typeof jobData === 'string') {
          try {
            console.log("Attempting to parse job data string");
            jobData = JSON.parse(jobData);
          } catch (e) {
            console.error("Failed to parse job data string:", e);
            // Instead of failing silently, try to convert it to an object with the string as a value
            jobData = { rawData: jobData };
          }
        }
        
        if (jobData && typeof jobData === 'object') {
          // Normalize job data to ensure all fields are present
          const normalizedJobData = {
            jobRole: jobData.jobRole || data.title || "",
            jobCategory: jobData.jobCategory || data.subcatagory || "",
            companyName: jobData.companyName || data.owner || "",
            positionType: jobData.positionType || "Full-time",
            salaryPeriod: jobData.salaryPeriod || "Monthly",
            salaryFrom: jobData.salaryFrom || data.price || "",
            salaryTo: jobData.salaryTo || "",
            educationRequired: jobData.educationRequired || "Any",
            experienceRequired: jobData.experienceRequired || "Fresher",
            jobLocation: jobData.jobLocation || ((data.address && data.address[0]) 
              ? `${data.address[0].city || ""}, ${data.address[0].state || ""}` 
              : ""),
            skills: jobData.skills || "",
            openings: jobData.openings || "1"
          };
          
          console.log("Normalized job data:", normalizedJobData);
          
          // Update state with normalized job data - use a function to avoid race conditions
          setData(prevData => {
            // Check if the current data has changed since this useEffect was triggered
            if (prevData._id !== data._id) {
              console.log("Data ID changed, skipping update");
              return prevData;
            }
            
            // Merge the normalized job data with existing data
            return {
              ...prevData,
              jobData: normalizedJobData
            };
          });
        }
      } catch (error) {
        console.error("Error processing job data:", error);
      }
    } else if (data && (data.catagory === "Jobs" || (data.subcatagory && data.subcatagory.toLowerCase().includes("job")))) {
      // Create minimal job data for job listings that don't have any
      console.log("Creating minimal job data for job listing");
      const autoJobData = {
        jobRole: data.title || "",
        jobCategory: data.subcatagory || "",
        companyName: data.owner || "",
        positionType: "Full-time",
        salaryPeriod: "Monthly",
        salaryFrom: data.price || "",
        salaryTo: "",
        educationRequired: "Any",
        experienceRequired: "Fresher",
        jobLocation: (data.address && data.address[0]) 
          ? `${data.address[0].city || ""}, ${data.address[0].state || ""}` 
          : "",
        skills: "",
        openings: "1"
      };
      
      // Update state with auto-generated job data
      setData(prevData => {
        // Check if the current data has changed since this useEffect was triggered
        if (prevData._id !== data._id) {
          console.log("Data ID changed, skipping update");
          return prevData;
        }
        
        return {
          ...prevData,
          jobData: autoJobData
        };
      });
      
      // If the user owns this product, automatically save this job data to the database
      if (data.own) {
        const saveDefaultJobData = async () => {
          try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            await axios.post(
              `https://retrend-final.onrender.com/updateproduct/${id}`,
              { jobData: autoJobData },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Default job data auto-saved to database");
          } catch (err) {
            console.error("Error auto-saving job data:", err);
          }
        };
        
        saveDefaultJobData();
      }
    }
  }, [data._id]); // Only run when the product ID changes

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!authToken || !id) return;
      
      try {
        const response = await axios.get(`https://retrend-final.onrender.com/wishlist/check/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setIsInWishlist(response.data.inWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    
    checkWishlistStatus();
  }, [authToken, id]);

  const handlePromoteClick = () => {
    onOpen();
  };

  const handlePromoteConfirm = async () => {
    try {
      devLog("Creating promotion order for product:", id);
      
      // If we're using client-side only integration (no server-side order creation)
      const useClientSideOnly = true; // Set this to true if you only have the key ID
      
      if (useClientSideOnly) {
        // Client-side only integration with just the key ID
        const options = {
          key: RAZORPAY_KEY_ID, // Use key from config
          amount: 3000, // amount in paise (30 INR) - must be in paise (100 paise = 1 INR)
          currency: "INR",
          name: "Retrend",
          description: "Product Promotion Payment for 30 days",
          handler: async function (response) {
            devLog("Payment successful:", response);
            
            try {
              // Update promotion status in the database using config API URL
              const updateResponse = await axios.post(
                getApiUrl("/update-promotion-status"),
                { productId: id },
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );
              
              devLog("Promotion status updated:", updateResponse.data);
              
              // Update local state
              setData({
                ...data,
                isPromoted: true,
                promotionStartDate: new Date(),
                promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              });
              
              toast({
                title: "Promotion Successful",
                description: "Your product will be displayed at the top with a 'Best One' label for 30 days.",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            } catch (error) {
              console.error("Error updating promotion status:", error);
              
              // Even if server update fails, still update UI
              setData({
                ...data,
                isPromoted: true,
                promotionStartDate: new Date(),
                promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              });
              
              toast({
                title: "Promotion Partially Successful",
                description: "Payment was successful but there was an issue updating the server. Your product will still be displayed as promoted.",
                status: "warning",
                duration: 5000,
                isClosable: true,
              });
            }
            
            onClose();
          },
          prefill: {
            name: data?.owner || "User",
            email: localStorage.getItem("userEmail") || ""
          },
          notes: {
            productId: id,
            productTitle: data.title
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: function() {
              devLog("Payment modal dismissed");
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment process.",
                status: "info",
                duration: 3000,
                isClosable: true,
              });
            },
            confirm_close: true, // Ask for confirmation when closing the modal
            escape: true, // Allow closing with ESC key
            animation: true // Enable animations
          },
        };
        
        devLog("Initializing Razorpay with client-side only options");
        
        // Initialize Razorpay
        try {
          await initializeRazorpay(options);
        } catch (error) {
          console.error("Razorpay initialization error:", error);
          toast({
            title: "Payment Failed",
            description: "Could not initialize payment gateway. Please try again later.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
        
        return;
      }
      
      // Server-side integration (requires both key ID and secret)
      // Create Razorpay order
      const orderResponse = await axios.post(
        getApiUrl("/create-promotion-order"),
        { productId: id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      devLog("Order created successfully:", orderResponse.data);
      
      const { orderId, amount, currency, keyId } = orderResponse.data;
      
      // Configure Razorpay options
      const options = {
        key: keyId || RAZORPAY_KEY_ID, // Use key from response or config 
        amount: amount,
        currency: currency,
        name: "Retrend",
        description: "Product Promotion Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            devLog("Payment successful, verifying payment:", response);
            
            // Verify payment with server
            const verifyResponse = await axios.post(
              getApiUrl("/verify-promotion-payment"),
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                productId: id,
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            
            devLog("Payment verified successfully:", verifyResponse.data);
            
            // Update local state
            setData({
              ...data,
              isPromoted: true,
              promotionStartDate: new Date(),
              promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            
            toast({
              title: "Promotion Successful",
              description: "Your product will be displayed at the top with a 'Best One' label for 30 days.",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            
            onClose();
          } catch (error) {
            console.error("Payment verification error:", error);
            
            let errorMessage = "There was an issue verifying your payment. Please contact support.";
            
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
            
            toast({
              title: "Payment Verification Failed",
              description: errorMessage,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        prefill: {
          name: "User",
          email: localStorage.getItem("userEmail") || ""
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function() {
            devLog("Payment modal dismissed");
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      };
      
      devLog("Initializing Razorpay with options");
      
      // Initialize Razorpay
      try {
        await initializeRazorpay(options);
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        toast({
          title: "Payment Failed",
          description: "Could not initialize payment gateway. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      console.error("Promotion error:", error);
      
      // Display more specific error message
      let errorMessage = "There was an issue creating the promotion order. Please try again.";
      
      if (error.response && error.response.data) {
        console.error("Server error response:", error.response.data);
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.data.error) {
          errorMessage += ` (${error.response.data.error})`;
        }
      }
      
      toast({
        title: "Promotion Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add new function to fetch debug data
  const fetchDebugData = async () => {
    try {
      setDebugLoading(true);
      const response = await axios.get(`https://retrend-final.onrender.com/debug/product/${id}`);
      console.log("Debug data:", response.data);
      setDebugData(response.data);
      setDebugError(null);
      
      // If we received valid property data from debug API but not from the normal API,
      // update the main data with debug property data
      if (response.data.rawProduct && 
          response.data.rawProduct.propertyData && 
          (!data.propertyData || typeof data.propertyData === 'undefined')) {
        console.log("Updating data with property data from debug API");
        setData(prev => ({
          ...prev,
          propertyData: response.data.rawProduct.propertyData
        }));
      }

      // If we received valid job data from debug API but not from the normal API,
      // update the main data with debug job data
      if (response.data.rawProduct && 
          response.data.rawProduct.jobData && 
          (!data.jobData || typeof data.jobData === 'undefined')) {
        console.log("Updating data with job data from debug API");
        setData(prev => ({
          ...prev,
          jobData: response.data.rawProduct.jobData
        }));
      }
    } catch (error) {
      console.error("Error fetching debug data:", error);
      setDebugError(error.message);
    } finally {
      setDebugLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (NotFound) {
      return <NotFoundComponent />;
  }

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await axios.delete(`https://retrend-final.onrender.com/myads_delete/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setIsRemoving(false);
      toast({
        title: "Ad Removed",
        description: "The ad has been successfully removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/myads");
    } catch (error) {
      console.error(error);
      setIsRemoving(false);
      toast({
        title: "Error",
        description: "There was an error removing the ad.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClick = async function(){
    if(auth){
      const isMobile = window.innerWidth <= 768; // Check if device is mobile
      if (isMobile) {
        window.location.href = `/mobile-chat/${id}/${data.useremail}`;
      } else {
        window.location.href = `/chat/${id}/${data.useremail}`;
      }
    }
    else{
      toggleShow();
    }
  }
  const address = data.address?.[0] || {};

  const ProductPics = Object.keys(data)
    .filter((key) => key.startsWith("productpic") && data[key])
    .map((key) => data[key]);

  const createdAt = new Date(data.createdAt);
  const now = new Date();
  // Calculate the time difference in milliseconds
  const timeDiff = now.getTime() - createdAt.getTime();
  // Convert milliseconds to days
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  const handleWishlistToggle = async () => {
    if (!authToken) {
      toggleShow(); // Show login modal if not logged in
      return;
    }

    try {
      setIsWishlistLoading(true);
      
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`https://retrend-final.onrender.com/wishlist/remove/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add to wishlist
        await axios.post(
          "https://retrend-final.onrender.com/wishlist/add",
          { productId: id },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setIsInWishlist(true);
        toast({
          title: "Added to Wishlist",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Fix job data function
  const handleFixJobData = async () => {
    try {
      // Get the current auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to fix job data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Log info about the current data
      console.log("Current data:", data);
      console.log("Product ID:", id);

      // Create comprehensive job data - include all fields to ensure nothing is lost
      const jobData = {
        jobRole: data.title || "",
        jobCategory: data.subcatagory || "",
        companyName: data.owner || "",
        positionType: "Full-time",
        salaryPeriod: "Monthly",
        salaryFrom: data.price || "",
        salaryTo: "",
        educationRequired: "Any",
        experienceRequired: "Fresher",
        jobLocation: (data.address && data.address[0]) 
          ? `${data.address[0].city || ""}, ${data.address[0].state || ""}` 
          : "",
        skills: "",
        openings: "1"
      };

      // If we already have job data, preserve any existing values
      if (data.jobData) {
        try {
          // Handle both string and object formats
          let existingJobData = data.jobData;
          if (typeof existingJobData === 'string') {
            try {
              existingJobData = JSON.parse(existingJobData);
            } catch (e) {
              console.error("Failed to parse existing job data:", e);
            }
          }

          if (existingJobData && typeof existingJobData === 'object') {
            // Merge existing data with defaults, preferring existing values
            Object.keys(existingJobData).forEach(key => {
              if (existingJobData[key]) {
                jobData[key] = existingJobData[key];
              }
            });
          }
        } catch (e) {
          console.error("Error preserving existing job data:", e);
        }
      }

      console.log("Complete job data to be sent:", jobData);

      // Update the product with the comprehensive job data
      const updateResponse = await axios.post(
        `https://retrend-final.onrender.com/updateproduct/${id}`,
        {
          jobData: jobData // Send the complete object
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", updateResponse.data);

      // Update local state immediately to avoid waiting for page refresh
      setData(prevData => ({
        ...prevData,
        jobData: jobData
      }));

      toast({
        title: "Job data fixed",
        description: "The job data has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // No need to refresh the page since we updated the state
      // But fetch fresh data to ensure everything is up to date
      fetchData();

    } catch (err) {
      console.error("Error fixing job data:", err);
      toast({
        title: "Error",
        description: "Failed to fix job data: " + (err.response?.data?.message || err.message || "An error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add a new section to display debug data in the UI
  const renderDebugSection = () => {
    if (debugLoading) {
      return <Text>Loading debug data...</Text>;
    }
    
    if (debugError) {
      return <Text color="red.500">Error loading debug data: {debugError}</Text>;
    }
    
    if (!debugData) {
      return <Text>No debug data available</Text>;
    }
    
    // Create diagnostics for job data
    const jobDataType = data.jobData ? typeof data.jobData : 'undefined';
    const jobDataExists = !!data.jobData;
    const jobDataKeys = data.jobData ? Object.keys(data.jobData) : [];
    const jobDataStringified = data.jobData ? JSON.stringify(data.jobData, null, 2) : 'null';
    
    // Get server-side raw product data for comparison
    const serverJobData = debugData.rawProduct && debugData.rawProduct.jobData 
      ? debugData.rawProduct.jobData 
      : null;
    const serverJobDataType = serverJobData ? typeof serverJobData : 'undefined';
    const serverJobDataKeys = serverJobData && typeof serverJobData === 'object'
      ? Object.keys(serverJobData)
      : [];
    const serverJobDataStringified = serverJobData 
      ? JSON.stringify(serverJobData, null, 2) 
      : 'null';
    
    // Determine if there's a mismatch between client and server data
    const hasJobDataMismatch = serverJobData && data.jobData && 
      (serverJobDataType !== jobDataType || 
       serverJobDataStringified !== jobDataStringified);
    
    return (
      <Box border="1px" borderColor="red.200" p={4} borderRadius="md" bg="red.50">
        <Heading size="sm" color="red.500">Detailed Debug Information</Heading>
        <Text fontSize="xs" mt={2}>Database ID: {debugData.diagnostics.databaseId}</Text>
        
        <Divider my={2} />
        
        <Heading size="xs" color="red.500" mt={3}>Property Data</Heading>
        <Text fontSize="xs">Property Data Exists: {debugData.diagnostics.propertyDataExists ? 'Yes' : 'No'}</Text>
        <Text fontSize="xs">Property Data Type: {debugData.diagnostics.propertyDataType}</Text>
        <Text fontSize="xs">Property Data Keys: {debugData.diagnostics.propertyDataKeys.join(', ') || 'None'}</Text>
        
        <Heading size="xs" mt={3} mb={1}>Raw Property Data:</Heading>
        <Box 
          as="pre" 
          fontSize="2xs" 
          p={2} 
          bg="white" 
          borderRadius="sm" 
          maxHeight="200px" 
          overflowY="auto"
          whiteSpace="pre-wrap"
        >
          {debugData.diagnostics.propertyDataStringified || 'null'}
        </Box>
        
        <Divider my={2} />
        
        <Heading size="xs" color="red.500" mt={3}>Client-Side Job Data</Heading>
        <Text fontSize="xs">Job Data Exists: {jobDataExists ? 'Yes' : 'No'}</Text>
        <Text fontSize="xs">Job Data Type: {jobDataType}</Text>
        <Text fontSize="xs">Job Data Keys: {jobDataKeys.join(', ') || 'None'}</Text>
        
        <Heading size="xs" mt={3} mb={1}>Client-Side Raw Job Data:</Heading>
        <Box 
          as="pre" 
          fontSize="2xs" 
          p={2} 
          bg="white" 
          borderRadius="sm" 
          maxHeight="200px" 
          overflowY="auto"
          whiteSpace="pre-wrap"
        >
          {jobDataStringified || 'null'}
        </Box>
        
        <Divider my={2} />
        
        <Heading size="xs" color="red.500" mt={3}>Server-Side Job Data</Heading>
        <Text fontSize="xs">Job Data Exists: {serverJobData ? 'Yes' : 'No'}</Text>
        <Text fontSize="xs">Job Data Type: {serverJobDataType}</Text>
        <Text fontSize="xs">Job Data Keys: {serverJobDataKeys.join(', ') || 'None'}</Text>
        
        <Heading size="xs" mt={3} mb={1}>Server-Side Raw Job Data:</Heading>
        <Box 
          as="pre" 
          fontSize="2xs" 
          p={2} 
          bg="white" 
          borderRadius="sm" 
          maxHeight="200px" 
          overflowY="auto"
          whiteSpace="pre-wrap"
          borderColor={hasJobDataMismatch ? "red.300" : "transparent"}
          borderWidth={hasJobDataMismatch ? "1px" : "0"}
        >
          {serverJobDataStringified || 'null'}
        </Box>
        
        {hasJobDataMismatch && (
          <Text fontSize="xs" color="red.600" mt={2}>
            Data mismatch detected! Server and client job data are different.
          </Text>
        )}
        
        <Flex mt={3} gap={2}>
          <Button 
            size="xs" 
            colorScheme="blue" 
            onClick={() => {
              // Update local state with server data
              if (debugData.rawProduct) {
                setData(prev => ({
                  ...prev,
                  ...debugData.rawProduct
                }));
                toast({
                  title: "Raw data updated",
                  description: "Product data updated from server raw data",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
          >
            Use Server Data
          </Button>
          
          <Button 
            size="xs" 
            colorScheme="purple" 
            onClick={() => {
              // Specifically update job data from server data
              if (debugData.rawProduct && debugData.rawProduct.jobData) {
                setData(prev => ({
                  ...prev,
                  jobData: debugData.rawProduct.jobData
                }));
                toast({
                  title: "Job data updated",
                  description: "Job data updated from server",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
          >
            Fix Job Data Only
          </Button>
          
          <Button 
            size="xs" 
            colorScheme="green" 
            onClick={handleFixJobData}
          >
            Run Fix Job Data
          </Button>
        </Flex>
      </Box>
    );
  };

  // Add this function right before the return statement
  const renderJobDetails = () => {
    if (!data) return null;
    
    console.log("Rendering job details, data.jobData:", data.jobData);
    
    // Check if this is a job listing
    const isJobListing = data.catagory === "Jobs" || 
                         (data.subcatagory && data.subcatagory.toLowerCase().includes("job"));
    
    // Only proceed if this is actually a job listing
    if (!isJobListing) {
      return null;
    }

    if (data.jobData) {
      let jobDataToUse = data.jobData;
      
      // Handle string format if it exists
      if (typeof jobDataToUse === 'string') {
        try {
          jobDataToUse = JSON.parse(jobDataToUse);
          console.log("Successfully parsed job data from string:", jobDataToUse);
        } catch (e) {
          console.error("Failed to parse job data string:", e);
          // If parsing fails, offer to fix the data
          return (
            <Box 
              padding="4" 
              bg="yellow.50" 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="yellow.200"
              mt="4"
            >
              <Text color="yellow.700" mb="2">
                Job details could not be parsed. Please try fixing the data.
              </Text>
              <Button 
                colorScheme="yellow" 
                onClick={handleFixJobData}
                size="sm"
              >
                Fix job data
              </Button>
            </Box>
          );
        }
      }
      
      // Add validation to ensure it's a proper job data object
      if (jobDataToUse && typeof jobDataToUse === 'object' && Object.keys(jobDataToUse).length > 0) {
        console.log("Rendering JobDetailsDisplay with data:", jobDataToUse);
        return <JobDetailsDisplay jobData={jobDataToUse} />;
      } else {
        console.error("Job data exists but is empty or invalid:", jobDataToUse);
        // If job data is empty or invalid, offer to fix it
        return (
          <Box 
            padding="4" 
            bg="yellow.50" 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="yellow.200"
            mt="4"
          >
            <Text color="yellow.700" mb="2">
              Job data appears to be incomplete. Please try fixing it.
            </Text>
            <Button 
              colorScheme="yellow" 
              onClick={handleFixJobData}
              size="sm"
            >
              Refresh job data
            </Button>
          </Box>
        );
      }
    } else {
      // For job listings without job data, show a message and fix button
      return (
        <Box 
          padding="4" 
          bg="yellow.50" 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="yellow.200"
          mt="4"
        >
          <Text color="yellow.700" mb="2">
            This job listing has missing information. Click below to fix it.
          </Text>
          <Button 
            colorScheme="yellow" 
            onClick={handleFixJobData}
            size="sm"
          >
            Fix job data
          </Button>
        </Box>
      );
    }
  };

  return (
    <div>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        className="mt-3 ms-3"
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={`/catagory/${data.catagory}`}>
            {data.catagory}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{data.subcatagory}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <MDBRow className="mt-3 mb-3">
        <MDBCol md="8">
          <Card>
            <CardBody>
              <Carousel>
                {data.productpic1 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic1}
                      alt="First slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
                {data.productpic2 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic2}
                      alt="Second slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
                {data.productpic3 && (
                  <Carousel.Item>
                    <MDBCardImage
                      src={data.productpic3}
                      alt="Third slide"
                      className="d-block w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                )}
              </Carousel>
            </CardBody>
          </Card>
          <Card className="mt-3">
            <CardBody p={0}>
              {/* Price Section - Separate container with distinct styling */}
              <Box 
                p={5} 
                textAlign="center"
                position="relative"
                borderBottom="1px solid" 
                borderColor="gray.200"
              >
                 {data.isPromoted && (
                  <Badge 
                    colorScheme="green" 
                    position="absolute" 
                    top={2} 
                    right={2} 
                    px={2} 
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    BEST ONE
                   </Badge>
                 )}
                <Heading size="sm" textTransform="uppercase" mb={2} textAlign="center">
                  PRICE
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" display="flex" alignItems="center" justifyContent="center">
                  <Box as="span" mr={1}>₹</Box> {data.price}
                 </Text>
               </Box>

               {/* Vehicle Details Section - If it exists */}
               {data.vehicleData && (
                 <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                   <VehicleDetailsDisplay vehicleData={data.vehicleData} />
                 </Box>
               )}
              
               {/* Category Data Section - If it exists */}
               {data.categoryData && Object.keys(data.categoryData).length > 0 && (
                 <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                   <Heading size="xs" textTransform="uppercase" mb={3} textAlign="center">
                     {data.categoryData.type === "book" ? "BOOK DETAILS" : 
                      data.categoryData.type === "electronics" ? "ELECTRONICS DETAILS" :
                      data.categoryData.type === "furniture" ? "FURNITURE DETAILS" :
                      data.categoryData.type === "property" ? "PROPERTY DETAILS" :
                      data.categoryData.type === "mobile" ? "MOBILE DETAILS" :
                      data.categoryData.type === "fashion" ? "FASHION DETAILS" :
                      data.categoryData.type === "job" ? "JOB DETAILS" :
                      data.categoryData.type === "sports_hobbies" ? "SPORTS & HOBBIES DETAILS" :
                      data.categoryData.type === "pet" ? "PET DETAILS" : "DETAILS"}
                   </Heading>
                   <Box pt={2} fontSize="sm">
                     <div className="row">
                       {/* Dynamic display of category-specific fields */}
                       {Object.entries(data.categoryData).map(([key, value]) => {
                         // Skip the type field since we use it for the heading
                         if (key === 'type') return null;
                         
                         // Format the key for display
                         const formattedKey = key.replace(/([A-Z])/g, ' $1')
                           .replace(/^./, str => str.toUpperCase())
                           .replace(/([a-z])([A-Z])/g, '$1 $2');
                         
                         // Format boolean values
                         let displayValue = value;
                         if (typeof value === 'boolean') {
                           displayValue = value ? 'Yes' : 'No';
                         }
                         
                         return (
                           <div className="col-md-6 mb-2" key={key}>
                             <span className="text-muted">{formattedKey}: </span>
                             <span>{displayValue}</span>
                           </div>
                         );
                       })}
                     </div>
                   </Box>
                 </Box>
               )}
              
               {/* Property Data Section - If it exists */}
               {data && data.propertyData && (
                 <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                   <PropertyDetailsDisplay propertyData={data.propertyData} />
                 </Box>
               )}
              
               {/* Mobile Data Section - If it exists */}
               {data && data.categoryData && data.categoryData.type === "mobile" && (
                 <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                   <MobileDetailsDisplay mobileData={data.categoryData} />
                 </Box>
               )}
              
               {/* Job Data Section - If it exists */}
               {renderJobDetails() && (
                 <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                   {renderJobDetails()}
                 </Box>
               )}

               {/* Description Section - Moved to the bottom */}
               <Box p={5}>
                 <Heading size="sm" textTransform="uppercase" mb={3} textAlign="center">
                   DESCRIPTION
                 </Heading>
                 <Text>
                   {data.description}
                 </Text>
               </Box>
             </CardBody>
           </Card>
        </MDBCol>
        <MDBCol md="4">
          <Card>
            <CardHeader>
              <Heading size="md">Seller Information</Heading>
            </CardHeader>
            <CardBody>
              <Flex>
                <Image
                  borderRadius="full"
                  boxSize="50px"
                  src={data.ownerpicture}
                  alt={data.owner}
                  mr="12px"
                />
                <Stack>
                  <Heading size="sm">{data.owner}</Heading>
                  <Text>Member since 2023</Text>
                </Stack>
              </Flex>
            </CardBody>
            <CardFooter>
              {own ? (
                <Flex width="100%" justifyContent="space-between">
                  <Button
                    colorScheme="red"
                    onClick={handleRemove}
                    isLoading={isRemoving}
                  >
                    Remove Ad
                  </Button>
                  {!data.isPromoted && (
                    <Button
                      colorScheme="green"
                      onClick={handlePromoteClick}
                    >
                      Promote Ad
                    </Button>
                  )}
                </Flex>
              ) : (
                <Flex width="100%" justifyContent="space-between">
                  <Button
                    colorScheme="blue"
                    width="60%"
                    onClick={authToken ? handleClick : toggleShow}
                  >
                    Chat with Seller
                  </Button>
                  <ShareProduct productId={id} title={data.title} />
                  <Button
                    variant="solid"
                    size="md"
                    colorScheme={isInWishlist ? "red" : "pink"}
                    onClick={handleWishlistToggle}
                    isLoading={isWishlistLoading}
                    width="15%"
                  >
                    {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </Button>
                </Flex>
              )}
            </CardFooter>
          </Card>
          <Card className="mt-3">
            <CardHeader>
              <Heading size="md">Posted in</Heading>
            </CardHeader>
            <CardBody>
              <Text>
                {data.address && data.address[0] && data.address[0].area},{" "}
                {data.address && data.address[0] && data.address[0].city},{" "}
                {data.address && data.address[0] && data.address[0].state},{" "}
                {data.address && data.address[0] && data.address[0].postcode}
              </Text>
              <MapComponent 
                location={{
                  lat: data.latitude || (data.address && data.address[0] ? data.address[0].latitude : null),
                  lng: data.longitude || (data.address && data.address[0] ? data.address[0].longitude : null)
                }} 
              />
            </CardBody>
          </Card>
        </MDBCol>
      </MDBRow>

      {/* Promotion Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent 
          borderRadius="xl" 
          boxShadow="xl" 
          bg="white" 
          maxW="400px"
          p={2}
        >
          <ModalHeader 
            borderBottom="1px" 
            borderColor="gray.100" 
            pb={3}
            fontSize="xl"
            fontWeight="bold"
            color="blue.600"
          >
            <Flex align="center">
              <Box color="green.500" mr={2}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
              </Box>
              Promote Your Product
            </Flex>
          </ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody py={4}>
            <Box
              bg="gray.50" 
              p={4} 
              borderRadius="md" 
              mb={4}
              borderLeft="4px solid" 
              borderColor="blue.400"
            >
              <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                Promote your product for <Text as="span" fontWeight="bold" color="green.500">₹30</Text> to make it appear at the top of search results with a <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">Best One</Badge> label for 30 days.
              </Text>
            </Box>
            
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="lg"
              borderColor="gray.200"
              transition="all 0.3s"
              _hover={{ boxShadow: "sm", borderColor: "blue.200" }}
              bg="white"
            >
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontWeight="bold" fontSize="md" mb={1} color="gray.800" isTruncated maxW="200px">
                    {data.title}
                  </Text>
                  <Text fontSize="md" color="gray.800" fontWeight="semibold">
                    Price: <Text as="span" color="green.500">₹{data.price}</Text>
                  </Text>
                </Box>
                <Box 
                  w="60px" 
                  h="60px" 
                  bg="gray.100" 
                  borderRadius="md" 
                  overflow="hidden"
                  backgroundImage={`url(${data.productpic1})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                />
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter 
            borderTop="1px" 
            borderColor="gray.100" 
            pt={3}
          >
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handlePromoteConfirm}
              size="md"
              borderRadius="md"
              px={6}
              fontWeight="semibold"
              boxShadow="sm"
              _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6V19H6V21H21V6H19Z" fill="currentColor" />
                  <path d="M3 18H16V3H3V18ZM5 5H14V16H5V5Z" fill="currentColor" />
                </svg>
              }
            >
              Pay ₹30
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              size="md"
              borderRadius="md"
              borderColor="gray.300"
              color="gray.600"
              fontWeight="medium"
              _hover={{ bg: "gray.50" }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {staticModal && <Modallogin toggleShow={toggleShow} />}
    </div>
  );
};

export default PreviewAd;
