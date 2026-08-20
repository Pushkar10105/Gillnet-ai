import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DEMO_SAMPLES,
  scanEmail,
  scanMessage,
  scanPassword,
  scanWebsite,
  type RiskLevel,
  type ScanResult,
} from '../lib/demoHeuristics'

type ToolId = 'email' | 'password' | 'website' | 'message'

const tools: { id: ToolId; n: string; title: string; hint: string }[] = [
  {
    id: 'email',
    n: '01',
    title: 'Email Protection',
    hint: 'Paste a full email. The demo flags phishing language, fake brands, and risky links.',
  },
  {
    id: 'password',
    n: '02',
    title: 'Password Security',
    hint: 'Checked only in your browser. Nothing is saved or sent to a server.',
  },
  {
    id: 'website',
    n: '03',
    title: 'Website Safety',
    hint: 'Looks for HTTP, lookalike domains, IP hosts, and other URL tricks.',
  },
  {
    id: 'message',
    n: '04',
    title: 'Message Protection',
    hint: 'Scan SMS or chat text for OTP scams, fake KYC, and prize lures.',
  },
]

function levelLabel(level: RiskLevel) {
  if (level === 'danger') return 'High risk'
  if (level === 'caution') return 'Needs review'
  return 'Low risk'
}

function ResultCard({ result }: { result: ScanResult }) {
  const bar =
    result.level === 'danger' ? 'bg-black' : result.level === 'caution' ? 'bg-black/55' : 'bg-black/20'

  return (
    <div className="rounded-[20px] border-2 border-black bg-cream p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[14px] italic text-ink">Demo risk score</p>
          <p className="text-[42px] leading-none tracking-[-0.03em]">{result.score}</p>
        </div>
        <p className="rounded-[20px] border border-black px-4 py-2 text-[18px]">{levelLabel(result.level)}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full border border-black">
        <div className={`h-full ${bar}`} style={{ width: `${result.score}%` }} />
      </div>
      <p className="mt-4 text-[18px] font-light italic leading-snug text-ink">{result.summary}</p>
      {result.findings.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {result.findings.map((f) => (
            <li key={f.title} className="border-t border-black/20 pt-3">
              <p className="text-[18px]">{f.title}</p>
              <p className="mt-1 text-[15px] font-light italic text-ink">{f.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6 text-[13px] font-light italic text-black/70">
        Exhibition demo using on-device heuristics — not a live threat-intel feed.
      </p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[16px] italic text-ink">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-[16px] border-2 border-black bg-cream px-4 py-3 font-sans text-[16px] text-ink outline-none focus:bg-white'

export default function Dashboard() {
  const [params, setParams] = useSearchParams()
  const tool = (tools.some((t) => t.id === params.get('tool')) ? params.get('tool') : 'email') as ToolId
  const active = tools.find((t) => t.id === tool) ?? tools[0]

  const [email, setEmail] = useState(DEMO_SAMPLES.emailDanger)
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState(DEMO_SAMPLES.urlDanger)
  const [message, setMessage] = useState(DEMO_SAMPLES.messageDanger)
  const [emailResult, setEmailResult] = useState<ScanResult | null>(null)
  const [urlResult, setUrlResult] = useState<ScanResult | null>(null)
  const [messageResult, setMessageResult] = useState<ScanResult | null>(null)

  const livePassword = useMemo(() => scanPassword(password), [password])

  function selectTool(id: ToolId) {
    setParams({ tool: id })
  }

  function runEmail(e: FormEvent) {
    e.preventDefault()
    setEmailResult(scanEmail(email))
  }

  function runUrl(e: FormEvent) {
    e.preventDefault()
    setUrlResult(scanWebsite(url))
  }

  function runMessage(e: FormEvent) {
    e.preventDefault()
    setMessageResult(scanMessage(message))
  }

  return (
    <div className="min-h-svh bg-cream font-display text-black">
      <header className="sticky top-0 z-40 border-b border-black bg-cream">
        <nav className="mx-auto flex h-[100px] max-w-[1440px] items-center justify-between px-6 md:px-[104px]">
          <Link to="/" className="text-[28px] leading-none lg:text-[32px]">
            GillNet AI
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden text-[16px] italic text-ink sm:block">Demo workspace</p>
            <img
              src="/assets/profile.png"
              alt="Profile"
              className="size-[48px] rounded-full object-contain sm:size-[59px]"
            />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10 md:px-[104px] md:py-14">
        <p className="text-[18px] underline">PROTECTED TOOLS</p>
        <h1 className="mt-2 text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.02em]">
          Try the <span className="font-light italic">demo</span> scanners.
        </h1>
        <p className="mt-4 max-w-[640px] text-[18px] font-light italic leading-snug text-ink">
          Four client-side tools matching the landing-page services. Load a sample, run a
          scan, and show how GillNet AI would warn a user.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((t) => {
            const on = t.id === tool
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTool(t.id)}
                className={`rounded-[20px] border-2 border-black p-5 text-left ${
                  on ? 'bg-black text-cream' : 'bg-cream'
                }`}
              >
                <p className={`text-[12px] ${on ? 'text-cream/80' : 'text-black/70'}`}>Service {t.n}</p>
                <p className="mt-2 text-[22px] leading-tight">{t.title}</p>
              </button>
            )
          })}
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <form
            className="rounded-[20px] border-2 border-black p-6 md:p-8"
            onSubmit={
              tool === 'email' ? runEmail : tool === 'website' ? runUrl : tool === 'message' ? runMessage : (e) => e.preventDefault()
            }
          >
            <h2 className="text-[32px] leading-none">{active.title}</h2>
            <p className="mt-3 text-[16px] font-light italic text-ink">{active.hint}</p>

            {tool === 'email' ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setEmail(DEMO_SAMPLES.emailDanger)
                      setEmailResult(null)
                    }}
                  >
                    Load phishing sample
                  </button>
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setEmail(DEMO_SAMPLES.emailSafe)
                      setEmailResult(null)
                    }}
                  >
                    Load safe sample
                  </button>
                </div>
                <Field label="Email source">
                  <textarea
                    className={`${inputClass} min-h-[220px] resize-y`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <button
                  type="submit"
                  className="mt-5 inline-flex h-[50px] items-center rounded-[20px] bg-black px-6 text-[18px] text-cream"
                >
                  Scan email
                </button>
              </>
            ) : null}

            {tool === 'password' ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => setPassword(DEMO_SAMPLES.passwordWeak)}
                  >
                    Weak sample
                  </button>
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => setPassword(DEMO_SAMPLES.passwordStrong)}
                  >
                    Strong sample
                  </button>
                </div>
                <Field label="Password">
                  <input
                    type="text"
                    autoComplete="off"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type here — local only"
                  />
                </Field>
                <p className="mt-4 text-[14px] italic text-ink">Score updates as you type.</p>
              </>
            ) : null}

            {tool === 'website' ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setUrl(DEMO_SAMPLES.urlDanger)
                      setUrlResult(null)
                    }}
                  >
                    Load phishing URL
                  </button>
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setUrl(DEMO_SAMPLES.urlSafe)
                      setUrlResult(null)
                    }}
                  >
                    Load official URL
                  </button>
                </div>
                <Field label="Website">
                  <input
                    className={inputClass}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                <button
                  type="submit"
                  className="mt-5 inline-flex h-[50px] items-center rounded-[20px] bg-black px-6 text-[18px] text-cream"
                >
                  Analyse URL
                </button>
              </>
            ) : null}

            {tool === 'message' ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setMessage(DEMO_SAMPLES.messageDanger)
                      setMessageResult(null)
                    }}
                  >
                    Load scam SMS
                  </button>
                  <button
                    type="button"
                    className="rounded-[16px] border border-black px-4 py-2 text-[15px]"
                    onClick={() => {
                      setMessage(DEMO_SAMPLES.messageSafe)
                      setMessageResult(null)
                    }}
                  >
                    Load normal chat
                  </button>
                </div>
                <Field label="Message">
                  <textarea
                    className={`${inputClass} min-h-[160px] resize-y`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Field>
                <button
                  type="submit"
                  className="mt-5 inline-flex h-[50px] items-center rounded-[20px] bg-black px-6 text-[18px] text-cream"
                >
                  Scan message
                </button>
              </>
            ) : null}
          </form>

          <div>
            {tool === 'email' && emailResult ? <ResultCard result={emailResult} /> : null}
            {tool === 'password' ? <ResultCard result={livePassword} /> : null}
            {tool === 'website' && urlResult ? <ResultCard result={urlResult} /> : null}
            {tool === 'message' && messageResult ? <ResultCard result={messageResult} /> : null}
            {tool === 'email' && !emailResult ? (
              <EmptyHint text="Run a scan to see phishing findings and a risk score." />
            ) : null}
            {tool === 'website' && !urlResult ? (
              <EmptyHint text="Analyse a URL to reveal host tricks and encryption issues." />
            ) : null}
            {tool === 'message' && !messageResult ? (
              <EmptyHint text="Scan a message to flag OTP, KYC, and prize scams." />
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex min-h-[280px] items-center rounded-[20px] border-2 border-dashed border-black p-8">
      <p className="text-[20px] font-light italic text-ink">{text}</p>
    </div>
  )
}
