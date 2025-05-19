import { useRef, useEffect } from 'react'
import { useUserId } from '@/hooks/useUserId'
import { useDocumentRealtime } from '@/hooks/useFirebase'
import { useNavigate, useLocation } from 'react-router-dom'

export const useCustomRouter = () => {
  const { userId } = useUserId()
  const { data } = useDocumentRealtime('users', userId)
  const navigate = useNavigate()
  const location = useLocation()
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    const raw = data?.gameState
    if (!raw) return

    // 1) 先頭に "/" がなければ付与
    const target = raw.startsWith('/') ? raw : `/${raw}`

    // 2) 一度もナビゲートしておらず、かつ現在の pathname と違う場合のみ
    if (!hasNavigatedRef.current && location.pathname !== target) {
      hasNavigatedRef.current = true
      console.log(target, '画面へ遷移します')
      navigate(target, { replace: true })
    }
  }, [data?.gameState, location.pathname, navigate])
}
