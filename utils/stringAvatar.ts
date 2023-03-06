import { stringToColor } from './stringToColor';

function pickTextColorBasedOnBgColor(
  bgColor: string,
  lightColor = '#fff',
  darkColor = '#000'
) {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}

export function stringAvatar(name: string) {
  const backgroundColor = stringToColor(name);
  const color = pickTextColorBasedOnBgColor(backgroundColor);

  const splitName = name.split(' ');
  const children = `${splitName[0]?.[0] || ''}${splitName[1]?.[0] || ''}`;

  return {
    color,
    backgroundColor,
    children
  };
}
