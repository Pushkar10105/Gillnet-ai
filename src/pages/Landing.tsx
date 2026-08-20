import { useState } from 'react'
import { Link } from 'react-router-dom'

const ticker =
  'Phishing Protection  •  Scam Detection  •  Password Security  •  AI Powered Cyber Assistant  '

const services = [
  {
    n: '01',
    title: 'Email Protection',
    body: 'Detect phishing emails, malicious attachments, and scan emails before they reach you.',
    bullets: ['Attachment Scanning.', 'URL Scanning.', 'Phishing Detection.'],
  },
  {
    n: '02',
    title: 'Password Security',
    body: 'Strengthen weak passwords, detect vulnerabilities, and protect your accounts before they are compromised.',
    bullets: [
      'Weak Password Detection.',
      'Password Strength Analysis.',
      'Breach Monitoring.',
    ],
  },
  {
    n: '03',
    title: 'Website Safety',
    body: 'Identify malicious websites, phishing pages, and unsafe links before you interact with them.',
    bullets: [
      'Phishing Website Detection.',
      'Malware Scanning.',
      'Safe Browsing Analysis.',
    ],
  },
  {
    n: '04',
    title: 'Message Protection',
    body: 'Detect scam messages, fraudulent links, and suspicious conversations across your messaging platforms.',
    bullets: [
      'Scam Message Detection.',
      'Link Verification.',
      'Behavioral Analysis.',
    ],
  },
]

const team = [
  {
    name: 'Pushkar Bhardwaj',
    role: 'Front-End Developer',
    stack: '(React, HTML, CSS, JS)',
  },
  {
    name: 'Riya Singh',
    role: 'Database Management',
    stack: '(MongoDB. Springboot, BCrypt)',
  },
  {
    name: 'Mayank Trigunayat',
    role: 'Backend Developer',
    extra: '(Team Lead)',
    stack: '(Java, Springboot, MongoDB)',
  },
  {
    name: 'Dhyey Patel',
    role: 'UI/UX Designer & Deployment',
    stack: '(Figma, Vercel, HTML, CSS)',
  },
  {
    name: 'Aman Agarwal',
    role: 'AI/ML Engineer',
    stack: '(Python Fast API & Pytorch)',
  },
]

const threats = [
  { label: 'Scammers', icon: '/assets/icon-users.svg', width: 300 },
  { label: 'Weak Passcode', icon: '/assets/icon-lock.svg', width: 350 },
  { label: 'Phishing Websites', icon: '/assets/icon-globe.svg', width: 400 },
]

function Pill({
  children,
  to,
  filled,
  onClick,
}: {
  children: string
  to?: string
  filled?: boolean
  onClick?: () => void
}) {
  const cls = `inline-flex h-[50px] min-w-[195px] shrink-0 items-center justify-center rounded-[20px] border border-black px-4 text-[20px] leading-none ${
    filled ? 'bg-black text-cream' : 'bg-cream text-black'
  }`
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  )
}

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="bg-cream font-display text-black">
      <header className="sticky top-0 z-40 border-b border-black bg-cream">
        <nav className="mx-auto flex h-[100px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-[104px]">
          <a href="#top" className="shrink-0 text-[28px] leading-none lg:text-[32px]">
            GillNet AI
          </a>
          <div className="hidden items-center gap-[30px] text-[20px] lg:flex">
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </div>
          <Link
            to="/app"
            className="inline-flex h-[50px] w-[150px] shrink-0 items-center justify-center rounded-[20px] bg-black text-[22px] text-cream"
          >
            Login
          </Link>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-[1440px]">
        <section
          id="top"
          className="grid items-start gap-8 px-6 pt-8 pb-6 lg:grid-cols-[1fr_510px] lg:gap-10 lg:px-[97px] lg:pt-6"
        >
          <div className="flex flex-col items-center pt-6 text-center lg:items-center lg:pt-[160px]">
            <h1 className="w-full text-[clamp(48px,8vw,128px)] leading-[0.95] tracking-[-0.02em]">
              Stay <span className="font-light italic">Secure</span>
              <span className="text-[0.5em] font-bold">.</span>
            </h1>
            <h2 className="mt-1 w-full text-[clamp(48px,8vw,128px)] leading-[0.95]">
              <span className="font-light">Stay</span> Ahead
              <span className="text-[0.5em] font-semibold">.</span>
            </h2>
            <p className="mt-8 max-w-[539px] text-[20px] leading-snug text-ink">
              Detect phishing websites, uncover scam messages, strengthen your
              passwords, and protect your digital life with AI-Powered
              Cybersecurity tool.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-[35px]">
              <Pill to="/app">Start Protecting</Pill>
              <Pill filled onClick={() => setDemoOpen(true)}>
                Watch Demo
              </Pill>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[510px]">
            <img
              src="/assets/hero.png"
              alt="GillNet AI cyber assistant"
              className="block h-auto w-full"
            />
          </div>
        </section>

        <p className="mx-auto max-w-[520px] px-6 pb-10 text-center text-[20px] italic leading-snug">
          “The only truly secure system is one that is powered off.” - Gene
          Spafford
        </p>
      </div>

      <div className="h-[100px] overflow-hidden bg-black text-cream">
        <div className="marquee-track flex h-full w-max items-center text-[28px] font-light italic lg:text-[36px]">
          <span className="px-10 whitespace-nowrap">{ticker}</span>
          <span className="px-10 whitespace-nowrap">{ticker}</span>
        </div>
      </div>

      <section
        id="problem"
        className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:px-[80px] lg:py-20"
      >
        <div className="flex min-w-0 items-center justify-center">
          <img
            src="/assets/problem.png"
            alt="Abstract spiral representing digital threats"
            className="block h-auto w-full max-w-[620px]"
          />
        </div>
        <div className="min-w-0 text-right">
          <p className="mb-2 text-[24px] underline">THE PROBLEM</p>
          <h2 className="text-[clamp(36px,5.2vw,72px)] leading-[1.08] tracking-[-0.02em]">
            The Digital <span className="font-light italic">World</span>
            <br />
            Rewards <span className="font-light italic">Convenience</span>.
            <br />
            <span className="font-light italic">Attackers</span> Depend{' '}
            <span className="font-light">On It</span>.
          </h2>
          <p className="ml-auto mt-6 max-w-[636px] text-[18px] font-light italic leading-snug text-ink lg:text-[20px]">
            Every click, password, and message creates an opportunity for
            cybercriminals. Most attacks don&apos;t exploit software—they
            exploit human trust.
          </p>
          <div className="mt-8 flex flex-col items-end gap-5">
            {threats.map((t) => (
              <div
                key={t.label}
                className="flex h-[88px] items-center justify-between gap-4 rounded-[25px] border-2 border-black bg-cream pl-6 pr-3 shadow-[0px_15px_25px_0px_rgba(0,0,0,0.2)] sm:h-[100px]"
                style={{ width: 'min(100%, ' + t.width + 'px)' }}
              >
                <span className="text-left text-[22px] tracking-[-0.02em] sm:text-[28px] lg:text-[32px]">
                  {t.label}
                </span>
                <div className="relative size-[64px] shrink-0 sm:size-[75px]">
                  <img
                    src="/assets/ellipse.svg"
                    alt=""
                    className="absolute inset-0 size-full"
                  />
                  <img
                    src={t.icon}
                    alt=""
                    className="absolute top-1/2 left-1/2 size-[32px] -translate-x-1/2 -translate-y-1/2 object-contain sm:size-[35px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="solution"
        className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:px-[100px] lg:py-16"
      >
        <div>
          <p className="mb-2 text-[24px] underline">THE SOLUTION</p>
          <h2 className="text-[clamp(42px,6vw,88px)] leading-[1.05] tracking-[-0.02em]">
            One <span className="font-light italic">Platform</span>,
            <br />
            <span className="font-light italic">Every</span> threat.
          </h2>
          <p className="mt-6 max-w-[453px] text-[20px] font-light italic leading-snug text-ink">
            GillNet AI combines the power of Artificial Intelligence with
            Cybersecurity to detect phishing attempts, scam messages, weak
            passwords and suspicious activity - Before they cause any damage.
          </p>
          <p className="mt-8 text-[20px] italic text-black/90">
            Detect • Analyze • Warn • Protect
          </p>
        </div>
        <div className="min-w-0">
          <img
            src="/assets/diagram.png"
            alt="GillNet AI connecting emails, websites, messages, and passwords"
            className="mx-auto block h-auto w-full max-w-[523px]"
          />
        </div>
      </section>

      <hr className="border-black" />

      <section id="services" className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-[80px] lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-w-0 justify-center p-4">
            <img
              src="/assets/union.png"
              alt=""
              className="block h-auto w-full max-w-[420px]"
            />
          </div>
          <div className="text-right">
            <p className="mb-2 text-[24px] underline tracking-[-0.02em]">
              OUR SERVICES
            </p>
            <h2 className="text-[clamp(36px,5.2vw,72px)] leading-[1.1] tracking-[-0.02em]">
              Comprehensive
              <br />
              <span className="font-light italic">Protection</span>. Powered
              <br />
              By <span className="font-light italic">Intelligence</span>.
            </h2>
            <p className="mt-6 text-[20px] font-light italic leading-snug">
              GillNet AI provides various AI - Powered Cybersecurity Tools that
              detect, analyze, and neutralize digital threats in Real Life.
            </p>
            <div className="mt-8 flex justify-end">
              <a
                href="#services-grid"
                className="inline-flex h-[50px] w-[195px] items-center justify-center rounded-[20px] border border-black bg-black text-[20px] text-cream"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>

        <div
          id="services-grid"
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {services.map((s) => (
            <article
              key={s.n}
              className="flex flex-col gap-5 rounded-xl border-2 border-black bg-cream p-6"
            >
              <p className="text-[12px] text-black/90">Service</p>
              <p className="text-[32px] font-semibold">{s.n}</p>
              <h3 className="text-[18px]">{s.title}</h3>
              <div className="h-px bg-[#3c3c43]" />
              <p className="text-[14px] font-light italic leading-snug text-black/90">
                {s.body}
              </p>
              <ul className="space-y-1 text-[14px] font-light italic text-black/90">
                {s.bullets.map((b) => (
                  <li key={b}>•{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <hr className="border-black" />

      <section id="about" className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-[100px] lg:py-20">
        <p className="text-[24px] uppercase underline tracking-[-0.02em]">The Team</p>
        <h2 className="mt-2 text-[clamp(36px,5.5vw,85px)] leading-[1.1] tracking-[-0.02em]">
          The <span className="font-light italic">Team</span> Behind
          <br />
          GillNet AI.
        </h2>
        <div className="mt-10 border-2 border-black">
          <img
            src="/assets/team.png"
            alt="GillNet AI team"
            className="block h-auto w-full"
          />
          <div className="grid grid-cols-1 border-t border-black sm:grid-cols-2 lg:grid-cols-5">
            {team.map((m) => (
              <div
                key={m.name}
                className="border-b border-black px-3 py-6 text-center italic last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
              >
                <p className="text-[20px] lg:text-[22px]">{m.name}</p>
                <p className="mt-2 text-[16px] font-light text-black/90 lg:text-[18px]">
                  {m.role}
                </p>
                {m.extra ? (
                  <p className="text-[16px] font-light text-black/90">{m.extra}</p>
                ) : null}
                <p className="mt-1 text-[14px] font-light text-black/90 lg:text-[16px]">
                  {m.stack}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-black" />

      <section className="mx-auto max-w-[900px] px-6 py-20 text-center lg:py-24">
        <h2 className="text-[clamp(42px,6vw,85px)] leading-[1.1] tracking-[-0.02em]">
          Ready To <span className="font-light italic">Stay</span>
          <br />
          Secure?
        </h2>
        <p className="mx-auto mt-8 max-w-[785px] text-[20px] leading-snug text-black/90">
          Protect your inbox, passwords, websites, and digital identity with
          intelligent AI-powered cybersecurity. Stay ahead of evolving threats
          with continuous monitoring, instant analysis, and proactive protection
          designed for the modern digital world.
        </p>
        <div className="mt-10 flex justify-center">
          <Pill to="/app" filled>
            Start Protecting
          </Pill>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6">
          <span className="hidden h-px w-[117px] bg-black sm:block" />
          <p className="max-w-[459px] text-[20px] italic">
            &quot;Security is not a product, but a process.&quot; - Bruce
            Schneier
          </p>
          <span className="hidden h-px w-[117px] bg-black sm:block" />
        </div>
      </section>

      <footer className="bg-black text-cream">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-10 lg:grid-cols-2 lg:px-[103px]">
          <div>
            <p className="text-[clamp(48px,6vw,85px)] leading-none tracking-[-0.02em]">
              GillNet AI.
            </p>
            <p className="mt-4 text-[20px] underline tracking-[-0.02em]">
              AI - POWERED CYBERSECURITY
            </p>
            <p className="mt-8 text-[20px]">Project Exhibition - I</p>
            <p className="text-[20px]">VIT Bhopal University</p>
          </div>
          <div className="lg:text-right">
            <p className="text-[20px] font-light leading-snug lg:ml-auto lg:max-w-[738px]">
              GillNet AI is an academic cybersecurity project that explores the
              integration of Artificial Intelligence with modern security
              practices. Designed to detect phishing attempts, strengthen
              password security, and promote safer digital experiences through
              intelligent automation.
            </p>
            <p className="mt-16 text-[20px] font-light">© 2026 GillNet AI</p>
          </div>
        </div>
      </footer>

      {demoOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setDemoOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[25px] border-2 border-black bg-cream p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[28px]">Watch Demo</p>
            <p className="mt-4 text-[18px] font-light italic text-ink">
              Open the dashboard and run the four scanners: email, password,
              website, and message. Each tool ships with phishing and safe
              samples for a live exhibition walkthrough.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/app?tool=email"
                className="inline-flex h-[50px] items-center rounded-[20px] border border-black bg-black px-6 text-cream"
                onClick={() => setDemoOpen(false)}
              >
                Open demo tools
              </Link>
              <button
                type="button"
                className="inline-flex h-[50px] items-center rounded-[20px] border border-black px-6"
                onClick={() => setDemoOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
