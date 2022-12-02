import React from "react";
import clsx from "clsx";

import icons from "icons";

import styles from "./Icon.module.scss";

export type IconNamesType = keyof typeof icons;

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  className?: string;
  name: IconNamesType;
  size?: "small" | "medium" | "large" | "x-small";
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

export function Icon({
  className,
  name,
  onClick,
  size = "medium",
  ...other
}: IconProps) {
  const { viewBox, url } = icons[name] as never;

  return (
    <svg
      viewBox={viewBox}
      className={clsx(styles.root, styles[size], className)}
      onClick={onClick}
      {...other}
    >
      <use xlinkHref={`/${String(url)}`} />
    </svg>
  );
}
