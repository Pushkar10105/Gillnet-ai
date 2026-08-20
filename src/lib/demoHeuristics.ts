export type RiskLevel = 'safe' | 'caution' | 'danger'

export type Finding = {
  title: string
  detail: string
  weight: number
}

export type ScanResult = {
  score: number
  level: RiskLevel
  summary: string
  findings: Finding[]
}

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'qwerty123',
  'admin',
  'letmein',
  'welcome',
  'iloveyou',
  'abc123',
  '111111',
  '000000',
  'monkey',
  'dragon',
  'baseball',
  'football',
  'princess',
])

const LOOKALIKE_BRANDS = [
  { brand: 'PayPal', pattern: /paypa1|paypai|pay-pal|p@ypal/i },
  { brand: 'Microsoft', pattern: /micr0soft|mircosoft|rnicrosoft/i },
  { brand: 'Google', pattern: /g00gle|gooogle|googel/i },
  { brand: 'Amazon', pattern: /amaz0n|amzon-|arnazon/i },
  { brand: 'Apple', pattern: /app1e|aple-id|appleid-support/i },
  { brand: 'bank', pattern: /hdfcbank-|sbi-secure|sbi-kyc|bankofindia-alert/i },
]

const OFFICIAL_HOSTS = new Set([
  'paypal.com',
  'microsoft.com',
  'google.com',
  'amazon.com',
  'apple.com',
  'sbi.co.in',
  'hdfcbank.com',
])

const RISKY_TLDS = new Set([
  'zip',
  'mov',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'xyz',
  'top',
  'click',
  'loan',
  'work',
])

const URGENCY =
  /\b(urgent|immediately|act now|last chance|suspend|locked|verify (now|your)|limited time|within 24 hours|final warning)\b/i
const CREDENTIALS =
  /\b(password|passcode|otp|one[- ]time|login|sign in|confirm (your )?account|update (your )?details|kyc)\b/i
const MONEY =
  /\b(prize|won|lottery|refund|invoice|wire transfer|gift card|crypto|bitcoin|upi|account will be closed)\b/i
const SHORT_LINKS = /\b(bit\.ly|tinyurl\.com|t\.co|rb\.gy|cutt\.ly|ow\.ly)\b/i
const DANGEROUS_ATTACH = /\.(exe|scr|js|vbs|bat|cmd|msi|apk|html?|zip|rar)\b/i

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 65) return 'danger'
  if (score >= 30) return 'caution'
  return 'safe'
}

function pack(score: number, findings: Finding[], safeSummary: string): ScanResult {
  const s = clampScore(score)
  const level = levelFromScore(s)
  const summary =
    level === 'danger'
      ? 'High risk. Treat this as a likely attack and do not interact.'
      : level === 'caution'
        ? 'Mixed signals. Verify through an official app or number before acting.'
        : safeSummary
  return { score: s, level, summary, findings }
}

export function scanEmail(raw: string): ScanResult {
  const text = raw.trim()
  if (!text) {
    return pack(0, [], 'Paste an email to run the demo scanner.')
  }

  const findings: Finding[] = []
  let score = 8

  if (URGENCY.test(text)) {
    score += 22
    findings.push({
      title: 'Urgency language',
      detail: 'The message pushes you to act immediately — a common phishing tactic.',
      weight: 22,
    })
  }
  if (CREDENTIALS.test(text)) {
    score += 20
    findings.push({
      title: 'Credential request',
      detail: 'It asks for a password, OTP, or account confirmation.',
      weight: 20,
    })
  }
  if (MONEY.test(text)) {
    score += 16
    findings.push({
      title: 'Financial lure',
      detail: 'Prize, refund, or payment language is used to lower your guard.',
      weight: 16,
    })
  }
  if (SHORT_LINKS.test(text) || /https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(text)) {
    score += 18
    findings.push({
      title: 'Suspicious link',
      detail: 'Shortened URLs or raw IP addresses hide the real destination.',
      weight: 18,
    })
  }
  if (DANGEROUS_ATTACH.test(text) || /\battachment\b/i.test(text)) {
    score += 14
    findings.push({
      title: 'Attachment risk',
      detail: 'Executable or archive attachments can deliver malware.',
      weight: 14,
    })
  }
  for (const { brand, pattern } of LOOKALIKE_BRANDS) {
    if (pattern.test(text)) {
      score += 24
      findings.push({
        title: `${brand} impersonation`,
        detail: `The wording or domain resembles ${brand} but does not match the real brand.`,
        weight: 24,
      })
      break
    }
  }
  if (/from:\s*.+@(gmail|yahoo|outlook)\.com/i.test(text) && /(paypal|microsoft|amazon|apple|bank)/i.test(text)) {
    score += 20
    findings.push({
      title: 'Mismatched sender',
      detail: 'A consumer mailbox is claiming to be a bank or large company.',
      weight: 20,
    })
  }

  return pack(score, findings, 'No strong phishing markers. Still open links only from known senders.')
}

export function scanPassword(password: string): ScanResult {
  if (!password) {
    return pack(0, [], 'Type a password. Nothing is stored or sent anywhere.')
  }

  const findings: Finding[] = []
  let strength = 5

  if (password.length >= 8) strength += 12
  if (password.length >= 12) strength += 16
  if (password.length >= 16) strength += 12
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 12
  if (/\d/.test(password)) strength += 10
  if (/[^A-Za-z0-9]/.test(password)) strength += 14
  if (new Set(password).size >= Math.min(10, password.length * 0.7)) strength += 8

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    strength = 8
    findings.push({
      title: 'Appears in common-password lists',
      detail: 'Attackers try these first. Choose something unique.',
      weight: 40,
    })
  }
  if (/(.)\1{2,}/.test(password) || /1234|abcd|qwerty/i.test(password)) {
    strength -= 18
    findings.push({
      title: 'Predictable sequence',
      detail: 'Repeated or keyboard-pattern characters are easy to guess.',
      weight: 18,
    })
  }
  if (password.length < 8) {
    findings.push({
      title: 'Too short',
      detail: 'Use at least 12 characters, ideally a passphrase.',
      weight: 20,
    })
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    findings.push({
      title: 'No symbol',
      detail: 'A symbol or space makes brute-force slower.',
      weight: 8,
    })
  }

  const risk = clampScore(100 - strength)
  const level = risk >= 65 ? 'danger' : risk >= 35 ? 'caution' : 'safe'
  const summary =
    level === 'safe'
      ? 'Reasonably strong for a demo. Prefer a password manager and unique passwords per site.'
      : level === 'caution'
        ? 'Usable but weak in places. Lengthen it and mix character types.'
        : 'Easy to crack. Do not use this on a real account.'

  return { score: risk, level, summary, findings }
}

export function scanWebsite(raw: string): ScanResult {
  const input = raw.trim()
  if (!input) {
    return pack(0, [], 'Paste a URL to check for common phishing patterns.')
  }

  const findings: Finding[] = []
  let score = 6
  let url: URL | null = null
  try {
    url = new URL(input.includes('://') ? input : `https://${input}`)
  } catch {
    return pack(55, [
      {
        title: 'Invalid URL',
        detail: 'The scanner could not parse this as a web address.',
        weight: 20,
      },
    ], '')
  }

  const host = url.hostname.toLowerCase()
  const tld = host.split('.').pop() ?? ''

  if (url.protocol === 'http:') {
    score += 18
    findings.push({
      title: 'Not encrypted (HTTP)',
      detail: 'Traffic can be intercepted. Prefer HTTPS for logins and payments.',
      weight: 18,
    })
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    score += 28
    findings.push({
      title: 'IP address as host',
      detail: 'Legitimate sites almost never ask you to log in on a raw IP.',
      weight: 28,
    })
  }
  if (url.username || input.includes('@')) {
    score += 30
    findings.push({
      title: 'Userinfo / @ trick',
      detail: 'Text before @ can fake a trusted brand while the real host is different.',
      weight: 30,
    })
  }
  if (host.includes('xn--')) {
    score += 26
    findings.push({
      title: 'Punycode domain',
      detail: 'Internationalized domains can visually impersonate known brands.',
      weight: 26,
    })
  }
  if (RISKY_TLDS.has(tld)) {
    score += 16
    findings.push({
      title: `Uncommon TLD (.${tld})`,
      detail: 'This ending is frequently used in throwaway phishing sites.',
      weight: 16,
    })
  }
  const labels = host.split('.').filter(Boolean)
  if (labels.length > 4) {
    score += 12
    findings.push({
      title: 'Excessive subdomains',
      detail: 'Long hostnames (login.secure.account.example.xyz) often hide the real site.',
      weight: 12,
    })
  }
  const registered = labels.slice(-2).join('.')
  if (
    /paypal|microsoft|google|amazon|apple|hdfc|sbi/.test(host) &&
    !OFFICIAL_HOSTS.has(registered) &&
    !OFFICIAL_HOSTS.has(host)
  ) {
    score += 28
    findings.push({
      title: 'Brand lookalike host',
      detail: 'The hostname borrows a well-known brand but is not the official domain.',
      weight: 28,
    })
  }
  if (url.pathname.length > 40 || /login|verify|secure|update|wallet/i.test(url.pathname)) {
    score += 10
    findings.push({
      title: 'Sensitive path',
      detail: 'Login or verify paths on unknown hosts are a typical harvest page.',
      weight: 10,
    })
  }

  return pack(score, findings, 'No major URL tricks found. Still confirm the domain before entering data.')
}

export function scanMessage(raw: string): ScanResult {
  const text = raw.trim()
  if (!text) {
    return pack(0, [], 'Paste an SMS, WhatsApp, or chat message to analyse.')
  }

  const findings: Finding[] = []
  let score = 10

  if (URGENCY.test(text) || /\b(dear customer|your kyc|blocked|click (here|now))\b/i.test(text)) {
    score += 20
    findings.push({
      title: 'Pressure / generic greeting',
      detail: 'Scam texts often skip your name and demand instant action.',
      weight: 20,
    })
  }
  if (CREDENTIALS.test(text) || /\b(share otp|do not share|cvv|atm pin)\b/i.test(text)) {
    score += 24
    findings.push({
      title: 'Secret codes requested',
      detail: 'Banks never ask you to send OTP, PIN, or CVV over chat.',
      weight: 24,
    })
  }
  if (MONEY.test(text) || /\b(job offer|work from home|investment|guaranteed returns)\b/i.test(text)) {
    score += 16
    findings.push({
      title: 'Money or job lure',
      detail: 'Unexpected prizes and “easy income” are classic social-engineering hooks.',
      weight: 16,
    })
  }
  if (SHORT_LINKS.test(text) || /https?:\/\//i.test(text)) {
    score += 14
    findings.push({
      title: 'Embedded link',
      detail: 'Open links only after checking the real domain in a browser address bar.',
      weight: 14,
    })
  }
  if (/\b(whatsapp|telegram)\b.*\b(support|agent|kyc)\b/i.test(text)) {
    score += 18
    findings.push({
      title: 'Fake support channel',
      detail: 'Official teams do not move KYC or refunds to random WhatsApp numbers.',
      weight: 18,
    })
  }

  return pack(score, findings, 'Looks like an ordinary message. If it was unexpected, ignore the link.')
}

export const DEMO_SAMPLES = {
  emailDanger: `From: PayPa1 Security <alerts@paypa1-secure.xyz>
Subject: URGENT: Your account will be suspended in 24 hours

Dear customer, we detected unusual activity. Verify your password immediately:
http://bit.ly/pp-login-now
Attachment: invoice.exe`,
  emailSafe: `From: Priya Sharma <priya.sharma@vitbhopal.ac.in>
Subject: Project Exhibition slot

Hi team, our GillNet AI demo is at 2pm in the exhibition hall. Please bring laptops. No links or attachments.`,
  urlDanger: 'http://login.paypal.com@185.22.11.9/verify-account',
  urlSafe: 'https://www.paypal.com/signin',
  messageDanger:
    'Dear customer your KYC is expired. Share OTP and click https://sbi-kyc-update.xyz to avoid account block. WhatsApp support waiting.',
  messageSafe: 'Hey, running 10 min late for the lab. See you at the gate.',
  passwordWeak: 'password123',
  passwordStrong: 'maple-ridge-7!notebook',
} as const
