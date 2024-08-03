// src/components/datatable.js

'use client'

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';

function AddRecordButton({ rows, setRows, rowModesModel, setRowModesModel }) {
  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, item: '', quantity: '', expirationDate: '', category: ''}]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
      Add record
    </Button>
  );
}

function DataTable({rows, setRows, rowModesModel, setRowModesModel, inventory, setInventory, itemName, setItemName, searchItemName, setSearchItemName, addItem, removeItem, searchItem}) {

  const [selectedRow, setSelectedRow] = useState('')

  const getRowById = (id) => {
    const rowData = rows.find((row) => {row.id === id})
    return rowData
  }

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    setSelectedRow(id)
  };

  const handleSaveClickFollow = () => () => {
    const rowData = getRowById(selectedRow)
    console.log(rowData)
  }

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'item', 
      headerName: 'Item', 
      width: 180, 
      editable: true 
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'expirationDate',
      headerName: 'Expiration Date',
      type: 'date',
      width: 180,
      editable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Fruit', 'Vegetable', 'Spice/Seasoning', 'Other'],
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={() => {
                handleSaveClick(id)
                handleSaveClickFollow()
              }}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <AddRecordButton rows={rows} setRows={setRows} rowModesModel={rowModesModel} setRowModesModel={setRowModesModel}></AddRecordButton>
      <Box
        sx={{
          height: '365px',
          width: '100%',
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        <DataGrid
          sx={{
            borderRadius: '0px 0px 24px 24px',
            '& .MuiDataGrid-footerContainer': {
              position: 'sticky'
            },  
          }}
          overflow={'auto'}
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={(e) => handleRowModesModelChange(e)}
          onRowEditStop={(e) => handleRowEditStop(e)}
          processRowUpdate={(e) => processRowUpdate(e)}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </>
    
  );
}

export { DataTable }