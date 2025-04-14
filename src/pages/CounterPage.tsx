import React from 'react';
import Counter from '../components/Counter';
import { Box, Container } from '@mui/material';

const CounterPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Counter />
      </Box>
    </Container>
  );
};

export default CounterPage; 