'use client';

import React, { useState } from 'react';
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

const TestDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Test Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dialog de test</DialogTitle>
          <DialogDescription>
            Ceci est un dialog de test pour vérifier le fonctionnement.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <p>Si vous voyez ceci, le dialog fonctionne !</p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestDialog;
