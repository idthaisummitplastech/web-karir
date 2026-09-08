'use client';

import * as React from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { useLanguage } from '@/lib/LanguageContext';
import TranslateIcon from '@mui/icons-material/Translate';

const UKFlag = () => (
  <Box
    component="svg"
    viewBox="0 0 60 30"
    sx={{ width: 16, height: 11, borderRadius: '2px', overflow: 'hidden', flexShrink: 0, display: 'inline-block' }}
  >
    <clipPath id="uk-flag-clip-karir">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <g clipPath="url(#uk-flag-clip-karir)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3.6"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </Box>
);

const IDFlag = () => (
  <Box
    component="svg"
    viewBox="0 0 60 40"
    sx={{ width: 16, height: 11, borderRadius: '2px', overflow: 'hidden', flexShrink: 0, display: 'inline-block', border: '0.5px solid rgba(0,0,0,0.15)' }}
  >
    <rect width="60" height="20" fill="#E70011" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
  </Box>
);

interface LanguageToggleProps {
  size?: 'small' | 'medium';
}

export default function LanguageToggle({ size = 'medium' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <Tooltip
      title={
        language === 'en'
          ? 'Switch language to Bahasa Indonesia'
          : 'Switch language to English (Default)'
      }
      arrow
    >
      <Box
        className="notranslate"
        translate="no"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: '#F1F5F9',
          borderRadius: '24px',
          p: '3px',
          border: '1.5px solid #CBD5E1',
          position: 'relative',
          userSelect: 'none',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#94A3B8',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: 0.8,
            pr: 0.4,
            color: '#64748B',
          }}
        >
          <TranslateIcon sx={{ fontSize: 16 }} />
        </Box>

        {/* English Button (EN) */}
        <ButtonBase
          onClick={() => setLanguage('en')}
          className="notranslate"
          translate="no"
          sx={{
            px: 1.2,
            py: 0.4,
            borderRadius: '18px',
            bgcolor: language === 'en' ? '#018730' : 'transparent',
            color: language === 'en' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
            boxShadow:
              language === 'en' ? '0 2px 8px rgba(1, 135, 48, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            '&:hover': {
              color: language === 'en' ? '#FFFFFF' : '#0F172A',
            },
          }}
        >
          <UKFlag />
          <span style={{ fontWeight: 800 }}>EN</span>
        </ButtonBase>

        {/* Indonesian Button (ID) */}
        <ButtonBase
          onClick={() => setLanguage('id')}
          className="notranslate"
          translate="no"
          sx={{
            px: 1.2,
            py: 0.4,
            borderRadius: '18px',
            bgcolor: language === 'id' ? '#fc4509' : 'transparent',
            color: language === 'id' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
            boxShadow:
              language === 'id' ? '0 2px 8px rgba(252, 69, 9, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            '&:hover': {
              color: language === 'id' ? '#FFFFFF' : '#0F172A',
            },
          }}
        >
          <IDFlag />
          <span style={{ fontWeight: 800 }}>ID</span>
        </ButtonBase>
      </Box>
    </Tooltip>
  );
}
