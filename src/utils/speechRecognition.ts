
// Speech recognition utility
// This uses the Web Speech API which is available in most modern browsers

interface SpeechCommand {
  command: string;
  action: () => void;
  phrases?: string[];
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private commands: SpeechCommand[] = [];
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onListeningChangeCallback: ((isListening: boolean) => void) | null = null;
  private globalCommands: SpeechCommand[] = [];

  constructor() {
    this.initRecognition();
    this.setupGlobalCommands();
  }

  private initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    // Initialize SpeechRecognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      // Set up event handlers
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
    }
  }

  private setupGlobalCommands() {
    // Setup global commands that work throughout the application
    this.globalCommands = [
      {
        command: "home",
        phrases: ["go home", "dashboard", "main screen"],
        action: () => {
          // Use history API instead of directly changing location to prevent full reload
          const history = window.history;
          history.pushState({}, "", "/");
          // Dispatch a navigation event to notify React Router
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "logout",
        phrases: ["sign out", "exit system"],
        action: () => {
          // Use history API instead of directly changing location
          const history = window.history;
          history.pushState({}, "", "/login");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "products",
        phrases: ["show products", "goto products"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/products");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "orders",
        phrases: ["show orders", "goto orders"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/orders");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "customers",
        phrases: ["show customers", "goto customers"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/customers");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "reports",
        phrases: ["show reports", "goto reports"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/reports");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "settings",
        phrases: ["show settings", "goto settings"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/settings");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "users",
        phrases: ["show users", "goto users"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/users");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "pos",
        phrases: ["open pos", "start pos", "point of sale"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/pos-session");
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        command: "shop",
        phrases: ["shop mode", "open shop"],
        action: () => {
          const history = window.history;
          history.pushState({}, "", "/pos-shop");
          window.dispatchEvent(new Event('popstate'));
        }
      }
    ];
  }

  public setOnResult(callback: (transcript: string) => void) {
    this.onResultCallback = callback;
    return this;
  }

  public setOnListeningChange(callback: (isListening: boolean) => void) {
    this.onListeningChangeCallback = callback;
    return this;
  }

  private handleResult(event: SpeechRecognitionEvent) {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    console.log('Speech recognized:', transcript);

    // Call the result callback if set
    if (this.onResultCallback) {
      this.onResultCallback(transcript);
    }

    // Process commands
    this.processCommands(transcript);
  }

  private handleEnd() {
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
  }

  public registerCommand(command: SpeechCommand) {
    this.commands.push(command);
    return this;
  }

  public registerCommands(commands: SpeechCommand[]) {
    this.commands.push(...commands);
    return this;
  }

  private processCommands(transcript: string) {
    // First check page-specific commands with exact matching
    for (const cmd of this.commands) {
      // Check if the transcript matches the command directly
      if (transcript === cmd.command.toLowerCase()) {
        cmd.action();
        return;
      }
      
      // Check if command is contained within transcript
      if (transcript.includes(cmd.command.toLowerCase())) {
        cmd.action();
        return;
      }

      // Check alternate phrases with exact matching if provided
      if (cmd.phrases) {
        for (const phrase of cmd.phrases) {
          if (transcript === phrase.toLowerCase() || transcript.includes(phrase.toLowerCase())) {
            cmd.action();
            return;
          }
        }
      }
    }

    // Then check global commands
    for (const cmd of this.globalCommands) {
      // Check if the transcript matches the command directly
      if (transcript === cmd.command.toLowerCase() || transcript.includes(cmd.command.toLowerCase())) {
        cmd.action();
        return;
      }

      // Check alternate phrases if provided
      if (cmd.phrases) {
        for (const phrase of cmd.phrases) {
          if (transcript === phrase.toLowerCase() || transcript.includes(phrase.toLowerCase())) {
            cmd.action();
            return;
          }
        }
      }
    }
  }

  public startListening() {
    if (!this.recognition) {
      console.error('Speech recognition not initialized.');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(true);
      }
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  public stopListening() {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }
      console.log('Speech recognition stopped');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  public isSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  public clearCommands() {
    this.commands = [];
    return this;
  }
}

// Create a singleton instance
const speechRecognition = new SpeechRecognitionService();
export default speechRecognition;
