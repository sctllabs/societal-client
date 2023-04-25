import { SetStateAction, useAtom } from 'jotai';
import { linksAtom, socialsAtom } from 'store/createDao';
import { UNEXPECTED_FIELD_VALUE } from 'constants/errors';
import type { LinkInputType } from 'types';
import { LinkInput } from './LinkInput';

const additionalFields: LinkInputType[] = [
  {
    title: 'Links',
    subtitle:
      'Looking to grow the Community members? Add links to allow people to learn more about your Community.',
    label: 'Add Link',
    atom: 'linksAtom'
  },
  {
    title: 'Socials',
    subtitle:
      'Looking to grow the Community members? Add socials to allow people to learn more about your Community.',
    label: 'Add Social',
    atom: 'socialsAtom'
  }
];

export function Links() {
  const [links, setLinks] = useAtom(linksAtom);
  const [socials, setSocials] = useAtom(socialsAtom);

  return (
    <>
      {additionalFields.map((_additionalField, index) => {
        let state: string[];
        let setState: (update: SetStateAction<string[]>) => void;

        switch (_additionalField.atom) {
          case 'linksAtom': {
            state = links;
            setState = setLinks;
            break;
          }
          case 'socialsAtom': {
            state = socials;
            setState = setSocials;
            break;
          }
          default: {
            throw new Error(UNEXPECTED_FIELD_VALUE);
          }
        }

        return (
          <LinkInput
            autoFocus={index === 0}
            key={_additionalField.title}
            title={_additionalField.title}
            subtitle={_additionalField.subtitle}
            label={_additionalField.label}
            state={state}
            setState={setState}
          />
        );
      })}
    </>
  );
}
