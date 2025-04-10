
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

  // Find and click buttons by their text content or attributes
  const findAndClickButton = (selector: string) => {
    // First try by data-testid or other attributes
    let button = document.querySelector(selector) as HTMLButtonElement | null;
    
    if (!button) {
      // Try to find by data-voice-command attribute
      const buttons = Array.from(document.querySelectorAll('[data-voice-command]'));
      button = buttons.find(btn => {
        const voiceCmd = btn.getAttribute('data-voice-command')?.toLowerCase() || '';
        return voiceCmd === selector.toLowerCase();
      }) as HTMLButtonElement | null;
    }
    
    if (!button) {
      // Try to find by button text content (case insensitive)
      const allButtons = Array.from(document.querySelectorAll('button'));
      button = allButtons.find(btn => {
        const text = btn.textContent?.toLowerCase().trim() || '';
        const selectorText = selector.toLowerCase().trim();
        return text === selectorText || text.includes(selectorText);
      }) as HTMLButtonElement | null;
    }
    
    if (button && button instanceof HTMLButtonElement) {
      button.click();
      return true;
    }
    
    return false;
  };

  // Enhanced method to find all buttons on the page for voice commands
  const getAllButtonsAsCommands = () => {
    const buttonCommands = [];
    
    // Get all buttons with text content
    const allButtons = Array.from(document.querySelectorAll('button'));
    
    for (const button of allButtons) {
      const text = button.textContent?.trim();
      if (text && text.length > 1) {
        // Skip buttons with just icons
        buttonCommands.push({
          command: text.toLowerCase(),
          phrases: [`click ${text.toLowerCase()}`, `press ${text.toLowerCase()}`, `select ${text.toLowerCase()}`],
          action: () => {
            if (button instanceof HTMLButtonElement) {
              button.click();
              toast.success(`Clicked: ${text}`);
            }
          }
        });
      }
      
      // Check for aria-label for icon buttons
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.length > 1) {
        buttonCommands.push({
          command: ariaLabel.toLowerCase(),
          phrases: [`click ${ariaLabel.toLowerCase()}`, `press ${ariaLabel.toLowerCase()}`, `select ${ariaLabel.toLowerCase()}`],
          action: () => {
            if (button instanceof HTMLButtonElement) {
              button.click();
              toast.success(`Clicked: ${ariaLabel}`);
            }
          }
        });
      }
    }
    
    // Add voice-command specific buttons
    const voiceButtons = Array.from(document.querySelectorAll('[data-voice-command]'));
    for (const button of voiceButtons) {
      const voiceCmd = button.getAttribute('data-voice-command');
      if (voiceCmd) {
        buttonCommands.push({
          command: voiceCmd.toLowerCase(),
          phrases: [`${voiceCmd.toLowerCase()}`],
          action: () => {
            if (button instanceof HTMLButtonElement) {
              button.click();
              toast.success(`Executed: ${voiceCmd}`);
            }
          }
        });
      }
    }
    
    return buttonCommands;
  };

  // Location-specific commands
  const getPageCommands = () => {
    const path = location.pathname;
    
    // Common commands for all pages
    const commonCommands = [
      {
        command: "help",
        phrases: ["show help", "what can I say", "help me", "show commands", "commands", "voice help", "available commands"],
        action: () => {
          toast.info(
            "Voice commands: 'home', 'products', 'orders', 'customers', 'reports', 'settings', 'users', 'pos', 'shop', 'logout', 'help'",
            { duration: 8000 }
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
          phrases: ["start sale", "begin sale", "open register", "start selling", "begin selling"],
          action: () => navigate('/pos-session', { replace: true })
        }
      ];
    }
    
    if (path === '/products') {
      return [
        ...commonCommands,
        {
          command: "add product",
          phrases: ["new product", "create product", "make product", "add a product"],
          action: () => {
            findAndClickButton('[data-testid="add-product-button"]');
          }
        },
        ...getAllButtonsAsCommands()
      ];
    }
    
    if (path === '/customers') {
      return [
        ...commonCommands,
        {
          command: "add customer",
          phrases: ["new customer", "create customer", "make customer", "add a customer"],
          action: () => {
            findAndClickButton('[data-testid="add-customer-button"]');
          }
        },
        ...getAllButtonsAsCommands()
      ];
    }
    
    if (path === '/pos-shop') {
      // Get all unique product names from the product list
      const productNames = Array.isArray(products) ? 
        [...new Set(products.map(product => product.name.toLowerCase()))] : [];
      
      // Create commands for each product
      const productCommands = productNames.map(productName => ({
        command: productName,
        phrases: [`add ${productName}`, `select ${productName}`, `choose ${productName}`],
        action: () => {
          // Wait a short time for any navigation to complete
          setTimeout(() => {
            // Find product button by its data attribute or content
            const productItem = document.querySelector(`[data-product-name="${productName}"]`);
            
            if (productItem) {
              const addButton = productItem.querySelector('button[data-product-button]') as HTMLButtonElement;
              if (addButton && addButton instanceof HTMLButtonElement) {
                addButton.click();
                toast.success(`Added ${productName} to cart`);
              }
            } else {
              // If not found directly, try to find button with matching text
              const buttons = Array.from(document.querySelectorAll('button[data-product-button]'));
              const matchingButton = buttons.find(btn => {
                const btnProductName = btn.getAttribute('data-product-button')?.toLowerCase();
                return btnProductName === productName;
              }) as HTMLButtonElement;
              
              if (matchingButton && matchingButton instanceof HTMLButtonElement) {
                matchingButton.click();
                toast.success(`Added ${productName} to cart`);
              }
            }
          }, 100);
        }
      }));
      
      return [
        ...commonCommands,
        {
          command: "add product",
          phrases: ["new product", "create product", "make product"],
          action: () => {
            findAndClickButton('button:has(.PlusCircle)') || 
            findAndClickButton('[data-testid="add-product-button"]');
          }
        },
        {
          command: "start pos",
          phrases: ["open register", "begin selling", "start selling", "open pos", "start pos session"],
          action: () => {
            findAndClickButton('[data-testid="start-pos-button"]');
          }
        },
        ...productCommands,
        ...getAllButtonsAsCommands()
      ];
    }
    
    if (path.includes('/pos-session')) {
      // Get all unique product names from the product list
      const productNames = Array.isArray(products) ? 
        [...new Set(products.map(product => product.name.toLowerCase()))] : [];
      
      // Create commands for each product 
      const productCommands = productNames.map(productName => ({
        command: productName,
        phrases: [`add ${productName}`, `select ${productName}`, `choose ${productName}`, `get ${productName}`],
        action: () => {
          // Find product button by its data attribute
          const productItem = document.querySelector(`[data-product-name="${productName}"]`);
          
          if (productItem) {
            const addButton = productItem.querySelector('button') as HTMLButtonElement;
            if (addButton && addButton instanceof HTMLButtonElement) {
              addButton.click();
              toast.success(`Added ${productName} to cart`);
            }
          } else {
            // If not found by attribute, try to find by button text
            const buttons = Array.from(document.querySelectorAll('button[data-product-button]'));
            const matchingButton = buttons.find(btn => {
              const btnProductName = btn.getAttribute('data-product-button')?.toLowerCase();
              return btnProductName === productName;
            }) as HTMLButtonElement;
            
            if (matchingButton && matchingButton instanceof HTMLButtonElement) {
              matchingButton.click();
              toast.success(`Added ${productName} to cart`);
            }
          }
        }
      }));
        
      // Add specific POS Session commands
      const posSessionCommands = [
        {
          command: "checkout",
          phrases: ["pay now", "process payment", "complete sale", "finish order", "checkout now", "pay", "pay order"],
          action: () => {
            findAndClickButton('button:contains("Pay")');
          }
        },
        {
          command: "clear cart",
          phrases: ["empty cart", "remove items", "clear all items", "start over", "reset cart"],
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
        {
          command: "recovery",
          phrases: ["open recovery", "recovery mode", "find order", "recover order"],
          action: () => {
            findAndClickButton('button:contains("Recovery")');
          }
        },
        {
          command: "all orders",
          phrases: ["show orders", "view orders", "orders list"],
          action: () => {
            findAndClickButton('button:contains("All Orders")');
          }
        },
        {
          command: "close pos",
          phrases: ["end session", "close session", "exit pos", "logout pos"],
          action: () => {
            findAndClickButton('button:contains("Close POS")');
          }
        },
        {
          command: "search products",
          phrases: ["find product", "search items", "find items"],
          action: () => {
            // Focus on the search input
            const searchInput = document.querySelector('input[placeholder*="Search products"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              toast.info("Say the product name you want to search for");
            }
          }
        }
      ];
      
      return [
        ...commonCommands,
        ...posSessionCommands,
        ...productCommands,
        ...getAllButtonsAsCommands()
      ];
    }
    
    // For all other pages, add common commands plus all buttons
    return [
      ...commonCommands,
      ...getAllButtonsAsCommands()
    ];
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
