
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add User
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleAddUser} buttonText="Add User" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserButton;
