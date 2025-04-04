
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserForm from "./UserForm";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AddUserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addUser } = useAuth();

  const handleAddUser = (data: any) => {
    try {
      const newUser = addUser(data);
      setIsOpen(false);
      toast.success(`User "${newUser.name}" added successfully`);
      
      // Force a rerender of the users page by dispatching a custom event
      window.dispatchEvent(new CustomEvent('user-updated'));
    } catch (error) {
      toast.error("Failed to add user");
      console.error(error);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="whitespace-nowrap w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add User
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="p-1">
              <UserForm onSubmit={handleAddUser} buttonText="Add User" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserButton;
