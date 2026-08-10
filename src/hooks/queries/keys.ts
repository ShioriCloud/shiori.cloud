export const queryKeys = {
  animeCards: ['anime', 'cards'] as const,
  homeFeatured: (tab: string) => ['home', 'featured', tab] as const,
  homeLatest: (year: number, season: string) => ['home', 'latest', year, season] as const,
  homePopular: ['home', 'popular'] as const,
  homeRecent: ['home', 'recent'] as const,
  homeDonghua: ['home', 'donghua'] as const,
  homeMovies: ['home', 'movies'] as const,
  homeCustomBlocks: ['home', 'custom-blocks', 'v3'] as const,
  animeDetail: (id: string | number) => ['anime', 'detail', 'v2', String(id)] as const,
  animeList: ['anime', 'list'] as const,
  schedule: ['schedule'] as const,
  animeSearch: (filters: Record<string, unknown>) => ['anime', 'search', filters] as const,
  similarAnime: (id: string | number, slugs: string[]) =>
    ['anime', 'similar', String(id), slugs.join(',')] as const,
  translatorLinks: (animeId: string | number) => ['anime', 'translators', String(animeId)] as const,
  anilistNextAiring: (anilistId: number | string) =>
    ['anime', 'anilist-next-airing', String(anilistId)] as const,
  userAnimeList: (telegramUserId: number) => ['user', 'anime-list', telegramUserId] as const,
  notifications: (telegramUserId: number) => ['notifications', telegramUserId] as const,
  notificationPreferences: (telegramUserId: number) =>
    ['notification-preferences', telegramUserId] as const,
  airingReminders: (telegramUserId: number) =>
    ['airing-reminders', telegramUserId] as const,
  animeFavoriteCounts: ['anime', 'favorite-counts'] as const,
  genres: ['anime', 'genres'] as const,
  animeFavoriteCount: (animeId: string | number) =>
    ['anime', 'favorite-count', String(animeId)] as const,
  favoriteAnimeCards: (ids: Array<string | number>) =>
    ['anime', 'favorite-cards', ids.map(String).sort().join(',')] as const,
  downloadTokenBalance: ['download-tokens', 'balance'] as const,
  donationTokenTiers: ['download-tokens', 'tiers'] as const,
  subscriptionMe: ['subscriptions', 'me'] as const,
  subscriptionPlans: ['subscriptions', 'plans'] as const,
  supportTickets: (telegramUserId: number) =>
    ['support-tickets', telegramUserId] as const,
  supportTicket: (telegramUserId: number, ticketId: string) =>
    ['support-tickets', telegramUserId, ticketId] as const,
}
