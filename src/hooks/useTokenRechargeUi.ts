import { useState } from 'react'
import {
  useDownloadTokenWallet,
  useRefreshDownloadTokenWallet,
} from '@/hooks/useDownloadTokens'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useTelegramApp } from '@/hooks/useTelegramApp'
import type { TokenRechargeTier } from '@/components/download-tokens/TokenRechargeSheet'

/** Shared recharge sheet state for Profile + download panels. */
export function useTokenRechargeUi(enabled = true) {
  const { user } = useAppAuth()
  const { openLink, showAlert } = useTelegramApp()
  const [sheetOpen, setSheetOpen] = useState(false)
  const {
    data: wallet,
    isPending: walletPending,
  } = useDownloadTokenWallet(enabled)
  const refreshMutation = useRefreshDownloadTokenWallet()

  const walletEnabled = wallet?.wallet_enabled === true
  const balance = wallet?.balance ?? 0
  const tiers = wallet?.tiers ?? []

  const openRechargeSheet = () => setSheetOpen(true)

  const confirmTier = (tier: TokenRechargeTier) => {
    if (!tier.recharge_url) {
      showAlert('لینک پرداخت در دسترس نیست')
      return
    }
    setSheetOpen(false)
    openLink(tier.recharge_url)
  }

  const checkPayment = async () => {
    try {
      const result = await refreshMutation.mutateAsync()
      if (result.credited > 0) {
        showAlert(`شارژ انجام شد · موجودی ${result.wallet.balance} توکن`)
        setSheetOpen(false)
        return
      }
      showAlert(
        'پرداخت جدیدی پیدا نشد. اگر همین الان پرداخت کردید، چند لحظه صبر کنید و دوباره بزنید.'
      )
    } catch (e) {
      showAlert(e instanceof Error ? e.message : 'خطا در بررسی پرداخت')
    }
  }

  return {
    walletEnabled,
    walletPending,
    balance,
    tiers,
    telegramUserId: user?.id ?? null,
    sheetOpen,
    setSheetOpen,
    openRechargeSheet,
    confirmTier,
    checkPayment,
    checkingPayment: refreshMutation.isPending,
  }
}
