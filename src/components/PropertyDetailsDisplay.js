import React from 'react';
import { Box, Heading, Table, Tbody, Tr, Td, Text } from '@chakra-ui/react';
import { normalizePropertyData, getPropertyTypeLabel, getFormattedAmenities } from '../utils/PropertyDataUtils';

const PropertyDetailsDisplay = ({ propertyData }) => {
  // If no property data, return null
  if (!propertyData) return null;

  // Parse and normalize the property data
  const data = normalizePropertyData(propertyData);
  
  // If no valid data after normalization, don't render
  if (Object.keys(data).length === 0) return null;

  // Property fields to display and their labels
  const propertyFields = [
    { key: 'propertyType', label: 'Property Type', formatter: getPropertyTypeLabel },
    { key: 'bhk', label: 'BHK' },
    { key: 'bedrooms', label: 'Bedrooms' },
    { key: 'bathrooms', label: 'Bathrooms' },
    { key: 'furnishing', label: 'Furnishing' },
    { key: 'projectStatus', label: 'Project Status' },
    { key: 'construction_status', label: 'Construction Status' },
    { key: 'listedBy', label: 'Listed By' },
    { key: 'superBuiltupArea', label: 'Super Builtup Area', unit: 'sq.ft' },
    { key: 'carpetArea', label: 'Carpet Area', unit: 'sq.ft' },
    { key: 'maintenance', label: 'Maintenance', prefix: '₹', suffix: '/month' },
    { key: 'totalFloors', label: 'Total Floors' },
    { key: 'floorNo', label: 'Floor Number' },
    { key: 'carParking', label: 'Car Parking' },
    { key: 'facing', label: 'Facing' },
    { key: 'projectName', label: 'Project Name' },
    { key: 'age', label: 'Age' },
    { key: 'balconies', label: 'Balconies' },
    { key: 'description', label: 'Description' }
  ];

  // Get formatted amenities
  const amenitiesList = data.amenities ? getFormattedAmenities(data.amenities) : [];

  return (
    <Box mb={6}>
      <Heading size="xs" textTransform="uppercase" mb={3}>
        PROPERTY DETAILS
      </Heading>

      <Table variant="simple" size="sm">
        <Tbody>
          {propertyFields.map(field => {
            // Only render if the data has this field
            if (!data[field.key]) return null;
            
            // Format the value
            let displayValue = data[field.key];
            
            // Use formatter if provided
            if (field.formatter) {
              displayValue = field.formatter(displayValue);
            }
            
            // Add units or prefixes if needed
            if (field.unit) {
              displayValue = `${displayValue} ${field.unit}`;
            }
            
            if (field.prefix) {
              displayValue = `${field.prefix}${displayValue}`;
            }
            
            if (field.suffix) {
              displayValue = `${displayValue}${field.suffix}`;
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
      
      {/* Amenities section, only if present */}
      {amenitiesList.length > 0 && (
        <Box mt={4}>
          <Heading size="xs" textTransform="uppercase" mb={3}>
            AMENITIES
          </Heading>
          <Text>{amenitiesList.join(', ')}</Text>
        </Box>
      )}
    </Box>
  );
};

export default PropertyDetailsDisplay; 