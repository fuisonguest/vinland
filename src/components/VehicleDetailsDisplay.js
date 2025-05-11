import React from 'react';
import { Box, Heading, Text, Divider, SimpleGrid, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const VehicleDetailsDisplay = ({ vehicleData }) => {
  // If no vehicle data, return null
  if (!vehicleData) return null;
  
  // If empty object, return null
  if (Object.keys(vehicleData).length === 0) return null;

  // Vehicle fields to display with their icons
  const vehicleFields = [
    { key: 'vehicleType', label: 'Type', icon: <DirectionsCarIcon /> },
    { key: 'brand', label: 'Brand', icon: <DirectionsCarIcon /> },
    { key: 'model', label: 'Model', icon: <DirectionsCarIcon /> },
    { key: 'fuelType', label: 'Fuel Type', icon: <LocalGasStationIcon /> },
    { key: 'transmission', label: 'Transmission', icon: <SettingsIcon /> },
    { key: 'year', label: 'Year', icon: <EventIcon /> },
    { key: 'month', label: 'Month', icon: <EventIcon /> },
    { key: 'ownership', label: 'Ownership', icon: <PersonIcon />, formatter: value => `${value} owner` },
    { key: 'kmDriven', label: 'KM Driven', icon: <SpeedIcon /> },
    { key: 'color', label: 'Color', icon: <ColorLensIcon /> },
    { key: 'registrationPlace', label: 'Registration', icon: <LocationOnIcon /> },
    { key: 'insurance', label: 'Insurance', icon: <SecurityIcon /> }
  ];

  // Format features
  const formatFeatures = (features) => {
    if (!features) return [];
    return Object.entries(features).map(([key, value]) => {
      let label = key.replace(/([A-Z])/g, ' $1').trim(); // Convert camelCase to Title Case
      label = label.charAt(0).toUpperCase() + label.slice(1); // Capitalize first letter
      
      if (key === 'airbags') {
        return { 
          label, 
          value: `${value} airbags`,
          icon: <CheckCircleIcon color="green" />
        };
      }
      
      return { 
        label, 
        value: value ? 'Yes' : 'No',
        icon: value ? <CheckCircleIcon color="green" /> : <CancelIcon color="red" />
      };
    });
  };

  const features = vehicleData.features ? formatFeatures(vehicleData.features) : [];

  return (
    <Box mb={6}>
      <Heading size="xs" textTransform="uppercase" mb={3}>
        VEHICLE DETAILS
      </Heading>

      <Table variant="simple" size="sm">
        <Tbody>
          {vehicleFields.map(field => {
            // Only render if the data has this field
            if (!vehicleData[field.key]) return null;
            
            // Format the value
            let displayValue = vehicleData[field.key];
            
            // Use formatter if provided
            if (field.formatter) {
              displayValue = field.formatter(displayValue);
            }
            
            // Capitalize first letter of fuel type
            if (field.key === 'fuelType' && typeof displayValue === 'string') {
              displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
            }
            
            // Format vehicle type
            if (field.key === 'vehicleType' && typeof displayValue === 'string') {
              displayValue = displayValue === 'car' ? 'Car' : 'Bike';
            }
            
            return (
              <Tr key={field.key}>
                <Td fontWeight="medium" color="gray.600" width="40%">{field.label}</Td>
                <Td>{displayValue}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      
      {/* Features section, only if present */}
      {features.length > 0 && (
        <Box mt={4}>
          <Heading size="xs" textTransform="uppercase" mb={3}>
            ADDITIONAL VEHICLE INFORMATION
          </Heading>
          <Table variant="simple" size="sm">
            <Tbody>
              {features.map((feature) => (
                <Tr key={feature.label}>
                  <Td fontWeight="medium" color="gray.600" width="40%">{feature.label}</Td>
                  <Td>
                    {feature.value}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default VehicleDetailsDisplay; 