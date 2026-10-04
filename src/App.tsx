import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LocaleProvider } from './i18n/LocaleContext'
import { warmUpModel } from './inference/classifier'
import { OnboardingCarousel } from './onboarding/OnboardingCarousel'
import { useOnboarding } from './onboarding/useOnboarding'
import { About } from './pages/About'
import { History } from './pages/History'
import { Home } from './pages/Home'
import { Result } from './pages/Result'
import { Scan } from './pages/Scan'
import './App.css'

function AppRoutes() {
  const { show, finish } = useOnboarding()

  return (
    <>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/periksa" element={<Scan />} />
          <Route path="/hasil/:id" element={<Result />} />
          <Route path="/riwayat" element={<History />} />
          <Route path="/tentang" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {show ? <OnboardingCarousel onDone={finish} /> : null}
    </>
  )
}

export default function App() {
  useEffect(() => {
    void warmUpModel()
  }, [])

  return (
    <LocaleProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LocaleProvider>
  )
}
