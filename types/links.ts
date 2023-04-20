export type LinkAtom = 'linksAtom' | 'socialsAtom';

export type LinkInputType = {
  title: string;
  subtitle: string;
  label: string;
  atom: LinkAtom;
};
