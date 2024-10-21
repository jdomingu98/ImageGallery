/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_UNSPLASH_ACCESS_KEY: string;
    VITE_UNSPLASH_SECRET: string;
    VITE_UNSPLASH_REDIRECT_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}