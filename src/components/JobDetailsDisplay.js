import React from 'react';
import { Box, Heading, Table, Tbody, Tr, Td, Text, Badge, Flex } from '@chakra-ui/react';

// Simplified JobDetailsDisplay that directly displays the job data as received
const JobDetailsDisplay = ({ jobData }) => {
  console.log("JobDetailsDisplay received data:", jobData);
  
  // Try to handle string format, just in case
  let normalizedData = jobData;
  if (typeof normalizedData === 'string') {
    try {
      normalizedData = JSON.parse(normalizedData);
      console.log("Parsed job data from string:", normalizedData);
    } catch (error) {
      console.error("Failed to parse job data string:", error);
      return (
        <Box padding="4" bg="yellow.50" borderRadius="md" borderWidth="1px" borderColor="yellow.200" mt="4">
          <Text color="yellow.700">Error parsing job data. Please try again.</Text>
        </Box>
      );
    }
  }
  
  // If no data, create a minimal default structure to avoid display issues
  if (!normalizedData || typeof normalizedData !== 'object' || Object.keys(normalizedData).length === 0) {
    normalizedData = {
      jobRole: "Not specified",
      jobCategory: "Not specified",
      companyName: "Not specified",
      positionType: "Full-time",
      salaryPeriod: "Monthly",
      salaryFrom: "",
      salaryTo: "",
      educationRequired: "Any",
      experienceRequired: "Fresher",
      jobLocation: "Not specified",
      skills: "",
      openings: "1"
    };
  } else {
    // Ensure all required fields exist in normalized data
    normalizedData = {
      jobRole: normalizedData.jobRole || "Not specified",
      jobCategory: normalizedData.jobCategory || "Not specified",
      companyName: normalizedData.companyName || "Not specified",
      positionType: normalizedData.positionType || "Full-time",
      salaryPeriod: normalizedData.salaryPeriod || "Monthly",
      salaryFrom: normalizedData.salaryFrom || "",
      salaryTo: normalizedData.salaryTo || "",
      educationRequired: normalizedData.educationRequired || "Any",
      experienceRequired: normalizedData.experienceRequired || "Fresher",
      jobLocation: normalizedData.jobLocation || "Not specified",
      skills: normalizedData.skills || "",
      openings: normalizedData.openings || "1"
    };
  }

  // Format salary display
  const formatSalary = () => {
    if (!normalizedData.salaryFrom && !normalizedData.salaryTo) return "Not specified";
    
    if (normalizedData.salaryFrom && normalizedData.salaryTo) {
      return `₹${normalizedData.salaryFrom} - ₹${normalizedData.salaryTo} per ${normalizedData.salaryPeriod?.toLowerCase() || 'month'}`;
    }
    
    if (normalizedData.salaryFrom) {
      return `₹${normalizedData.salaryFrom}+ per ${normalizedData.salaryPeriod?.toLowerCase() || 'month'}`;
    }
    
    if (normalizedData.salaryTo) {
      return `Up to ₹${normalizedData.salaryTo} per ${normalizedData.salaryPeriod?.toLowerCase() || 'month'}`;
    }
    
    return "Not specified";
  };

  // Job detail fields to display
  const jobFields = [
    { key: 'jobRole', label: 'Job Role' },
    { key: 'jobCategory', label: 'Job Category' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'positionType', label: 'Position Type' },
    { key: 'salary', label: 'Salary', valueFunc: formatSalary },
    { key: 'jobLocation', label: 'Location' },
    { key: 'educationRequired', label: 'Education Required' },
    { key: 'experienceRequired', label: 'Experience Required' },
    { key: 'openings', label: 'Number of Openings' },
  ];

  return (
    <Box mb={6}>
      <Heading size="xs" textTransform="uppercase" mb={3}>
        JOB DETAILS
      </Heading>

      <Table variant="simple" size="sm">
        <Tbody>
          {jobFields.map(field => {
            // Get the display value
            const displayValue = field.valueFunc 
              ? field.valueFunc() 
              : normalizedData[field.key] || "Not specified";
            
            return (
              <Tr key={field.key}>
                <Td fontWeight="medium" color="gray.600" width="40%">{field.label}</Td>
                <Td>{displayValue}</Td>
              </Tr>
            );
          })}
          
          {/* Skills row */}
          {normalizedData.skills && (
            <Tr>
              <Td fontWeight="medium" color="gray.600" width="40%">Skills Required</Td>
              <Td>
                {normalizedData.skills.split(',').length > 0 
                  ? normalizedData.skills.split(',').map(skill => skill.trim()).join(', ') 
                  : "No specific skills required"}
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default JobDetailsDisplay; 