import React, { useState } from 'react';
import { Dialog, DialogContent, Box } from '@mui/material';

interface ImageWithPopupProps {
  src: string;
  alt?: string;
  className?: string;
}

const ImageWithPopup: React.FC<ImageWithPopupProps> = ({ src, alt = '', className = '' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        component="img"
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        sx={{
          cursor: 'pointer',
          maxWidth: '300px',
          height: 'auto',
          '&:hover': {
            opacity: 0.8
          }
        }}
        className={className}
      />
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        onClick={() => setOpen(false)}
      >
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box
            component="img"
            src={src}
            alt={alt}
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageWithPopup; 