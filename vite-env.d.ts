/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORAGE_KEY?: string;
  readonly VITE_AUTOSAVE_DELAY?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
