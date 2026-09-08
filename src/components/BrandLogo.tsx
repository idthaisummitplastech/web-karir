'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';

interface BrandLogoProps {
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  lightText?: boolean;
}

export default function BrandLogo({
  title = 'PT INDONESIA THAI SUMMIT PLASTECH',
  subtitle = 'Automotive Plastic & Interior Systems',
  size = 'medium',
  lightText = false,
}: BrandLogoProps) {
  const dimensions = {
    small: { imgHeight: 34, titleSize: '0.84rem', subSize: '0.6rem' },
    medium: { imgHeight: 42, titleSize: '1.02rem', subSize: '0.68rem' },
    large: { imgHeight: 52, titleSize: '1.25rem', subSize: '0.75rem' },
  }[size];

  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        userSelect: 'none',
        maxWidth: '100%',
      }}
    >
      {/* Official TS Plastech Logo Mark */}
      <Box
        sx={{
          height: dimensions.imgHeight,
          width: dimensions.imgHeight,
          minWidth: dimensions.imgHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          p: 0.4,
          borderRadius: '10px',
          boxShadow: lightText ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
          border: lightText ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(1, 135, 48, 0.2)',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/logo-plastech.jpg"
          alt="PT Indonesia Thai Summit Plastech Logo"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* Corporate Typography */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: lightText ? '#FFFFFF' : '#018730',
            fontSize: dimensions.titleSize,
            lineHeight: 1.25,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: lightText ? '#4ade80' : '#64748B',
            fontSize: dimensions.subSize,
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            mt: 0.3,
            lineHeight: 1.25,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          <Box component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#fc4509', flexShrink: 0 }} />
          <span>{subtitle}</span>
        </Typography>
      </Box>
    </Box>
  );
}
