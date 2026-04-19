import type { ReactNode } from 'react';
import BreadcrumbsPartial from './BreadcrumbsPartial';
import FlashPartial from './FlashPartial';
import FooterPartial from './FooterPartial';
import HeaderPartial from './HeaderPartial';
import HelpWidgetStyles from './HelpWidgetStyles';
import LegacySizingStyles from './LegacySizingStyles';
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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" /><HeaderPartial {...header} settings={settings || header.settings} sessionUser={resolvedSessionUser} />
      <FlashPartial success={success} errors={errors} />
      <BreadcrumbsPartial breadcrumbs={breadcrumbs} />
      {children}
      <FooterPartial settings={settings} sessionUser={resolvedSessionUser} />
      <HelpWidgetStyles />
      <LegacySizingStyles />
    </>
  );
}
