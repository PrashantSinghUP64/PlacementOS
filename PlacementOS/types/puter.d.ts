// This file will contain all the puter types
// It will contains all the items and AI Responses to it
// We need it to call the API simply by saying {window.puter. (Functions)}

// This function represents a file or directory in virtual file system
interface FSItem {
    id : string; // Unique identifier for this item
    uid: string; // Unique user identifies on who owns this item
    name: string; // Name of the file or directory
    path: string; // Full Path to the Item
    id_dir: boolean; // True if this item is a directory
    parent_id: string; // ID of parent directory
    parent_uid: string; //UID of the owner of the parent directory
    created: number; // Timestamp of the creation
    modified: number; // Timestamp of last modification
    accessed: number; // Timestamp of last access
    size: number | null; // Size is in byter and it is null if unknown
    writable: boolean; //return True if the user can write to this item
}

// Represents a user of the system
interface PuterUser {
    uuid: string; // Unique identifier for the user
    username: string; // Username of the user
}

// Represent a simple key-value pair
interface KVItem{
    key: string; // The key
    value: string; // The value
}

// Represent the content of a chat message
interface ChatMessage {
    role: 'user' | 'assistant' | 'system'; // Who sent the message
    content: string| ChatMessageContent[]; // Message content as a string or arry of structured content
}

// Represent a chat message content in a conversation
interface ChatMessageContent {
    type: 'file' | 'text'; // Type of Content : either file reference or text
    puter_path? : string; // Path of the file if the type is 'file'
    text? : string; // Text content if the type is 'text'
}

// Options to configue an AI chat session
interface PuterChatOptions {
    model? : string; // Optional : specify AI model to use
    stream? : boolean; // Optional : stream responses instead of full completion
    max_tokens? : number; // Optional: max tokens in a response
    temperature? : number; // Optional : randomness/creativity of the response from AI
    tools? : {
        type: 'function' // Always 'function' for callable tools
        function: {
            name: string; // Name of the tool/function
            description: string; // Description of what it does
            parameters: { type: string; properties : {}}; // Parameters schema for the function
        }
    }
}

// Represent the Response from AI Chat Service
interface AIResponse {
    index: number; // index of the response in batch
    message: {
        role: string; // Role of the sender (assistant, system, user)
        content: string | any[] // Response content - could be unstructured or text
        refusal: null | string; // If the AI refused to respond, it should display a reason for refusal
        annotations: any[]; // Optional annotation or metadata
    };
    logprobs: null | any; // Optional : Log probabilities for generated tokens
    finish_reason: string; // Reason why the AI generation stopped ('length','stop' etc.)
    usage: {
        type: string; // Type of usage
        model: string; // Model used
        amount: number; // Number of Tokens consumed
        cost: number; // Cost of the usage
    }[];

    via_ai_chat_service:boolean; // True if response came from AI chat service
}