import type { ReactNode } from 'react';
import BreadcrumbsPartial from './BreadcrumbsPartial';
import FlashPartial from './FlashPartial';
import FooterPartial from './FooterPartial';
import HeaderPartial from './HeaderPartial';
import HelpWidgetStyles from './HelpWidgetStyles';
import type { BreadcrumbItem, HeaderPartialProps, SettingsLike } from './types';

type StorefrontShellProps = {
  children: ReactNode;
  header: HeaderPartialProps;
  settings?: SettingsLike | null;
  sessionUser?: string | null;
  breadcrumbs?: BreadcrumbItem[];
  success?: string[];
  errors?: string[];
};

export default function StorefrontShell({
  children,
  header,
  settings,
  sessionUser = null,
  breadcrumbs = [],
  success = [],
  errors = [],
}: StorefrontShellProps) {
  const resolvedSessionUser = sessionUser ?? header.sessionUser ?? null;

  return (
    <>
      <HeaderPartial {...header} settings={settings || header.settings} sessionUser={resolvedSessionUser} />
      <FlashPartial success={success} errors={errors} />
      <BreadcrumbsPartial breadcrumbs={breadcrumbs} />
      {children}
      <FooterPartial settings={settings} sessionUser={resolvedSessionUser} />
      <HelpWidgetStyles />
    </>
  );
}
