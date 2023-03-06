import type { Href } from 'types';

export function formLinkByDaoId(daoId: string, href: Href) {
  return `/daos/${daoId}/${href}`;
}
