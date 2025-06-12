import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PasswordPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
}

export const PasswordPromptModal = ({ isOpen, onClose, onSubmit }: PasswordPromptModalProps) => {
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        onSubmit(password);
        setPassword('');
    };

    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Enter Password</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please enter your password to set the encryption key for this session.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                />
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}; 