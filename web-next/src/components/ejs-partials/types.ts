export type SettingsLike = {
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  hours?: string | null;
  email?: string | null;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type SearchProduct = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

export type HeaderPartialProps = {
  settings?: SettingsLike | null;
  search?: string;
  activePage?: string;
  sessionUser?: string | null;
  sessionPhoto?: string | null;
  showAdminLink?: boolean;
};

export type FooterPartialProps = {
  settings?: SettingsLike | null;
  sessionUser?: string | null;
};

export type FlashPartialProps = {
  success?: string[];
  errors?: string[];
};

export type AdminHeaderPartialProps = {
  title: string;
  activePage?: string;
  adminUsername?: string | null;
  globalLowStockCount?: number;
};

export type RemoteScriptNode = {
  src?: string;
  text?: string;
  type?: string;
};

export type RemoteHtmlPayload = {
  bodyHtml: string;
  styles: string[];
  scripts: RemoteScriptNode[];
};
