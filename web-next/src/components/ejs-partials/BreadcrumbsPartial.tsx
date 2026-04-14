import { Fragment } from 'react';
import type { BreadcrumbItem } from './types';

type Props = {
  breadcrumbs?: BreadcrumbItem[];
};

export default function BreadcrumbsPartial({ breadcrumbs = [] }: Props) {
  if (!breadcrumbs.length) return null;

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-container">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <a href="/">
            <i className="fa-solid fa-house"></i> Home
          </a>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={`${crumb.url}-${index}`}>
              <li className="breadcrumb-separator">
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li className={`breadcrumb-item ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
                {isLast ? (
                  <span>{crumb.name}</span>
                ) : (
                  <a href={crumb.url}>{crumb.name}</a>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
