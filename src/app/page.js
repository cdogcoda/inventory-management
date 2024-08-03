// src/page.js

'use client';

import { useState, useEffect } from "react"
import { Box, Stack, Typography, Button, Modal, TextField, createTheme, ThemeProvider, } from '@mui/material'
import { firestore } from './firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { DataTable } from './components/datatable'
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const theme = createTheme({
  typography: {
    fontFamily: ['Poppins', 'sans-serif'].join(','),
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          textShadow: '0px 0px 2px rgba(0,0,0,.3)'
        }, 
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textShadow: '0px 0px 2px rgba(0,0,0,.3)'
        }
      },
      variants: [{
        props: {variant: 'pretty'},
        style: {
          backgroundColor: 'pink',
          '&:hover': {
            backgroundColor: 'lightpink'
          }
        }
      }]
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'pink',
              color: 'pink'
            }
          },
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#cb416b'
          }
        }
      }
    },
  }
})


export default function Home() {
  

  const [inventory, setInventory] = useState([])
  const [itemName, setItemName] = useState('')
  const [searchItemName, setSearchItemName] = useState('')

  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []

    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data()})
    })

    console.log(inventoryList)

    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (itemName) => {
    if (!itemName) {
      alert("Please add a valid item.")
      return
    }

    const item = itemName.toLowerCase();
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1})
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()

  }

  const removeItem = async (itemName) => {
    const item = itemName.toLowerCase();
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (searchItemName) {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const docNames = Array.from(docs.docs).map((doc) => {
        return doc.id
      })
      const searchedInventory = []
      
      const matchedDocs = docNames.filter((doc) => {
        return (doc.includes(searchItemName))
      }).map(async (match) => {
        return await getDoc(doc(collection(firestore, 'inventory'), match))
      })

      for (const doc of matchedDocs) {
        const name = (await doc).id
        const quantity = (await doc).data()['quantity']
        const itemLog = {}
        if (name === item && quantity === 1) {
          await deleteDoc(docRef)
          continue
        } else if (name === item && quantity > 1) {
          await setDoc(docRef, { quantity: quantity - 1 })
          itemLog['name'] = name
          itemLog['quantity'] = quantity - 1
        } else {
          itemLog['name'] = name
          itemLog['quantity'] = quantity
        }
        
        searchedInventory.push(itemLog)
      }

      setInventory(searchedInventory)
    } else {
        if (docSnap.exists()) {
          const { quantity } = docSnap.data()
          if (quantity === 1) {
            await deleteDoc(docRef)
          } else {
            await setDoc(docRef, { quantity: quantity - 1 })
          }
        }
        await updateInventory();
    }
      
  }

  const searchItem = async (itemName) => {
    const item = itemName.toLowerCase();
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const docNames = Array.from(docs.docs).map((doc) => {
      return doc.id
    })
    const searchedInventory = []
    
    const matchedDocs = docNames.filter((doc) => {
      return (doc.includes(item))
    }).map(async (match) => {
      return await getDoc(doc(collection(firestore, 'inventory'), match))
    })

    for (const doc of matchedDocs) {
      const itemLog = {}
      itemLog['name'] = (await doc).id
      itemLog['quantity'] = (await doc).data()['quantity']
      searchedInventory.push(itemLog)
    }

    setInventory(searchedInventory)

  }

  return (
    <ThemeProvider theme={theme}>
      <Box
      width='100vw'
      height='100vh'
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#FEEEED'}
    >
      <Stack
        width={'800px'}
        direction={'row'}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <TextField 
          theme={theme}
          id="outlined-basic" 
          label="Search" 
          value={searchItemName}
          onChange={(e) => {
            setSearchItemName(e.target.value)
            searchItem(e.target.value)
          }}
          
        />
      </Stack>
      
      <Box
        borderRadius={'24px'}
        boxShadow={'0px 0px 12px rgba(0,0,0,.25)'}
      >
        <Box
          width='800px'
          height='100px'
          bgcolor={'lightpink'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={'24px 24px 0px 0px'}
        >
          <Typography
            variant='h2'
            color={'#333'}
            textAlign={'center'}
          >
            Inventory Items
          </Typography>
        </Box>
        <Stack
          width='800px'
          height='400px'
          spacing={0}
          borderRadius={'0px 0px 24px 24px'}
        >
          <DataTable 
            theme={theme} 
            rows={rows} 
            setRows={setRows} 
            rowModesModel={rowModesModel} 
            setRowModesModel={setRowModesModel} 
            inventory={inventory} 
            setInventory={setInventory} 
            itemName={itemName} 
            setItemName={setItemName} 
            searchItemName={searchItemName} 
            setSearchItemName={setSearchItemName} 
            addItem={addItem} 
            removeItem={removeItem} 
            searchItem={searchItem}
          />

        </Stack>
      </Box>
    </Box>
    </ThemeProvider>
    
  )
}

