import { useMyListStore, type DownloadRecord } from '@/store/myListStore'

export const trackAnimeBrowse = (animeId: string | number) => {
  useMyListStore.getState().recordBrowse(animeId)
}

export const trackEpisodeDownload = (
  entry: Omit<DownloadRecord, 'id' | 'downloadedAt' | 'status'>
) => {
  useMyListStore.getState().recordDownload(entry)
}
