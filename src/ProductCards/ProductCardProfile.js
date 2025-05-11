import { Box, Card, Heading, Image, Stack, Text, Badge, Flex } from '@chakra-ui/react'
import React from 'react'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';

export default function ProductCardProfile({ad}) {
  // Return early if ad is null or undefined
  if (!ad) {
    return null; // Or a placeholder card that doesn't depend on ad properties
  }
  
  // Helper function to check if the product belongs to a specific category
  const isCategory = (categoryName) => {
    return ad.catagory && ad.catagory.toLowerCase() === categoryName.toLowerCase();
  };
  
  // Helper function to check if subcategory contains a term
  const hasSubcategory = (term) => {
    return ad.subcatagory && ad.subcatagory.toLowerCase().includes(term.toLowerCase());
  };
  
  // Determine if this is a car/bike product
  const isVehicle = isCategory('cars') || isCategory('bikes') || 
                   hasSubcategory('car') || hasSubcategory('bike') || 
                   hasSubcategory('motorcycle');
  
  // Determine if this is a property
  const isProperty = isCategory('properties') || hasSubcategory('house') || 
                    hasSubcategory('apartment') || hasSubcategory('flat') || 
                    hasSubcategory('property');
  
  // Extract KM driven from vehicle data
  const kmDriven = ad.vehicleData?.kmDriven;
  
  // Extract BHK from property data
  const bhk = ad.propertyData?.bhk;
  
  return (
    <Card key={ad._id} variant={"filled"} maxW="xl">
      <a href={`/preview_ad/${ad._id}`}>
        <Stack className="mt-2" direction="row" spacing={4}>
          <Box position="relative">
            <Image
              src={ad.productpic1}
              alt={ad.title}
              w="100px"
              h="100px"
              objectFit="cover"
              borderRadius="md"
            />
            
            {/* Vehicle details overlay */}
            {isVehicle && kmDriven && (
              <Badge 
                position="absolute" 
                bottom="4px" 
                left="4px" 
                className="product-detail-badge"
                fontSize="xs" 
                display="flex" 
                alignItems="center"
              >
                <DirectionsCarIcon fontSize="small" />
                {kmDriven} km
              </Badge>
            )}
            
            {/* Property details overlay */}
            {isProperty && bhk && (
              <Badge 
                position="absolute" 
                bottom="4px" 
                left="4px" 
                className="product-detail-badge"
                fontSize="xs" 
                display="flex" 
                alignItems="center"
              >
                <HomeIcon fontSize="small" />
                {bhk} BHK
              </Badge>
            )}
          </Box>
          <Stack spacing={2} flex={1}>
            <Heading size="md">{ad.title}</Heading>
            <Text fontSize="sm">{ad.description}</Text>
            <Box textAlign="center">
              <Text color="blue.600" fontSize="2xl">
                &#x20b9;{ad.price}
              </Text>
            </Box>
          </Stack>
        </Stack>
      </a>
    </Card>
  )
}
