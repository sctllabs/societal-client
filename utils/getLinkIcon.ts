import { IconNamesType } from 'components/ui-kit/Icon';

export function getLinkIcon(link: string): IconNamesType {
  if (link.includes('apple.com')) {
    return 'social-apple';
  }
  if (link.includes('behance.com')) {
    return 'social-behance';
  }
  if (link.includes('discord.com')) {
    return 'social-discord';
  }
  if (link.includes('dribble.com')) {
    return 'social-dribble';
  }
  if (link.includes('mailto')) {
    return 'social-email';
  }
  if (link.includes('facebook.com')) {
    return 'social-facebook';
  }
  if (link.includes('github.com')) {
    return 'social-github';
  }
  if (link.includes('gitlab.com')) {
    return 'social-gitlab';
  }
  if (link.includes('google.com')) {
    return 'social-google';
  }
  if (link.includes('instagram.com')) {
    return 'social-instagram';
  }
  if (link.includes('linkedin.com')) {
    return 'social-linkedin';
  }
  if (link.includes('medium.com')) {
    return 'social-medium';
  }
  if (link.includes('t.me') || link.includes('telegram.com')) {
    return 'social-telegram';
  }
  if (link.includes('tiktok.com')) {
    return 'social-tiktok';
  }
  if (link.includes('twitch.com')) {
    return 'social-twitch';
  }
  if (link.includes('twitter.com')) {
    return 'social-twitter';
  }
  if (link.includes('youtube.com')) {
    return 'social-youtube';
  }
  return 'global';
}
