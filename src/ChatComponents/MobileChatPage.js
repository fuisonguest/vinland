import React, { useEffect, useState } from "react";
import "../mychat.css";
import {
  MDBTypography,
} from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  DeleteIcon,
  HamburgerIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import FetchChat from "./FetchChat";
import SendChat from "./SendChat";
import Loading from "../resources/Loading";

export default function MobileChatPage() {
  const { id, useremail } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const authToken = localStorage.getItem("authToken");
  const authemail = localStorage.getItem("authemail");

  const [product, setProduct] = useState({});
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && useremail) {
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
          setProduct(response.data.product);
          setIsLoading(false);
        } catch (error) {
          navigate("/chat");
          toast({
            title: "Error loading chat",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };
      fetchData();
      
      if (useremail === authemail) {
        navigate("/chat");
      } else {
        try {
          axios
            .get(`https://retrend-final.onrender.com/profilesearch?useremail=${useremail}`)
            .then((response) => {
              setProfileData(response.data);
              setIsLoading(false);
            })
            .catch((error) => {
              setIsLoading(false);
              navigate("/chat");
            });
        } catch {
          navigate("/chat");
        }
      }
    } else {
      setIsLoading(false);
      navigate("/chat");
    }
  }, [id, useremail, authToken, navigate, toast]);

  const handleDelete = () => {
    setIsLoading(true);
    axios
      .post(
        `https://retrend-final.onrender.com/deletechat/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        navigate("/chat");
        toast({
          title: "Chat Deleted",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: "No Chats Found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box className="mobile-chat-page">
      <Card className="mobile-chat-header">
        <CardBody style={{ display: "flex", alignItems: "center", padding: "10px" }}>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/chat")}
            className="back-button"
          >
            <ArrowBackIcon />
          </Button>
          
          <Box 
            className="user-info"
            onClick={() => navigate(`/profile/${useremail}`)}
            style={{ display: "flex", alignItems: "center", cursor: "pointer", marginLeft: "5px" }}
          >
            <Avatar
              src={profileData.picture}
              alt={profileData.name}
              size="sm"
              className="mx-2"
            />
            <Heading size="md" className="user-name">{profileData.name}</Heading>
          </Box>
          
          <Box style={{ marginLeft: "auto" }}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="ghost"
              />
              <MenuList>
                <MenuItem
                  icon={<DeleteIcon color="red.500" />}
                  onClick={handleDelete}
                >
                  Delete Chat
                </MenuItem>
                <MenuItem
                  onClick={() => navigate(`/preview_ad/${id}`)}
                  icon={<ViewIcon color="green.500" />}
                >
                  See Product
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </CardBody>
      </Card>
      
      <Card className="product-info-card">
        <CardBody style={{ padding: "10px" }}>
          <Flex alignItems="center">
            <Image
              boxSize="40px"
              objectFit="cover"
              src={product.productpic1}
              alt="Product Image"
              borderRadius="md"
              marginRight="10px"
            />
            <Box flex="1">
              <Text fontWeight="bold" noOfLines={1}>{product.title}</Text>
              <Flex alignItems="center">
                <CurrencyRupeeIcon fontSize="small" />
                <Text>{product.price}</Text>
              </Flex>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      
      <Divider />
      
      <Box 
        className="messages-container" 
        style={{ 
          height: "calc(100vh - 180px)", 
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <MDBTypography listUnStyled>
          <FetchChat id={id} toData={profileData} to={useremail} />
        </MDBTypography>
      </Box>
      
      <Box 
        className="send-message-container"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#fff",
          borderTop: "1px solid #eee",
          padding: "10px"
        }}
      >
        <SendChat id={id} to={useremail} />
      </Box>
    </Box>
  );
}

function Text(props) {
  return <Box {...props} />;
} 