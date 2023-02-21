declare module '*.scss';

declare module '*.svg' {
  const svg: {
    id: string;
    viewBox: string;
    url: string;
  };
  export default svg;
}

declare module '*.graphql' {
  import { DocumentNode } from 'graphql';

  const Schema: DocumentNode;

  export = Schema;
}
