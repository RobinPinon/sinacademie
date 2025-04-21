import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { useState, useRef } from 'react';
import { Monster } from '../types/Monster';
import { MonsterSelect } from './MonsterSelect';

interface AddCounterDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, monsters: Monster[], description: string) => void;
}

export const AddCounterDialog = ({ open, onClose, onAdd }: AddCounterDialogProps) => {
  const [name, setName] = useState('');
  const [selectedMonsters, setSelectedMonsters] = useState<Monster[]>([]);
  const editorRef = useRef<any>(null);

  const handleSubmit = () => {
    if (name && selectedMonsters.length > 0 && editorRef.current) {
      const description = editorRef.current.getContent();
      onAdd(name, selectedMonsters, description);
      setName('');
      setSelectedMonsters([]);
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ajouter un counter</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nom du counter"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <MonsterSelect
          selectedMonsters={selectedMonsters}
          onChange={setSelectedMonsters}
        />
        <div style={{ marginTop: '20px' }}>
          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'emoticons'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | emoticons | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 