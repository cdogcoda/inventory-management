// src/components/inventory.js

'use client'

import { Box, Typography, Button } from '@mui/material'

function Inventory({ inventory, theme, removeItem }) {
    if (inventory.length) {
      return (inventory.map(({name, quantity}) => (
        <Box
          key={name}
          width='100%'
          minHeight='150px'
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          bgcolor={'#f0f0f0'}
          padding={'24px'}
          borderTop={'2px solid black'}
        >
          <Typography
            variant='h3'
            color={'#333'}
            textAlign={'center'}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
          <Typography
            variant='h3'
            color={'#333'}
            textAlign={'center'}
          >
            Quantity: {quantity}
          </Typography>
          <Button
            theme={theme}
            variant="pretty"
            onClick={() => {
              removeItem(name)
            }}
          >
            Remove 
          </Button>
        </Box>
      )))
    } else {
      return (
        <Typography
          variant='h3'
          color={'#333'}
          textAlign={'center'}
          alignSelf={'center'}
        >
          No logged items
        </Typography>
      )
    }
  }


export { Inventory }