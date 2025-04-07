
import React, { createContext, useContext, useEffect, useState } from 'react';
import { VoiceCommandButton } from '@/components/ui/voice-command-button';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/utils/data';

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
          action: () => navigate('/pos-session', { replace: true })
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
            const button = document.querySelector('[data-testid="add-product-button"]');
            if (button && button instanceof HTMLButtonElement) {
              button.click();
            }
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
            const button = document.querySelector('[data-testid="add-customer-button"]');
            if (button && button instanceof HTMLButtonElement) {
              button.click();
            }
          }
        }
      ];
    }
    
    if (path === '/pos-shop') {
      const productCommands = Array.isArray(products) ? 
        products.map(product => ({
          command: product.name.toLowerCase(),
          action: () => {
            // Find the store card and click its "Start POS Session" button
            const storeCards = document.querySelectorAll('.card');
            if (storeCards.length > 0) {
              const firstCard = storeCards[0];
              const startButton = firstCard.querySelector('button');
              if (startButton && startButton instanceof HTMLButtonElement) {
                startButton.click();
                
                // Set timeout to allow navigation to complete before attempting to add product
                setTimeout(() => {
                  // Find and click on product with matching name
                  const productItems = document.querySelectorAll('.product-item');
                  productItems.forEach(item => {
                    const nameElement = item.querySelector('div.font-medium');
                    if (nameElement && nameElement.textContent === product.name) {
                      const addButton = item.querySelector('button');
                      if (addButton && addButton instanceof HTMLButtonElement) addButton.click();
                    }
                  });
                }, 500);
              }
            }
          }
        })) : [];
        
      return [
        ...commonCommands,
        {
          command: "add product",
          phrases: ["new product", "create product"],
          action: () => {
            // Find and click the Add Product button
            const addButton = document.querySelector('button:has(.PlusCircle)');
            if (addButton && addButton instanceof HTMLButtonElement) {
              addButton.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
              );
            } else {
              toast.error("Add Product button not found");
            }
          }
        },
        ...productCommands
      ];
    }
    
    if (path.includes('/pos-session')) {
      // Add product recognition for POS session
      const productCommands = Array.isArray(products) ? 
        products.map(product => ({
          command: product.name.toLowerCase(),
          action: () => {
            // Find and click on product with matching name
            const productItems = document.querySelectorAll('.product-item');
            productItems.forEach(item => {
              const nameElement = item.querySelector('div.font-medium');
              if (nameElement && nameElement.textContent === product.name) {
                const addButton = item.querySelector('button');
                if (addButton && addButton instanceof HTMLButtonElement) addButton.click();
              }
            });
          }
        })) : [];
        
      return [
        ...commonCommands,
        {
          command: "checkout",
          phrases: ["pay now", "process payment"],
          action: () => {
            // Find and click Pay button
            const payButton = document.querySelector('button:contains("Pay")');
            if (payButton && payButton instanceof HTMLButtonElement) {
              payButton.click();
            }
          }
        },
        {
          command: "clear cart",
          phrases: ["empty cart", "remove items"],
          action: () => {
            // Loop through all items and click remove
            const removeButtons = document.querySelectorAll('.cart-item button:contains("X")');
            removeButtons.forEach(button => {
              if (button instanceof HTMLButtonElement) {
                button.click();
              }
            });
          }
        },
        ...productCommands
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
          continuousListening={true}
        />
      )}
    </VoiceCommandContext.Provider>
  );
};
