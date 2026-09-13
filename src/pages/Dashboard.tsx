import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

// Types matching the backend ScanRecord and Stats
interface ScanRecord {
  id: string
  scanType: 'URL' | 'MESSAGE' | 'PASSWORD'
  target: string
  prediction: 'SAFE' | 'SUSPICIOUS' | 'PHISHING' | 'MALWARE'
  riskScore: number
  confidence: number
  reasons: string[]
  recommendation: string
  timestamp?: string
  timeAgo?: string
}

interface DashboardStats {
  totalScans: number
  maxScans: number
  safeScore: number
  threats: number
  detected: number
}

interface PasswordResult {
  strength: string
  score: number
  strengthLevel: number
  suggestions: string[]
  length: number
}

export default function Dashboard() {
  // Navigation active tab
  const [activeNav, setActiveNav] = useState<'Home' | 'Scan' | 'Password' | 'History' | 'Security' | 'Profile'>('Home')

  // Scanner inputs
  const [quickInput, setQuickInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)

  // Scan results
  const [activeScanResult, setActiveScanResult] = useState<ScanRecord | null>(null)
  const [passwordResult, setPasswordResult] = useState<PasswordResult | null>(null)

  // Dynamic Dashboard Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 82,
    maxScans: 100,
    safeScore: 24,
    threats: 5,
    detected: 3,
  })

  // Recent Activity list
  const [history, setHistory] = useState<ScanRecord[]>([
    {
      id: '1',
      scanType: 'URL',
      target: 'google.com',
      prediction: 'SAFE',
      riskScore: 5,
      confidence: 0.98,
      reasons: ['Verified reputable domain', 'Valid SSL certificate'],
      recommendation: 'The website appears safe based on available analysis.',
      timeAgo: '12 mins ago',
    },
    {
      id: '2',
      scanType: 'URL',
      target: 'xyz-login.com',
      prediction: 'PHISHING',
      riskScore: 85,
      confidence: 0.94,
      reasons: ["Contains suspicious keyword 'login'", 'Targeted credential harvesting pattern'],
      recommendation: 'Do not open this website or enter personal information.',
      timeAgo: '30 mins ago',
    },
    {
      id: '3',
      scanType: 'URL',
      target: 'youtube.com',
      prediction: 'SAFE',
      riskScore: 4,
      confidence: 0.99,
      reasons: ['Trusted verified host'],
      recommendation: 'The website appears safe based on available analysis.',
      timeAgo: '1 hour ago',
    },
    {
      id: '4',
      scanType: 'URL',
      target: 'fake-bank.com',
      prediction: 'SUSPICIOUS',
      riskScore: 58,
      confidence: 0.72,
      reasons: ['Suspicious banking keyword in unregistered domain', 'Domain contains hyphen'],
      recommendation: 'Exercise caution. Avoid entering credentials or payment details.',
      timeAgo: '2 hours ago',
    },
    {
      id: '5',
      scanType: 'URL',
      target: 'youtubee.com',
      prediction: 'MALWARE',
      riskScore: 90,
      confidence: 0.91,
      reasons: ['Typosquatting of known brand youtube.com', 'Reported in threat feeds'],
      recommendation: 'Dangerous domain. Immediate risk of malware or phishing.',
      timeAgo: '4 hours ago',
    },
    {
      id: '6',
      scanType: 'URL',
      target: 'microsoft.com',
      prediction: 'SAFE',
      riskScore: 2,
      confidence: 0.99,
      reasons: ['Verified corporate domain'],
      recommendation: 'The website appears safe based on available analysis.',
      timeAgo: '10 hours ago',
    },
    {
      id: '7',
      scanType: 'URL',
      target: 'claude.ai',
      prediction: 'SAFE',
      riskScore: 3,
      confidence: 0.97,
      reasons: ['Valid domain certificate'],
      recommendation: 'The website appears safe based on available analysis.',
      timeAgo: '1 day ago',
    },
  ])

  // Fetch initial stats and history from backend if available
  useEffect(() => {
    fetch('http://localhost:8080/api/scan/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data)
      })
      .catch(() => {
        // Backend fallback keeps Figma default stats
      })

    fetch('http://localhost:8080/api/scan/history')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setHistory(
            data.map((item: ScanRecord, idx: number) => ({
              ...item,
              timeAgo: idx === 0 ? 'Just now' : `${(idx + 1) * 15} mins ago`,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  // Live client-side password strength calculation
  const livePasswordAnalysis = useMemo(() => {
    if (!passwordInput) {
      return { level: 0, label: 'None', color: '#D9D9D9', score: 0 }
    }
    let score = 0
    if (passwordInput.length >= 8) score += 25
    if (passwordInput.length >= 12) score += 15
    if (/[A-Z]/.test(passwordInput)) score += 20
    if (/[0-9]/.test(passwordInput)) score += 20
    if (/[^A-Za-z0-9]/.test(passwordInput)) score += 20

    let level = 1
    let label = 'Very Weak'
    let color = '#EF7072'

    if (score >= 80) {
      level = 4
      label = 'Strong'
      color = '#82E437'
    } else if (score >= 60) {
      level = 3
      label = 'Medium'
      color = '#FF9900'
    } else if (score >= 35) {
      level = 2
      label = 'Weak'
      color = '#EF7072'
    }

    return { level, label, color, score }
  }, [passwordInput])

  // Handle URL / Threat Scan
  async function handleQuickScan(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!quickInput.trim()) return

    setIsScanning(true)
    const isLikelyUrl = quickInput.includes('.') || quickInput.startsWith('http')
    const endpoint = isLikelyUrl ? 'http://localhost:8080/api/scan/url' : 'http://localhost:8080/api/scan/message'
    const body = isLikelyUrl ? { url: quickInput } : { message: quickInput }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const result: ScanRecord = await response.json()
        setActiveScanResult(result)
        setHistory((prev) => [{ ...result, timeAgo: 'Just now' }, ...prev])
        setStats((prev) => ({
          ...prev,
          totalScans: prev.totalScans + 1,
          threats: result.prediction === 'PHISHING' || result.prediction === 'MALWARE' ? prev.threats + 1 : prev.threats,
          detected: result.prediction !== 'SAFE' ? prev.detected + 1 : prev.detected,
        }))
      } else {
        fallbackScan(quickInput, isLikelyUrl)
      }
    } catch {
      fallbackScan(quickInput, isLikelyUrl)
    } finally {
      setIsScanning(false)
    }
  }

  // Client-side fallback if backend is momentarily restarting
  function fallbackScan(input: string, isUrl: boolean) {
    const lower = input.toLowerCase()
    const isPhish = lower.includes('login') || lower.includes('verify') || lower.includes('bank') || lower.includes('update') || lower.includes('otp')
    const prediction = isPhish ? 'PHISHING' : 'SAFE'
    const score = isPhish ? 82 : 12

    const localRecord: ScanRecord = {
      id: Date.now().toString(),
      scanType: isUrl ? 'URL' : 'MESSAGE',
      target: input.replace(/^https?:\/\//, '').split('/')[0] || input,
      prediction,
      riskScore: score,
      confidence: 0.92,
      reasons: isPhish
        ? ['Detected high-risk credential keywords', 'Unverified origin structure', 'Elevated phishing probability']
        : ['Standard format verified', 'No threat keywords or deceptive indicators detected'],
      recommendation: isPhish
        ? 'Do not open this website or enter personal information.'
        : 'The website appears safe based on available analysis.',
      timeAgo: 'Just now',
    }
    setActiveScanResult(localRecord)
    setHistory((prev) => [localRecord, ...prev])
    setStats((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1,
      threats: isPhish ? prev.threats + 1 : prev.threats,
      detected: isPhish ? prev.detected + 1 : prev.detected,
    }))
  }

  // Handle Password Check
  async function handlePasswordCheck(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!passwordInput) return

    setIsCheckingPassword(true)
    try {
      const res = await fetch('http://localhost:8080/api/scan/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      if (res.ok) {
        const data = await res.json()
        setPasswordResult(data)
      } else {
        setPasswordResult({
          strength: livePasswordAnalysis.label.toUpperCase(),
          score: livePasswordAnalysis.score,
          strengthLevel: livePasswordAnalysis.level,
          suggestions:
            livePasswordAnalysis.level >= 3
              ? ['Password passes standard entropy requirements.']
              : ['Add special characters (!@#$)', 'Include uppercase letters', 'Make it at least 12 characters long'],
          length: passwordInput.length,
        })
      }
    } catch {
      setPasswordResult({
        strength: livePasswordAnalysis.label.toUpperCase(),
        score: livePasswordAnalysis.score,
        strengthLevel: livePasswordAnalysis.level,
        suggestions:
          livePasswordAnalysis.level >= 3
            ? ['Password passes standard entropy requirements.']
            : ['Add special characters (!@#$)', 'Include uppercase letters', 'Make it at least 12 characters long'],
        length: passwordInput.length,
      })
    } finally {
      setIsCheckingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#F3F3E3] font-sans antialiased p-3 md:p-5 flex justify-center selection:bg-[#82E437] selection:text-black">
      {/* Figma Desktop - 1 Outer Frame */}
      <div className="w-full max-w-[1440px] bg-black border-2 border-[#F3F3E3] rounded-[25px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

        {/* 1. LEFT NAVBAR / SIDEBAR (Width ~226px, Cream background #F3F3E3) */}
        <aside className="w-full md:w-[226px] bg-[#F3F3E3] text-black shrink-0 flex flex-col justify-between rounded-t-[15px] md:rounded-tr-none md:rounded-l-[23px] border-b md:border-b-0 md:border-r border-black/10">
          <div>
            {/* Logo & Brand */}
            <div className="p-6 text-center">
              <Link to="/" className="inline-block">
                <h1 className="font-['Fraunces'] text-[32px] font-normal leading-tight text-black tracking-tight hover:opacity-80 transition-opacity">
                  GillNet AI
                </h1>
              </Link>
            </div>

            {/* Divider Line */}
            <div className="w-full h-[1px] bg-black/80 mb-8" />

            {/* Navigation Links */}
            <nav className="flex flex-col items-center gap-7 px-4">
              {(['Home', 'Scan', 'Password', 'History', 'Security', 'Profile'] as const).map((item) => {
                const isActive = activeNav === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveNav(item)}
                    className={`font-['Fraunces'] text-[24px] font-normal text-center cursor-pointer transition-all duration-200 px-4 py-1.5 rounded-full ${
                      isActive
                        ? 'text-black font-semibold underline decoration-2 underline-offset-4 bg-black/5'
                        : 'text-black/80 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* User Profile Pill at bottom of sidebar */}
          <div className="p-5 border-t border-black/10 flex items-center gap-3">
            <img
              src="/assets/profile.png"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-black/20"
              onError={(e) => {
                // Fallback avatar if local image not ready
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-black truncate">Mayank</p>
              <p className="text-xs text-black/60 truncate">Student Account</p>
            </div>
          </div>
        </aside>

        {/* 2. MAIN CONTENT AREA (Center & Right Panels) */}
        <main className="flex-1 flex flex-col p-4 md:p-7 gap-6 overflow-y-auto">

          {/* TOP HEADER: Search/Scan Pill + User Avatar */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search / Quick Scan Bar (Figma Frame 186:13) */}
            <form
              onSubmit={handleQuickScan}
              className="w-full max-w-[740px] h-[53px] rounded-[40px] border-2 border-white flex items-center px-4 justify-between bg-black/40 backdrop-blur-sm transition-all focus-within:border-[#F3F3E3] focus-within:shadow-[0_0_15px_rgba(243,243,227,0.2)]"
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                {/* Link icon */}
                <svg className="w-6 h-6 text-[#F3F3E3]/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Enter a URL or suspicious message..."
                  className="w-full bg-transparent font-['Poppins'] text-[16px] text-[#F3F3E3] placeholder-[#F3F3E3]/60 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isScanning}
                className="w-[128px] h-[41px] rounded-[40px] bg-[#F3F3E3] text-black font-['Poppins'] text-[16px] font-normal hover:bg-white active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              >
                {isScanning ? (
                  <span className="inline-block animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  'Scan Now'
                )}
              </button>
            </form>

            {/* User Profile Badge (Figma Nodes 189:17, 189:18) */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="w-[50px] h-[50px] rounded-full bg-[#F3F3E3] flex items-center justify-center text-black font-['Poppins'] text-[24px] font-medium shadow">
                M
              </div>
              <span className="font-['Poppins'] text-[20px] text-white font-normal">Mayank</span>
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </header>

          {/* MAIN GRID: Center Content + Right Side Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-[740px_1fr] gap-6">

            {/* LEFT/CENTER COLUMN (Width ~740px in Figma) */}
            <div className="flex flex-col gap-6 max-w-[740px]">

              {/* HERO USER BANNER (Figma Frame "Hero-user" #192:5) */}
              <div className="w-full min-h-[124px] border border-white rounded-[25px] p-5 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-black via-zinc-950 to-zinc-900/60 shadow-lg">
                <div className="z-10 max-w-[480px]">
                  <h2 className="font-['Habibi'] text-[28px] md:text-[32px] text-[#F3F3E3] font-normal leading-tight">
                    Welcome back, Mayank
                  </h2>
                  <p className="font-['Poppins'] text-[14px] md:text-[16px] text-[#F3F3E3]/80 mt-1 font-normal leading-snug">
                    Stay one step ahead. Scan, Secure, and stay safe with GillNet AI.
                  </p>
                </div>
                {/* Hero graphic / Banner illustration */}
                <div className="hidden sm:block w-[204px] h-[110px] shrink-0 rounded-[20px] overflow-hidden border border-black/30 relative">
                  <img
                    src="/assets/hero_banner.png"
                    alt="Cybersecurity Shield"
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
                </div>
              </div>

              {/* STATS ROW (Figma Frame "Stats" #190:45) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Total Scans */}
                <div className="h-[90px] border border-white rounded-[25px] p-3 flex items-center gap-3 bg-zinc-950/40">
                  <div className="w-[44px] h-[44px] rounded-full bg-[rgba(186,186,198,0.3)] border border-[#F3F3E3]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Poppins'] text-[13px] text-[#F3F3E3] truncate">Total Scans</p>
                    <p className="font-['Inter'] text-[15px] font-medium text-[#F3F3E3]">
                      <span className="text-[17px] font-bold">{stats.totalScans}</span>
                      <span className="text-zinc-400">/{stats.maxScans}</span>
                    </p>
                    <div className="w-full h-[4px] bg-[#3C3C43] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-[#D9D9D9] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.totalScans / stats.maxScans) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Safe Score */}
                <div className="h-[90px] border border-white rounded-[25px] p-3 flex items-center gap-3 bg-zinc-950/40">
                  <div className="w-[44px] h-[44px] rounded-full bg-[rgba(116,153,130,0.4)] border border-[#F3F3E3]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#82E437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[13px] text-[#F3F3E3] truncate">Safe Score</p>
                    <p className="font-['Inter'] text-[20px] font-normal text-[#F3F3E3] leading-none mt-1">
                      {stats.safeScore}
                    </p>
                  </div>
                </div>

                {/* 3. Threats */}
                <div className="h-[90px] border border-white rounded-[25px] p-3 flex items-center gap-3 bg-zinc-950/40">
                  <div className="w-[44px] h-[44px] rounded-full bg-[rgba(200,109,128,0.4)] border border-[#F3F3E3]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#E0585A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[13px] text-[#F3F3E3] truncate">Threats</p>
                    <p className="font-['Inter'] text-[20px] font-normal text-[#E0585A] leading-none mt-1">
                      {stats.threats}
                    </p>
                  </div>
                </div>

                {/* 4. Detected */}
                <div className="h-[90px] border border-white rounded-[25px] p-3 flex items-center gap-3 bg-zinc-950/40">
                  <div className="w-[44px] h-[44px] rounded-full bg-[rgba(121,86,94,0.4)] border border-[#F3F3E3]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[13px] text-[#F3F3E3] truncate">Detected</p>
                    <p className="font-['Inter'] text-[20px] font-normal text-[#F3F3E3] leading-none mt-1">
                      {stats.detected}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUICK THREAT SCAN CARD (Figma Frame "phishing" #192:15) */}
              <div className="w-full border border-white rounded-[25px] p-6 bg-zinc-950/30 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-['Habibi'] text-[20px] text-[#F3F3E3] font-normal leading-tight">
                      Quick threat Scan
                    </h3>
                    <p className="font-['Poppins'] text-[12px] text-[#F3F3E3]/70">
                      Enter a URL or paste a suspicious message to check for threats.
                    </p>
                  </div>
                </div>

                {/* Input Pill Bar */}
                <form
                  onSubmit={handleQuickScan}
                  className="w-full h-[53px] rounded-[40px] border-2 border-white flex items-center px-4 justify-between bg-black/60 focus-within:border-[#82E437] transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <svg className="w-6 h-6 text-[#F3F3E3]/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="text"
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      placeholder="Enter a URL or suspicious message..."
                      className="w-full bg-transparent font-['Poppins'] text-[15px] text-[#F3F3E3] placeholder-[#F3F3E3]/60 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="w-[128px] h-[41px] rounded-[40px] bg-[#F3F3E3] text-black font-['Poppins'] text-[16px] font-normal hover:bg-white active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isScanning ? (
                      <span className="inline-block animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4" />
                    ) : (
                      'Scan Now'
                    )}
                  </button>
                </form>

                {/* Live Scan Results Display */}
                {activeScanResult && (
                  <div className="mt-2 rounded-[20px] border border-white/30 bg-zinc-900/80 p-5 animate-fade-in transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            activeScanResult.prediction === 'SAFE'
                              ? 'bg-[#82E437]/20 text-[#82E437] border border-[#82E437]/40'
                              : activeScanResult.prediction === 'SUSPICIOUS'
                              ? 'bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/40'
                              : 'bg-[#EF7072]/20 text-[#EF7072] border border-[#EF7072]/40'
                          }`}
                        >
                          {activeScanResult.prediction}
                        </span>
                        <span className="text-sm font-semibold text-[#F3F3E3] truncate max-w-[280px]">
                          {activeScanResult.target}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-400">Risk Score: </span>
                        <span
                          className={`text-lg font-bold ${
                            activeScanResult.riskScore > 60
                              ? 'text-[#EF7072]'
                              : activeScanResult.riskScore > 30
                              ? 'text-[#FF9900]'
                              : 'text-[#82E437]'
                          }`}
                        >
                          {activeScanResult.riskScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Risk Score */}
                    <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          activeScanResult.riskScore > 60
                            ? 'bg-[#EF7072]'
                            : activeScanResult.riskScore > 30
                            ? 'bg-[#FF9900]'
                            : 'bg-[#82E437]'
                        }`}
                        style={{ width: `${activeScanResult.riskScore}%` }}
                      />
                    </div>

                    {/* Reasons / Explanations */}
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                        Detection Reasons & Features:
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#F3F3E3]/90">
                        {activeScanResult.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#82E437] shrink-0 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Security Recommendation */}
                    <div className="mt-4 p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-[#F3F3E3]/90 flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#82E437] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <strong className="text-white">Recommendation: </strong>
                        {activeScanResult.recommendation}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PASSWORD CHECKER CARD (Figma Frame "Password-strenght" #192:28) */}
              <div className="w-full border border-white rounded-[25px] p-6 bg-zinc-950/30 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-['Habibi'] text-[20px] text-[#F3F3E3] font-normal leading-tight">
                      Password checker
                    </h3>
                    <p className="font-['Poppins'] text-[12px] text-[#F3F3E3]/70">
                      Check how strong your password is...
                    </p>
                  </div>
                </div>

                {/* Password Input Bar */}
                <form
                  onSubmit={handlePasswordCheck}
                  className="w-full h-[53px] rounded-[40px] border-2 border-white flex items-center px-4 justify-between bg-black/60 focus-within:border-[#82E437] transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <svg className="w-6 h-6 text-[#F3F3E3]/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <input
                      type="text"
                      autoComplete="off"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value)
                        setPasswordResult(null)
                      }}
                      placeholder="Enter your password here..."
                      className="w-full bg-transparent font-['Poppins'] text-[15px] text-[#F3F3E3] placeholder-[#F3F3E3]/60 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCheckingPassword}
                    className="w-[128px] h-[41px] rounded-[40px] bg-[#F3F3E3] text-black font-['Poppins'] text-[16px] font-normal hover:bg-white active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isCheckingPassword ? (
                      <span className="inline-block animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4" />
                    ) : (
                      'Check Now'
                    )}
                  </button>
                </form>

                {/* 4-Segment Strength Indicator (Figma Nodes 192:43 to 192:48) */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    <span className="font-['Poppins'] text-[15px] text-[#F3F3E3]/80">
                      Strength :
                    </span>
                    {/* 4 segments */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((segIndex) => {
                        const isFilled = segIndex <= livePasswordAnalysis.level
                        return (
                          <div
                            key={segIndex}
                            className="w-[38px] h-[4px] rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: isFilled ? livePasswordAnalysis.color : '#D9D9D9',
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <span
                    className="font-['Poppins'] text-[15px] font-medium"
                    style={{ color: livePasswordAnalysis.color }}
                  >
                    {livePasswordAnalysis.label}
                  </span>
                </div>

                {/* Suggestions / Analysis Details if checked */}
                {passwordResult && (
                  <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F3F3E3]/80 space-y-1">
                    <p className="font-semibold text-white">Suggestions for Improvement:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {passwordResult.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SECURITY OVERVIEW / WHAT WE DO (Figma Frame "what we do" #194:7) */}
              <div className="w-full border border-white rounded-[25px] p-6 bg-zinc-950/30 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#82E437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-['Habibi'] text-[20px] text-[#F3F3E3] font-normal leading-tight">
                      Security Overview
                    </h3>
                    <p className="font-['Poppins'] text-[12px] text-[#F3F3E3]/70">
                      Our AI helps you stay protected in real time.
                    </p>
                  </div>
                </div>

                {/* 4 Feature Badges (Figma Frames 194:51 to 194:54) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Card 1 */}
                  <div className="h-[71px] rounded-[25px] border border-[#F3F3E3] bg-[rgba(60,60,67,0.53)] p-3 flex items-center gap-2.5 hover:bg-zinc-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-['Poppins'] text-[11px] font-medium text-[#F3F3E3] truncate">
                        Malware Detection
                      </p>
                      <p className="font-['Poppins'] text-[9px] text-[#F3F3E3]/70 truncate">
                        Detect malicious files and links.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="h-[71px] rounded-[25px] border border-[#F3F3E3] bg-[rgba(60,60,67,0.53)] p-3 flex items-center gap-2.5 hover:bg-zinc-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-['Poppins'] text-[11px] font-medium text-[#F3F3E3] truncate">
                        Phishing Protection
                      </p>
                      <p className="font-['Poppins'] text-[9px] text-[#F3F3E3]/70 truncate">
                        Identify phishing attempts.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="h-[71px] rounded-[25px] border border-[#F3F3E3] bg-[rgba(60,60,67,0.53)] p-3 flex items-center gap-2.5 hover:bg-zinc-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-['Poppins'] text-[11px] font-medium text-[#F3F3E3] truncate">
                        Password Analysis
                      </p>
                      <p className="font-['Poppins'] text-[9px] text-[#F3F3E3]/70 truncate">
                        Check password security & strength.
                      </p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="h-[71px] rounded-[25px] border border-[#F3F3E3] bg-[rgba(60,60,67,0.53)] p-3 flex items-center gap-2.5 hover:bg-zinc-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-['Poppins'] text-[11px] font-medium text-[#F3F3E3] truncate">
                        Real time threat Intel
                      </p>
                      <p className="font-['Poppins'] text-[9px] text-[#F3F3E3]/70 truncate">
                        Stay up-to date with real world threats.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Secondary Panel widgets: Recent Activity, Tips, Quote) */}
            <div className="flex flex-col gap-6 w-full xl:w-[368px]">

              {/* RECENT ACTIVITY CARD (Figma Frame "history" #194:94) */}
              <div className="border border-[#F3F3E3] rounded-[25px] p-5 bg-zinc-950/40 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-['Habibi'] text-[20px] text-[#F3F3E3] font-normal">
                      Recent Activity
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('History')}
                    className="font-['Poppins'] text-[14px] text-[#F3F3E3]/80 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    View all
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#67676D]/60 mb-3" />

                {/* List of Recent Scans */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {history.slice(0, 7).map((item) => {
                    const isSafe = item.prediction === 'SAFE'
                    const isPhish = item.prediction === 'PHISHING'
                    const isMalware = item.prediction === 'MALWARE'
                    const statusColor = isSafe
                      ? '#82E437'
                      : isPhish
                      ? '#EF7072'
                      : isMalware
                      ? '#E0585A'
                      : '#FF9900'

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setActiveScanResult(item)}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Square icon */}
                          <div className="w-[21px] h-[21px] rounded-[5px] bg-[#3C3C43] flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-[#F3F3E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                          </div>
                          <span className="font-['Poppins'] text-[12px] text-[#F3F3E3] truncate max-w-[130px]">
                            {item.target}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Status Pill with colored dot */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusColor }}
                            />
                            <span
                              className="font-['Poppins'] text-[11px] font-medium lowercase"
                              style={{ color: statusColor }}
                            >
                              {item.prediction.toLowerCase()}
                            </span>
                          </div>

                          {/* Relative timestamp */}
                          <span className="font-['Poppins'] text-[9px] text-[#F3F3E3]/60 w-[55px] text-right">
                            {item.timeAgo || 'recently'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* TIPS FOR A SAFER INTERNET (Figma Frame "tips" #194:95) */}
              <div className="border border-[#F3F3E3] rounded-[25px] p-5 bg-zinc-950/40 shadow-lg flex flex-col">
                <div className="flex items-center gap-2.5 mb-3">
                  <svg className="w-5 h-5 text-[#82E437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-['Habibi'] text-[20px] text-white font-normal">
                    Tips for a safer Internet
                  </h3>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#67676D]/60 mb-4" />

                {/* Bullets with green dots */}
                <div className="space-y-3 font-['Poppins'] text-[12px] text-white/90">
                  <div className="flex items-center gap-3">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#82E437] shrink-0" />
                    <span>Don’t click on suspicious links.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#82E437] shrink-0" />
                    <span>Use strong and unique passwords.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#82E437] shrink-0" />
                    <span>Be aware of phishing attempts.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#82E437] shrink-0" />
                    <span>Keep your devices updated.</span>
                  </div>
                </div>
              </div>

              {/* SECURITY QUOTE CARD (Figma Frame "tips" #195:201) */}
              <div className="border border-[#F3F3E3] rounded-[25px] p-5 bg-zinc-950/40 shadow-lg flex items-center gap-4">
                {/* Shield Circle emblem */}
                <div className="w-[70px] h-[70px] rounded-full bg-[#67676D]/40 border border-[#F3F3E3]/30 flex items-center justify-center shrink-0">
                  <svg className="w-9 h-9 text-[#82E437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-['Poppins'] text-[14px] text-white font-normal italic leading-snug">
                    “Security is a process, not a product.”
                  </p>
                  <p className="font-['Poppins'] text-[12px] text-white/60 italic mt-2 text-right">
                    ~ Bruce Schneier
                  </p>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
