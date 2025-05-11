import React from 'react';
import { Box, Heading, Table, Tbody, Tr, Td } from '@chakra-ui/react';

const MobileDetailsDisplay = ({ mobileData }) => {
  // If no mobile data, return null
  if (!mobileData) return null;
  
  // If no valid data after normalization, don't render
  if (Object.keys(mobileData).length === 0) return null;

  // Format the mobile data
  const mobileFields = [
    { key: 'brand', label: 'Brand' },
    { key: 'condition', label: 'Condition' }
  ];

  return (
    <Box mb={6}>
      <Heading size="xs" textTransform="uppercase" mb={3}>
        MOBILE DETAILS
      </Heading>
      
      <Table variant="simple" size="sm">
        <Tbody>
          {mobileFields.map(field => {
            // Only render if the data has this field
            if (!mobileData[field.key]) return null;
            
            return (
              <Tr key={field.key}>
                <Td fontWeight="medium" color="gray.600" width="40%">{field.label}</Td>
                <Td>{mobileData[field.key]}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default MobileDetailsDisplay; 