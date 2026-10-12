// 本地默认占位资源，避免依赖外网图床导致断网裂图
const svgUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

export const DEFAULT_AVATAR = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#2c5282"/>
    <circle cx="60" cy="46" r="22" fill="#d69e2e"/>
    <ellipse cx="60" cy="92" rx="34" ry="24" fill="#d69e2e"/>
  </svg>`
)

export const DEFAULT_COVER = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
    <rect width="160" height="200" fill="#ebf2fa"/>
    <rect x="20" y="30" width="120" height="10" rx="4" fill="#2c5282"/>
    <rect x="20" y="52" width="90" height="8" rx="4" fill="#90cdf4"/>
    <rect x="20" y="70" width="100" height="8" rx="4" fill="#90cdf4"/>
    <text x="80" y="140" text-anchor="middle" font-size="14" fill="#2c5282" font-family="sans-serif">Campus</text>
  </svg>`
)

const COVER_BY_CATEGORY = {
  计算机: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#2c5282"/>
      <rect x="20" y="30" width="50" height="50" rx="8" fill="#d69e2e"/>
      <text x="24" y="120" font-size="18" fill="#fff" font-family="sans-serif">计算机</text>
      <text x="24" y="148" font-size="11" fill="#a0aec0" font-family="sans-serif">Campus Library</text>
    </svg>`
  ),
  文学: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#744210"/>
      <circle cx="80" cy="70" r="28" fill="#f6e05e"/>
      <text x="24" y="130" font-size="18" fill="#fefcbf" font-family="sans-serif">文学</text>
    </svg>`
  ),
  经济: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#276749"/>
      <path d="M30 100 L60 70 L90 90 L130 40" stroke="#9ae6b4" stroke-width="6" fill="none"/>
      <text x="24" y="140" font-size="18" fill="#f0fff4" font-family="sans-serif">经济</text>
    </svg>`
  ),
  历史: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#742a2a"/>
      <rect x="40" y="40" width="80" height="8" fill="#feb2b2"/>
      <rect x="40" y="56" width="60" height="8" fill="#feb2b2"/>
      <text x="24" y="130" font-size="18" fill="#fff5f5" font-family="sans-serif">历史</text>
    </svg>`
  ),
  科学: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#234e52"/>
      <circle cx="80" cy="70" r="30" fill="none" stroke="#81e6d9" stroke-width="6"/>
      <text x="24" y="135" font-size="18" fill="#e6fffa" font-family="sans-serif">科学</text>
    </svg>`
  ),
  教育: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
      <rect width="160" height="200" fill="#2b6cb0"/>
      <polygon points="80,30 130,55 80,80 30,55" fill="#bee3f8"/>
      <text x="24" y="135" font-size="18" fill="#ebf8ff" font-family="sans-serif">教育</text>
    </svg>`
  )
}

export function bookCover(category) {
  return COVER_BY_CATEGORY[category] || DEFAULT_COVER
}

export function coverByBook(book) {
  if (book && book.cover) return book.cover
  return bookCover(book && book.category)
}

export function resolveAvatar(avatar) {
  return avatar || DEFAULT_AVATAR
}

const ACT_COVERS = {
  1: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#276749"/><circle cx="320" cy="40" r="48" fill="#9ae6b4" opacity=".35"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">志愿</text><text x="28" y="168" font-size="16" fill="#c6f6d5" font-family="sans-serif">Volunteer</text></svg>`),
  2: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#2c5282"/><rect x="280" y="30" width="90" height="90" rx="16" fill="#d69e2e" opacity=".85"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">实践</text><text x="28" y="168" font-size="16" fill="#bee3f8" font-family="sans-serif">Practice</text></svg>`),
  3: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#234e52"/><circle cx="300" cy="100" r="55" fill="none" stroke="#81e6d9" stroke-width="10"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">文体</text><text x="28" y="168" font-size="16" fill="#b2f5ea" font-family="sans-serif">Sports & Art</text></svg>`),
  4: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#553c9a"/><path d="M280 40 L360 180 H200 Z" fill="#d6bcfa" opacity=".5"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">创新</text><text x="28" y="168" font-size="16" fill="#e9d8fd" font-family="sans-serif">Innovation</text></svg>`),
  5: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#c05621"/><circle cx="80" cy="50" r="30" fill="#fbd38d" opacity=".7"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">技能</text><text x="28" y="168" font-size="16" fill="#fbd38d" font-family="sans-serif">Skills</text></svg>`),
  6: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#2b6cb0"/><rect x="260" y="50" width="110" height="14" rx="7" fill="#90cdf4"/><rect x="280" y="80" width="90" height="14" rx="7" fill="#bee3f8"/><text x="28" y="130" font-size="36" fill="#fff" font-family="sans-serif">讲座</text><text x="28" y="168" font-size="16" fill="#bee3f8" font-family="sans-serif">Lecture</text></svg>`)
}

export function activityCover(activity) {
  if (activity && activity.coverImage) return activity.coverImage
  const t = Number(activity && activity.activityType) || 1
  return ACT_COVERS[t] || DEFAULT_COVER
}
