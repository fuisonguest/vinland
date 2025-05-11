import {
  Card,
  Flex,
  Image,
  Text,
  Badge,
  Box,
  Icon,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from "axios";
import { API_BASE_URL } from "../utils/config";

export default function ProductCard({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const address = product.address?.[0] || {};
  const createdAt = new Date(product.createdAt);
  const now = new Date();
  // Calculate the time difference in milliseconds
  const timeDiff = now.getTime() - createdAt.getTime();
  // Convert milliseconds to days
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Helper function to check if the product belongs to a specific category
  const isCategory = (categoryName) => {
    return product.catagory && product.catagory.toLowerCase() === categoryName.toLowerCase();
  };
  
  // Helper function to check if subcategory contains a term
  const hasSubcategory = (term) => {
    return product.subcatagory && product.subcatagory.toLowerCase().includes(term.toLowerCase());
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
  const kmDriven = product.vehicleData?.kmDriven;
  const year = product.vehicleData?.year;
  
  // Extract BHK from property data
  const bhk = product.propertyData?.bhk;
  
  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "Price unavailable";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format vehicle details string for display
  const getVehicleDetailsString = () => {
    let details = [];
    if (year) details.push(year);
    if (kmDriven) details.push(`${kmDriven} km`);
    return details.join(' - ');
  };
  
  // Toggle wishlist function
  const toggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the heart
    e.stopPropagation(); // Stop event from bubbling up
    
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to your wishlist",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (isInWishlist) {
        // Remove from wishlist - use the same endpoint as in PreviewAd.js
        await axios.delete(`https://retrend-final.onrender.com/wishlist/remove/${product._id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Add to wishlist - use the same endpoint as in PreviewAd.js
        await axios.post(
          "https://retrend-final.onrender.com/wishlist/add",
          { productId: product._id },
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
          duration: 2000,
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
      setLoading(false);
    }
  };
  
  // Check if the product is in the user's wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;
        
        // Get all wishlist items and check if this product is in it
        const response = await axios.get("https://retrend-final.onrender.com/wishlist", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Check if this product is in the wishlist
          const found = response.data.some(item => 
            item.productId && item.productId._id === product._id
          );
          setIsInWishlist(found);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    
    if (product && product._id) {
      checkWishlistStatus();
    }
  }, [product._id]);
  
  return (
    <Card 
      w="100%"
      h="100%"
      borderRadius="md"
      overflow="hidden"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      position="relative"
    >
      {/* Image section with heart icon */}
      <Box position="relative">
        <Image
          src={product.productpic1}
          alt={product.title || "Product image"}
          height="160px"
          width="100%"
          objectFit="cover"
        />
        
        <IconButton
          icon={isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          isRound
          size="sm"
          position="absolute"
          top="8px"
          right="8px"
          bg="white"
          color={isInWishlist ? "red.500" : "gray.600"}
          _hover={{ color: "red.500" }}
          aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
          onClick={toggleWishlist}
          isLoading={loading}
        />
        
        {/* BEST ONE tag */}
        {product.isPromoted && (
          <Badge 
            position="absolute"
            top="0"
            left="0"
            bg="rgb(204, 255, 204)"
            color="green.800"
            py={1}
            px={2}
            fontWeight="bold"
            fontSize="xs"
          >
            BEST ONE
          </Badge>
        )}
      </Box>
      
      {/* Content section */}
      <Box p={3}>
        {/* Price */}
        <Flex align="center">
          <CurrencyRupeeTwoToneIcon fontSize="medium" />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            {formatPrice(product.price)}
          </Text>
        </Flex>
        
        {/* Vehicle year - km (only for vehicles) */}
        {isVehicle && (
          <Text mt={1} fontSize="sm" color="gray.700" fontWeight="medium">
            {getVehicleDetailsString()}
          </Text>
        )}
        
        {/* Title */}
        <Text mt={1} fontSize="md" fontWeight="medium" color="gray.800" noOfLines={1}>
          {product.title}
        </Text>
        
        {/* Description */}
        {product.description && (
          <Text mt={0.5} fontSize="sm" color="gray.600" noOfLines={1}>
            {product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}
          </Text>
        )}
        
        {/* Location and date */}
        <Flex mt={2} justify="space-between" align="center">
          <Text 
            color="gray.500" 
            fontSize="xs" 
            fontWeight="medium"
            textTransform="uppercase"
          >
            {address.area || ''}{address.area && address.city ? ', ' : ''}{address.city || ''}
          </Text>
          
          <Text 
            color="gray.500" 
            fontSize="xs" 
            fontWeight="medium"
            textTransform="uppercase"
          >
            {daysAgo === 0 ? 'TODAY' : daysAgo === 1 ? 'YESTERDAY' : `${daysAgo} DAYS AGO`}
          </Text>
        </Flex>
      </Box>
    </Card>
  );
}
