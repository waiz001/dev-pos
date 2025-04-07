
import React, { createContext, useContext, useEffect, useState } from 'react';
import { VoiceCommandButton } from '@/components/ui/voice-command-button';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface VoiceCommandContextType {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  toggleListening: () => void;
  transcript: string;
}

const VoiceCommandContext = createContext<VoiceCommandContextType>({
  isListening: false,
  setIsListening: () => {},
  toggleListening: () => {},
  transcript: '',
});

export const useVoiceCommand = () => useContext(VoiceCommandContext);

export const VoiceCommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Only show voice commands on certain pages
  const shouldShowVoiceButton = location.pathname !== '/login';

  // Helper function to toggle listening
  const toggleListening = () => {
    setIsListening(!isListening);
  };

  // Location-specific commands
  const getPageCommands = () => {
    const path = location.pathname;
    
    // Common commands for all pages
    const commonCommands = [
      {
        command: "help",
        phrases: ["show help", "what can I say"],
        action: () => {
          toast.info(
            "Voice commands: 'home', 'products', 'orders', 'customers', 'reports', 'settings', 'users', 'pos', 'shop', 'logout', 'help'",
            { duration: 5000 }
          );
        }
      }
    ];

    // Page specific commands
    if (path === '/') {
      return [
        ...commonCommands,
        {
          command: "new sale",
          phrases: ["start sale", "begin sale", "open register"],
          action: () => navigate('/pos-session')
        }
      ];
    }
    
    if (path === '/products') {
      return [
        ...commonCommands,
        {
          command: "add product",
          phrases: ["new product", "create product"],
          action: () => {
            // Trigger add product dialog
            document.querySelector('[data-testid="add-product-button"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
        }
      ];
    }
    
    if (path === '/customers') {
      return [
        ...commonCommands,
        {
          command: "add customer",
          phrases: ["new customer", "create customer"],
          action: () => {
            // Trigger add customer dialog
            document.querySelector('[data-testid="add-customer-button"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
        }
      ];
    }
    
    if (path.includes('/pos-session') || path.includes('/pos-shop')) {
      return [
        ...commonCommands,
        {
          command: "checkout",
          phrases: ["pay now", "process payment"],
          action: () => {
            // Trigger checkout button
            document.querySelector('[data-testid="checkout-button"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
        },
        {
          command: "clear cart",
          phrases: ["empty cart", "remove items"],
          action: () => {
            // Find and click clear button
            document.querySelector('[data-testid="clear-cart-button"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
        }
      ];
    }
    
    return commonCommands;
  };

  // Combine page-specific commands with global commands
  const commands = getPageCommands();

  return (
    <VoiceCommandContext.Provider value={{ isListening, setIsListening, toggleListening, transcript }}>
      {children}
      {shouldShowVoiceButton && currentUser && (
        <VoiceCommandButton 
          position="bottom-right"
          onTranscript={setTranscript}
          commands={commands}
          showTranscript={isListening}
          size="default"
          variant="secondary"
          label="Voice Commands"
        />
      )}
    </VoiceCommandContext.Provider>
  );
};
