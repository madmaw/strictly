interface ImportMetaEnv {
  readonly PUBLIC_BASE: string | undefined;
  readonly PUBLIC_SITE: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}