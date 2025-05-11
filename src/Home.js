import React, { useEffect, useState } from "react";
import {Box, Button, Container, Grid, GridItem, Text, Flex} from "@chakra-ui/react";
import CatNavbar from "./CatNavbar";
import ProductCard from "./ProductCards/ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "./resources/Loading";
import { API_BASE_URL } from "./utils/config"; // Import the API base URL

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleproducts, setVisibleProducts] = useState(6);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Calculate if there are more products to load
  const hasMoreProductsToLoad = products.length > visibleproducts;

  const getProducts = async () => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      const locationData = savedLocation ? JSON.parse(savedLocation) : null;
      setCurrentLocation(locationData?.name);

      const response = await axios.get(`${API_BASE_URL}/getProducts`);
      
      // Filter and sort products based on location hierarchy
      let filteredProducts = response.data;
      if (locationData?.address) {
        // Sort products by location relevance
        filteredProducts.sort((a, b) => {
          const aAddress = a.address?.[0] || {};
          const bAddress = b.address?.[0] || {};
          const userAddress = locationData.address;

          // Calculate relevance score (higher = more relevant)
          const getRelevanceScore = (address) => {
            let score = 0;
            // Exact area match (highest priority)
            if (address.area?.toLowerCase() === userAddress.area?.toLowerCase()) score += 4;
            // City match (high priority)
            if (address.city?.toLowerCase() === userAddress.city?.toLowerCase()) score += 2;
            // State match (lower priority)
            if (address.state?.toLowerCase() === userAddress.state?.toLowerCase()) score += 1;
            return score;
          };

          const scoreA = getRelevanceScore(aAddress);
          const scoreB = getRelevanceScore(bAddress);

          // Sort by relevance score (higher first)
          if (scoreB !== scoreA) return scoreB - scoreA;
          
          // If same relevance, sort by date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Filter out products from other states
        filteredProducts = filteredProducts.filter(product => {
          const productAddress = product.address?.[0];
          return productAddress?.state?.toLowerCase() === locationData.address.state?.toLowerCase();
        });
      }

      // Apply promotion sorting within the location-based results
      const sortedProducts = filteredProducts.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return 0;
      });
      
      setProducts(sortedProducts);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      getProducts();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  useEffect(() => {
    getProducts();
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Count promoted products for display
  const promotedCount = products.filter(product => product.isPromoted).length;

  // Function to load more products
  const loadMoreProducts = () => {
    setVisibleProducts(prevCount => {
      const newCount = prevCount + 10;
      // Ensure we don't exceed the total number of products
      return Math.min(newCount, products.length);
    });
    
    // Scroll to show new content with a slight delay to allow rendering
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight - 800,
        behavior: 'smooth',
      });
    }, 100);
  };

  return (
    <Box>
      <CatNavbar />
      <Container maxW="container.xl" pb={8}>
        {promotedCount > 0 && (
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            mb={4} 
            mt={4} 
            color="green.600"
          >
            Featured Products ({promotedCount})
          </Text>
        )}
        
        <Box position="relative" minH="500px">
          <Grid 
            templateColumns={{ 
              base: "repeat(auto-fill, minmax(200px, 1fr))", 
              sm: "repeat(auto-fill, minmax(200px, 1fr))",
              md: "repeat(auto-fill, minmax(200px, 1fr))", 
              lg: "repeat(auto-fill, minmax(200px, 1fr))", 
              xl: "repeat(auto-fill, minmax(200px, 1fr))" 
            }} 
            gap={3}
            autoFlow="row dense"
            justifyItems="stretch"
            maxW="container.xl"
            mb={6}
          >
            {products.slice(0, visibleproducts).map((product) => (
              <GridItem 
                key={product._id} 
                w="100%"
              >
                <Link to={`/preview_ad/${product._id}`} style={{ display: 'block', height: '100%' }}>
                  <ProductCard product={product} />
                </Link>
              </GridItem>
            ))}
          </Grid>
          
          {/* Only show Load More button when there are more products to load */}
          {hasMoreProductsToLoad && (
            <Flex justifyContent="center" w="100%" mt={6} mb={4} position="relative">
              <Button
                bgGradient="linear(to-r, teal.400, cyan.600)"
                color="white"
                px={8}
                py={6}
                fontSize="md"
                _hover={{
                  bgGradient: "linear(to-r, teal.600, cyan.800)",
                }}
                _active={{
                  bgGradient: "linear(to-r, teal.800, cyan.900)",
                }}
                onClick={loadMoreProducts}
              >
                Load More
              </Button>
            </Flex>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
