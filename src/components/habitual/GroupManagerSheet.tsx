'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Group } from '@/lib/types';

interface GroupManagerSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: Group[];
  onAddGroup: (name: string) => void;
  onEditGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
}

export function GroupManagerSheet({
  isOpen,
  setIsOpen,
  groups,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}: GroupManagerSheetProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const handleAdd = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleStartEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleSaveEdit = () => {
    if (editingGroupId && editingGroupName.trim()) {
      onEditGroup(editingGroupId, editingGroupName.trim());
      handleCancelEdit();
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Gestionar Grupos</SheetTitle>
          <SheetDescription>
            Crea, edita o elimina tus grupos de hábitos.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          <div className="space-y-2 pr-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                {editingGroupId === group.id ? (
                  <Input
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium">{group.name}</span>
                )}
                <div className="flex items-center gap-1">
                  {editingGroupId === group.id ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEdit(group)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDeleteGroup(group.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>
          <div className="flex w-full gap-2">
            <Input
              placeholder="Nuevo grupo (ej. Estudio)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>Añadir</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
