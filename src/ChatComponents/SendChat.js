import { useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { CheckIcon } from "@chakra-ui/icons";

export default function SendChat({ id, to }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const authToken = localStorage.getItem("authToken");
  const toast = useToast();
  
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message && !isSending) {
      try {
        setIsSending(true);
        const response = await axios.post(
          "https://retrend-final.onrender.com/sendMessage",
          { message, id, to },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        if (response.status === 200) {
          setMessage("");
        } else if (response.status === 201) {
          toast({
            title: "You cannot send Message",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Failed to send message",
          description: "Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const handleKeyDown = (e) => {
    // Send message on Enter key, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };
  
  return (
    <Form onSubmit={sendMessage} className="chat-input-container">
      <input
        type="text"
        className="chat-input"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isSending}
      />
      {message.length > 0 && (
        <button 
          type="submit" 
          className="send-btn"
          disabled={isSending}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      )}
    </Form>
  );
}

