
import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import speechRecognition from "@/utils/speechRecognition";
import { toast } from "sonner";

interface VoiceCommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onTranscript?: (transcript: string) => void;
  commands?: Array<{
    command: string;
    action: () => void;
    phrases?: string[];
  }>;
}

export function VoiceCommandButton({
  size = "icon",
  variant = "outline",
  onTranscript,
  commands = [],
  className,
  ...props
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition is supported
    setSupported(speechRecognition.isSupported());
    
    // Register commands
    if (commands.length > 0) {
      speechRecognition.registerCommands(commands);
    }

    // Set callbacks
    speechRecognition
      .setOnResult((transcript) => {
        if (onTranscript) onTranscript(transcript);
      })
      .setOnListeningChange(setIsListening);

    return () => {
      // Clean up by stopping listening if component unmounts while active
      if (isListening) {
        speechRecognition.stopListening();
      }
    };
  }, [commands, onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      speechRecognition.stopListening();
    } else {
      speechRecognition.startListening();
      toast.info("Listening for voice commands...");
    }
  };

  if (!supported) {
    return null; // Don't show the button if not supported
  }

  return (
    <Button
      onClick={toggleListening}
      size={size}
      variant={variant}
      className={className}
      {...props}
      aria-label={isListening ? "Stop listening" : "Start voice command"}
      title={isListening ? "Stop listening" : "Start voice command"}
    >
      {isListening ? <Mic className="h-5 w-5 text-red-500 animate-pulse" /> : <MicOff className="h-5 w-5" />}
    </Button>
  );
}
