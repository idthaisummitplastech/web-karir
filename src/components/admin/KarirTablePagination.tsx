'use client';

import * as React from 'react';
import {
  Box,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface KarirTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  totalCount?: number;
  filteredCount?: number;
  extraAction?: React.ReactNode;
}

export function KarirTableToolbar({
  searchQuery,
  onSearchChange,
  placeholder = 'Cari data...',
  totalCount,
  filteredCount,
  extraAction,
}: KarirTableToolbarProps) {
  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.5,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          flex: 1,
          width: '100%',
        }}
      >
        <TextField
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            maxWidth: { xs: '100%', sm: 380 },
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              '&:hover': { bgcolor: '#FFFFFF' },
              '&.Mui-focused': { bgcolor: '#FFFFFF' },
            },
          }}
        />
        {totalCount !== undefined && filteredCount !== undefined && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'flex-start', sm: 'center' },
              pl: { xs: 0.5, sm: 0 },
            }}
          >
            {searchQuery ? `${filteredCount} dari ${totalCount} entri` : `Total: ${totalCount} entri`}
          </Typography>
        )}
      </Box>

      {extraAction && <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{extraAction}</Box>}
    </Box>
  );
}

interface KarirTablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

export function KarirTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}: KarirTablePaginationProps) {
  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{
        borderTop: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Baris:"
        labelDisplayedRows={({ from, to, count: total }) =>
          `${from}–${to} / ${total !== -1 ? total : `>${to}`}`
        }
        sx={{
          '& .MuiTablePagination-toolbar': {
            minHeight: 52,
            px: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            gap: 0.5,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#475569',
          },
          '& .MuiTablePagination-select': {
            fontWeight: 700,
            color: '#0F172A',
          },
        }}
      />
    </Box>
  );
}
