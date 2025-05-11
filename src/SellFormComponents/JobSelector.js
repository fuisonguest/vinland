import React, { useState, useEffect } from "react";
import {
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  Divider,
  SimpleGrid,
  Box,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  ButtonGroup,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Text,
  Flex,
  useToast
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export default function JobSelector({ onJobSelect }) {
  const { category, item } = useParams();
  const toast = useToast();
  
  // Salary details
  const [salaryPeriod, setSalaryPeriod] = useState("Monthly");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  
  // Position type
  const [positionType, setPositionType] = useState("Full-time");
  
  // Education
  const [educationRequired, setEducationRequired] = useState("Any");
  
  // Experience
  const [experienceRequired, setExperienceRequired] = useState("Fresher");
  
  // Job location
  const [jobLocation, setJobLocation] = useState("");
  
  // Company name
  const [companyName, setCompanyName] = useState("");
  
  // Job role/title
  const [jobRole, setJobRole] = useState("");
  
  // Skills required
  const [skills, setSkills] = useState("");
  
  // Number of openings
  const [openings, setOpenings] = useState("1");
  
  // Job category - specific type of job based on the selection
  const [jobCategory, setJobCategory] = useState("");

  // Submit job data to parent component immediately when values change
  const submitJobData = () => {
    // Create job data object
    const jobData = {
      jobRole: jobRole.trim(),
      jobCategory: jobCategory.trim(),
      companyName: companyName.trim(),
      positionType,
      salaryPeriod,
      salaryFrom,
      salaryTo,
      educationRequired,
      experienceRequired,
      jobLocation: jobLocation.trim(),
      skills: skills.trim(),
      openings
    };
    
    console.log("JobSelector sending data:", jobData);
    onJobSelect(jobData);
    
    toast({
      title: "Job data updated",
      description: "Your job details have been updated",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  // Set job data for parent whenever a value changes
  useEffect(() => {
    const jobData = {
      jobRole,
      jobCategory,
      companyName,
      positionType,
      salaryPeriod,
      salaryFrom,
      salaryTo,
      educationRequired,
      experienceRequired,
      jobLocation,
      skills,
      openings
    };
    
    // Pass to parent
    onJobSelect(jobData);
  }, [
    salaryPeriod, salaryFrom, salaryTo, positionType, educationRequired,
    experienceRequired, jobLocation, companyName, jobRole, skills, openings,
    jobCategory, onJobSelect
  ]);

  // Handle job category selection based on item param
  useEffect(() => {
    if (item) {
      setJobCategory(item);
    }
  }, [item]);

  // Available job categories
  const jobCategories = [
    "Data entry & Back office",
    "Sales & Marketing",
    "BPO & Telecaller",
    "Driver",
    "Office Assistant",
    "Delivery & Collection",
    "Teacher",
    "Cook",
    "Receptionist & Front office",
    "Operator & Technician",
    "IT Engineer & Developer",
    "Hotel & Travel Executive",
    "Accountant",
    "Designer",
    "Other Jobs"
  ];

  // Available education options
  const educationOptions = [
    "Any",
    "10th Pass",
    "12th Pass",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Professional Certification"
  ];

  // Available experience options
  const experienceOptions = [
    "Fresher",
    "0-1 Years",
    "1-3 Years",
    "3-5 Years",
    "5-10 Years",
    "10+ Years"
  ];

  return (
    <div className="mt-3 mb-3">
      <MDBCard>
        <MDBCardBody>
          <FormControl mb={4} isRequired>
            <FormLabel fontWeight="bold">Job Category *</FormLabel>
            <Select 
              value={jobCategory} 
              onChange={(e) => setJobCategory(e.target.value)}
              placeholder="Select Job Category"
              isRequired
            >
              {jobCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel fontWeight="bold">Job Role/Title *</FormLabel>
            <Input 
              value={jobRole} 
              onChange={(e) => setJobRole(e.target.value)} 
              placeholder="e.g. Data Entry Operator, Sales Executive"
              isRequired
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontWeight="bold">Company Name</FormLabel>
            <Input 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              placeholder="Enter company name"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontWeight="bold">Position Type</FormLabel>
            <Select 
              value={positionType} 
              onChange={(e) => setPositionType(e.target.value)}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel fontWeight="bold">Job Location *</FormLabel>
            <Input 
              value={jobLocation} 
              onChange={(e) => setJobLocation(e.target.value)} 
              placeholder="e.g. Mumbai, Delhi"
              isRequired
            />
          </FormControl>

          <Stack mb={4}>
            <FormLabel fontWeight="bold">Salary Details</FormLabel>
            <Flex direction={["column", "row"]} gap={3}>
              <FormControl>
                <FormLabel fontSize="sm">Salary Period</FormLabel>
                <Select 
                  value={salaryPeriod} 
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Weekly">Weekly</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">From (₹)</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="₹" />
                  <Input 
                    type="number" 
                    value={salaryFrom} 
                    onChange={(e) => setSalaryFrom(e.target.value)}
                    placeholder="Min salary"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">To (₹)</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="₹" />
                  <Input 
                    type="number" 
                    value={salaryTo} 
                    onChange={(e) => setSalaryTo(e.target.value)}
                    placeholder="Max salary"
                  />
                </InputGroup>
              </FormControl>
            </Flex>
          </Stack>

          <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
            <FormControl>
              <FormLabel fontWeight="bold">Education Required</FormLabel>
              <Select 
                value={educationRequired} 
                onChange={(e) => setEducationRequired(e.target.value)}
              >
                {educationOptions.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">Experience Required</FormLabel>
              <Select 
                value={experienceRequired} 
                onChange={(e) => setExperienceRequired(e.target.value)}
              >
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl mb={4}>
            <FormLabel fontWeight="bold">Skills Required</FormLabel>
            <Input 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              placeholder="e.g. Excel, Communication, Programming"
            />
            <Text fontSize="xs" color="gray.600" mt={1}>
              Separate skills with commas (e.g. Excel, Communication, Programming)
            </Text>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontWeight="bold">Number of Openings</FormLabel>
            <NumberInput min={1} value={openings} onChange={(valueString) => setOpenings(valueString)}>
              <NumberInputField placeholder="E.g. 1, 2, 5..." />
            </NumberInput>
          </FormControl>
          
          <Box mt={4}>
            <Button colorScheme="blue" onClick={submitJobData}>
              Update Job Details
            </Button>
          </Box>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
} 