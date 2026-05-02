# Multi-Language Support Setup

To enable multi-language support in Veto-Care, you need to install the required dependencies:

## Installation

```bash
# Using npm
npm install react-i18next i18next i18next-browser-languagedetector

# Using bun
bun add react-i18next i18next i18next-browser-languagedetector

# Using yarn
yarn add react-i18next i18next i18next-browser-languagedetector
```

## Features Added

- **French (default)**: Complete French translations
- **English**: Full English translations
- **Arabic**: Arabic translations with RTL support
- **Language Switcher**: Dropdown in navbar with flag icons
- **RTL Support**: Automatic right-to-left layout for Arabic
- **Persistent Language**: Language preference saved in localStorage

## Supported Languages

- 🇫🇷 **Français** (French) - Default
- 🇺🇸 **English** (English)
- 🇸🇦 **العربية** (Arabic) - RTL layout

## Usage

The language switcher is available in the navbar. Users can click it to switch between languages. The selected language is automatically saved and restored on subsequent visits.

## Technical Details

- Uses `react-i18next` for React integration
- `i18next-browser-languagedetector` for automatic language detection
- Translation files stored in `src/i18n/locales/`
- RTL support with CSS direction and body class management
- TypeScript support included