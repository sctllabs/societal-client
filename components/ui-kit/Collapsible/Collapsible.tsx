import React from 'react';
import clsx from 'clsx';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import styles from './Collapsible.module.scss';

const { Root: Collapsible, CollapsibleTrigger } = CollapsiblePrimitive;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(function CollapsibleContent({ className, ...props }, ref) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      className={clsx(styles.content, className)}
      {...props}
    />
  );
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
