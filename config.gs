/**
 * CONFIGURAZIONE PRINCIPALE - Google Ads Costi Script
 * 
 * MODIFICA QUESTO FILE CON LE TUE CREDENZIALI E IMPOSTAZIONI
 */

// ============================================================================
// CONFIGURAZIONE PRINCIPALE
// ============================================================================

const CONFIG = {
  
  // 📊 NOME DEL FOGLIO DI DESTINAZIONE
  SHEET_NAME: 'Costi Google Ads',
  
  // 📝 NOMI DELLE COLONNE (modifica solo se necessario)
  TIMESTAMP_COLUMN: 'Data Estrazione',
  CUSTOMER_ID_COLUMN: 'Customer ID',
  ACCOUNT_NAME_COLUMN: 'Nome Account',
  MONTH_COLUMN: 'Mese',
  COST_COLUMN: 'Costo (EUR)',
  
  // 📅 CONFIGURAZIONE INTERVALLO DATE
  DATE_RANGE: {
    // true = usa mese precedente automaticamente, false = usa date personalizzate
    USE_PREVIOUS_MONTH: true,
    
    // Date personalizzate (usate solo se USE_PREVIOUS_MONTH = false)
    CUSTOM_START_DATE: '2024-01-01',  // Formato: YYYY-MM-DD
    CUSTOM_END_DATE: '2024-01-31'     // Formato: YYYY-MM-DD
  }
};

// ============================================================================
// CONFIGURAZIONE API GOOGLE ADS
// ============================================================================

const API_CONFIG = {
  // 🔑 DEVELOPER TOKEN - Richiedi su g.co/adwords/apitoken
  DEVELOPER_TOKEN: 'INSERISCI_IL_TUO_DEVELOPER_TOKEN_QUI',
  
  // 🔑 CLIENT ID - Dal file JSON scaricato da Google Cloud Console
  CLIENT_ID: 'INSERISCI_IL_TUO_CLIENT_ID_QUI',
  
  // 🔑 CLIENT SECRET - Dal file JSON scaricato da Google Cloud Console
  CLIENT_SECRET: 'INSERISCI_IL_TUO_CLIENT_SECRET_QUI',
  
  // 🔑 REFRESH TOKEN - Ottenuto dopo la prima autorizzazione
  REFRESH_TOKEN: 'INSERISCI_IL_TUO_REFRESH_TOKEN_QUI',
  
  // 🌐 ENDPOINT API (NON MODIFICARE)
  BASE_URL: 'https://googleads.googleapis.com/v21',
  
  // 🔐 SCOPES OAuth (NON MODIFICARE)
  SCOPES: [
    'https://www.googleapis.com/auth/adwords'
  ]
};