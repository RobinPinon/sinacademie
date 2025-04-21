import React, { useRef } from 'react';
import { Button } from '@mui/material';

interface JsonImportButtonProps {
  onImport: (data: any, fileName: string) => void;
  label?: string;
}

export const JsonImportButton: React.FC<JsonImportButtonProps> = ({ 
  onImport, 
  label = "Importer un fichier JSON" 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        onImport(jsonData, file.name);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier JSON:', error);
        alert('Le fichier sélectionné n\'est pas un JSON valide');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => fileInputRef.current?.click()}
      >
        {label}
      </Button>
    </>
  );
}; 