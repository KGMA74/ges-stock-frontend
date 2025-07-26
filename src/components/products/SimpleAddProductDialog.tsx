'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SimpleAddProductDialogProps {
  onSuccess?: () => void;
}

const SimpleAddProductDialog: React.FC<SimpleAddProductDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  console.log('SimpleAddProductDialog render, open:', open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Simple Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Simple Test Dialog</DialogTitle>
          <DialogDescription>
            Ceci est un test simple pour voir si le dialog s'ouvre.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4">
          <p>Si vous voyez ceci, le dialog fonctionne !</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={() => {
            console.log('Bouton cliqué !');
            onSuccess?.();
            setOpen(false);
          }}>
            Test réussi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleAddProductDialog;
