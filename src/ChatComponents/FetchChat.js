import { Box } from "@chakra-ui/react";
import axios from "axios";
import { MDBCard, MDBCardBody, MDBCardHeader, MDBIcon } from "mdb-react-ui-kit";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../resources/Loading";
import { CheckIcon } from "@chakra-ui/icons";

export default function FetchChat({ id, toData, to }) {
  const authPicture = localStorage.getItem("authpicture");
  const authName = localStorage.getItem("authname");
  const authemail = localStorage.getItem("authemail");
  const authToken = localStorage.getItem("authToken");
  const [newMessages, setNewMessages] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messageContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    if (id) {
      const fetchNewMessages = async () => {
        try {
          const response = await axios.get("https://retrend-final.onrender.com/api/new-messages", {
            params: { id, to },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = response.data;
          
          // Only set state if there are new messages
          if (data.length !== newMessages.length) {
            setNewMessages(data);
            setHasNewMessages(true);
          }
          
          setIsLoading(false);

          // Mark messages as read if they're sent to the current user
          if (data.length > 0) {
            const unreadMessages = data.filter(
              msg => msg.to === authemail && !msg.isRead
            );
            
            if (unreadMessages.length > 0) {
              try {
                await axios.post("https://retrend-final.onrender.com/mark-messages-read", 
                  { messageIds: unreadMessages.map(msg => msg._id) },
                  {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                    },
                  }
                );
              } catch (error) {
                console.error("Error marking messages as read:", error);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          setIsLoading(false);
        }
      };

      // Initial fetch
      fetchNewMessages();

      // Set up polling with a longer interval (3 seconds instead of 1)
      const intervalId = setInterval(() => {
        if (isPolling) {
          fetchNewMessages();
        }
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [id, authToken, to, authemail, isPolling]);

  useEffect(() => {
    if (hasNewMessages && !userScrolled) {
      scrollToBottom();
      setHasNewMessages(false);
    }
  }, [hasNewMessages, userScrolled]);

  // Handle scroll events
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    
    // Set userScrolled flag when user scrolls up
    if (!isAtBottom) {
      setUserScrolled(true);
    } else {
      setUserScrolled(false);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  // Component visibility handling - pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box
      className="message-container"
      maxH="500px" // Increased height from 400px to 500px
      overflowY="auto"
      ref={messageContainerRef}
      onScroll={handleScroll}
      sx={{
        scrollBehavior: "smooth",
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#25D366',
          borderRadius: '8px',
        }
      }}
    >
      {newMessages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        newMessages.map((message, index) => (
          <div key={index} className={`message-wrapper ${message.from === authemail ? 'sent' : 'received'}`}>
            {message.from === authemail ? (
              <li className="d-flex justify-content-end mb-4">
                <div className="message-bubble-sent">
                  <p className="mb-0">{message.message}</p>
                  <div className="message-timestamp">
                    {formatTime(message.createdAt)}
                    <span className="message-status ml-1">
                      {message.isRead ? (
                        <span className="blue-tick">
                          <CheckIcon color="blue.500" boxSize={3} mr={1} />
                          <CheckIcon color="blue.500" boxSize={3} />
                        </span>
                      ) : (
                        <span className="gray-tick">
                          <CheckIcon color="gray.500" boxSize={3} mr={1} />
                          <CheckIcon color="gray.500" boxSize={3} />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </li>
            ) : (
              <li className="d-flex mb-4">
                <img
                  src={toData.picture}
                  alt="avatar"
                  className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                  width="40"
                />
                <div className="message-bubble-received">
                  <p className="mb-0">{message.message}</p>
                  <div className="message-timestamp">
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </li>
            )}
          </div>
        ))
      )}
    </Box>
  );
}
