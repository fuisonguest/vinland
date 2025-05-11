import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  Input, 
  FormControl, 
  FormLabel, 
  useToast, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription 
} from '@chakra-ui/react';
import axios from 'axios';

const FixJobData = ({ productId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Fix job data that wasn't properly saved
  const handleFixJobData = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get the current auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError("You must be logged in to fix job data");
        setIsLoading(false);
        return;
      }

      // First, fetch the current product data
      const response = await axios.post(
        `https://retrend-final.onrender.com/previewad/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const productData = response.data.product;
      console.log("Current product data:", productData);

      // Create job data if it doesn't exist or is in incorrect format
      const jobData = {
        jobRole: productData.title || "Job Title", // Use product title as a default
        jobCategory: productData.subcatagory || "Data entry & Back office",
        companyName: productData.owner || "",
        positionType: "Full-time",
        salaryPeriod: "Monthly",
        salaryFrom: productData.price || "",
        salaryTo: "",
        educationRequired: "Any",
        experienceRequired: "Fresher",
        jobLocation: (productData.address && productData.address[0]) 
          ? `${productData.address[0].city || ""}, ${productData.address[0].state || ""}` 
          : "",
        skills: "",
        openings: "1"
      };

      console.log("Job data to update:", jobData);

      // Directly update the product with the job data using the existing endpoint
      const updateResponse = await axios.post(
        `https://retrend-final.onrender.com/updateproduct/${productId}`,
        {
          jobData: jobData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", updateResponse.data);

      setResult({ message: "Job data updated successfully" });
      toast({
        title: "Job data fixed",
        description: "The job data has been updated successfully. Please refresh the page.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Error fixing job data:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fix job data. See details below.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Text fontSize="lg" fontWeight="bold" mb={3}>Fix Job Data</Text>
      <Text fontSize="sm" mb={4}>
        If the job data is not displaying correctly, you can try to fix it by clicking the button below.
        This will create default job data using existing information.
      </Text>
      
      <Button
        colorScheme="blue"
        onClick={handleFixJobData}
        isLoading={isLoading}
        loadingText="Fixing..."
        width="full"
      >
        Fix Job Data
      </Button>
      
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <Alert status="success" mt={4}>
          <AlertIcon />
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </Box>
  );
};

export default FixJobData; 
