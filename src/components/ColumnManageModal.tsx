import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';

interface ColumnManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
  onUpdateColumns: (columns: any[]) => void;
}

const ColumnManageModal = ({ isOpen, onClose, columns, onUpdateColumns }: ColumnManageModalProps) => {
  const [editingColumns, setEditingColumns] = useState(columns);
  const [newColumn, setNewColumn] = useState({ title: '', color: 'bg-blue-500' });

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];

  const handleSave = () => {
    onUpdateColumns(editingColumns);
    onClose();
  };

  const addColumn = () => {
    if (newColumn.title.trim()) {
      const id = newColumn.title.toLowerCase().replace(/\s+/g, '-');
      setEditingColumns([...editingColumns, { ...newColumn, id }]);
      setNewColumn({ title: '', color: 'bg-blue-500' });
    }
  };

  const updateColumn = (index: number, updates: any) => {
    const updated = [...editingColumns];
    updated[index] = { ...updated[index], ...updates };
    setEditingColumns(updated);
  };

  const deleteColumn = (index: number) => {
    setEditingColumns(editingColumns.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Columns */}
          <div className="space-y-3">
            {editingColumns.map((column, index) => (
              <div key={column.id} className="flex items-center gap-2 p-3 border rounded">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <Input
                  value={column.title}
                  onChange={(e) => updateColumn(index, { title: e.target.value })}
                  className="flex-1"
                />
                <select
                  value={column.color}
                  onChange={(e) => updateColumn(index, { color: e.target.value })}
                  className="border rounded px-2 py-1"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>
                      {color.replace('bg-', '').replace('-500', '')}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteColumn(index)}
                  disabled={editingColumns.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Column */}
          <div className="border-t pt-4">
            <Label>Add New Column</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Column title"
                value={newColumn.title}
                onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
              />
              <select
                value={newColumn.color}
                onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                className="border rounded px-2 py-1"
              >
                {colorOptions.map(color => (
                  <option key={color} value={color}>
                    {color.replace('bg-', '').replace('-500', '')}
                  </option>
                ))}
              </select>
              <Button onClick={addColumn}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnManageModal;
