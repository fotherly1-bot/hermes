import os
from fpdf import FPDF

pdf_path = r"C:\Users\fothe\carp-zip\marketing-monetisation-strategy.pdf"
html_path = os.path.join(r"C:\Users\fothe\carp-zip", "_monetisation_report.html")

html = """<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #111; margin: 0; padding: 0;">
<div style="background:#0b1e28;color:#ffffff;padding:28px 32px;">
  <h1 style="margin:0;font-size:24px;">Carp Fishing Tycoon</h1>
  <p style="margin:6px 0 0;font-size:14px;color:#cfe8f5;">Monetisation & Launch Marketing Strategy</p>
</div>

<div style="padding:22px 32px;">
<h2>1. Market Context</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Benchmark</th>
    <th>Figure</th>
    <th>Source</th>
  </tr>
  <tr>
    <td>Average Steam indie net revenue</td>
    <td>~$174 median; ~$229k mean for reviewed titles</td>
    <td>GDC/Valve 2025, SteamPageAnalyzer</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Steam indie at $100k+ net</td>
    <td>5,863 games in 2025 out of ~75k releases</td>
    <td>Valve/GDC 2026</td>
  </tr>
  <tr>
    <td>Idle/clicker/tycoon top grossing</td>
    <td>$13M-$2M net IAP / 4 months in 2022; still strong in 2025</td>
    <td>IGDA, AppMagic H1 2025</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Fishing games on Steam</td>
    <td>~1,350 titles; total net revenue starting at $250M+</td>
    <td>games-stats.com</td>
  </tr>
  <tr>
    <td>Casual game ARPU (90-day IAP)</td>
    <td>$1.34 (Casino) to lower for pure casual</td>
    <td>AppsFlyer 2026</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Rewarded video eCPM</td>
    <td>$2-$4 average; $1-$2 in LATAM/SEA, $4-$7 US/EU</td>
    <td>Tenjin, Liftoff 2024/25</td>
  </tr>
  <tr>
    <td>Casual game D30 ROAS</td>
    <td>47% iOS, 15% Android</td>
    <td>Liftoff 2025</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Mobile casual CPI</td>
    <td>$0.14 global Android / $1.41 global iOS / $3.41 Tier-1 iOS</td>
    <td>Adjust, Liftoff 2026</td>
  </tr>
</table>

<h2>2. Recommended Monetisation Stack</h2>

<h3>A. Free-to-Play on Mobile + Premium Option on Steam</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Platform</th>
    <th>Model</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>iOS / Android</td>
    <td>Free + hybrid IAP / ads</td>
    <td>-</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Steam</td>
    <td>Premium one-time + optional DLC</td>
    <td>£4.99-£7.99 ($6.99-$9.99 USD)</td>
  </tr>
</table>
<p style="font-size:12px;"><strong>Rationale:</strong> Carp Fishing Tycoon has a niche audience. F2P widens the top of funnel on mobile; a modest Steam premium price keeps the PC angler audience without pay-to-win optics.</p>

<h3>B. In-App Purchases (Mobile)</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>SKU</th>
    <th>Type</th>
    <th>Target Price</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>Premium Angler Pass</td>
    <td>Subscription</td>
    <td>£3.99/mo or £29.99/yr</td>
    <td>No ads, +XP boost, exclusive lakes, seasonal fish</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Lake Unlocks</td>
    <td>Consumable / permanent</td>
    <td>£1.99-£3.99</td>
    <td>Gated progression; removes wait timers</td>
  </tr>
  <tr>
    <td>Rig Packs</td>
    <td>Consumable</td>
    <td>£0.99-£2.99</td>
    <td>Skin / stat variants</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Gold / Bait boost</td>
    <td>Consumable</td>
    <td>£0.99-£4.99</td>
    <td>Accelerates idle income</td>
  </tr>
  <tr>
    <td>Ad Remove 24h</td>
    <td>Consumable</td>
    <td>£1.99</td>
    <td>Reward-driven frequency cap</td>
  </tr>
</table>
<p style="font-size:12px;"><strong>Projected split:</strong> 60-70% ads, 30-40% IAP for an idle/tycoon title. Only 2-5% of players convert to IAP; ads monetise the rest.</p>

<h3>C. Advertising (Mobile)</h3>
<ol style="font-size:12px;">
  <li><strong>Rewarded video</strong> - primary placement (opt-in double income, instant lake unlock, bait refill, rig boost). Highest eCPM and fill rate; aligns with tycoon wait timers.</li>
  <li><strong>Interstitial</strong> - between lake sessions or after booking events; keep frequency below fatigue threshold (~1 every 3-5 min max).</li>
  <li><strong>Banner</strong> - minimal, mostly on menu screens; lowest eCPM and highest UX risk.</li>
</ol>
<p style="font-size:12px;">Target ARPDAU for a healthy hybrid-casual/tycoon: <strong>$0.60-$1.20</strong> depending on region mix.</p>

<h3>D. Steam Monetisation</h3>
<ul style="font-size:12px;">
  <li>Base price: <strong>£5.99 / $7.99</strong></li>
  <li>Seasonal DLC lakes / fish packs: <strong>£1.99-£3.99</strong></li>
  <li>No microtransactions in the premium version to avoid backlash.</li>
</ul>

<h3>E. Premium / PC Monetisation</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Stream</th>
    <th>Estimate</th>
  </tr>
  <tr>
    <td>Base sales</td>
    <td>1,000-10,000 units @ £6 = £6k-£60k</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Steam net (70%)</td>
    <td>£4.2k-£42k</td>
  </tr>
  <tr>
    <td>DLC attach 10%</td>
    <td>£0.6k-£6k</td>
  </tr>
  <tr style="background:#fafafa;">
    <td><strong>Net</strong></td>
    <td><strong>~£5k-£48k lifetime</strong></td>
  </tr>
</table>
<p style="font-size:12px;">To reach six figures on Steam you generally need 100k+ net revenue territory: strong wishlists, store features, or influencer coverage.</p>

<h3>F. Mobile Revenue Model (per 10k DAU, 50% US/EU, 50% LATAM/SEA)</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Revenue Line</th>
    <th>Monthly</th>
  </tr>
  <tr>
    <td>Ads (rewarded + interstitial)</td>
    <td>$1,800-$4,500</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>IAP conversions (~5%)</td>
    <td>$300-$1,200</td>
  </tr>
  <tr>
    <td>Subscription cohort</td>
    <td>$400-$1,500</td>
  </tr>
  <tr style="background:#fafafa;">
    <td><strong>Total</strong></td>
    <td><strong>$2,500-$7,200/month</strong></td>
  </tr>
</table>
<p style="font-size:12px;">At 100k DAU: <strong>$25k-$72k/month</strong> gross before platform 30% cut and UA spend.</p>

<h2>3. UA & Launch Marketing Strategy</h2>

<h3>Pre-Launch (Wishlist / Email / Social)</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Channel</th>
    <th>Action</th>
    <th>Target</th>
  </tr>
  <tr>
    <td>Steam wishlists</td>
    <td>Store page, trailer, GIFs, fishing community AMAs</td>
    <td>5,000-15,000</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>TikTok / Reels</td>
    <td>9:16 casting clips, PB catches, "Lake tier list"</td>
    <td>10-50k followers</td>
  </tr>
  <tr>
    <td>YouTube</td>
    <td>Shorts + long-form from 3-5 mid-tier fishing/tycoon creators</td>
    <td>50k-500k views</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Reddit</td>
    <td>r/FishingGames, r/tycoon, r/IndieGaming posts</td>
    <td>5k-20k impressions</td>
  </tr>
  <tr>
    <td>Discord</td>
    <td>Official server; early access feedback + referral rewards</td>
    <td>500-2,000 members</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Press / newsletters</td>
    <td>Indie game sites: IndieDB, itch.io, r/IndieGaming weekly</td>
    <td>5-10 articles</td>
  </tr>
</table>

<h3>Launch Week</h3>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Channel</th>
    <th>Budget</th>
    <th>KPI</th>
  </tr>
  <tr>
    <td>Paid social (Meta/TikTok)</td>
    <td>$500-$1,500</td>
    <td>CPI &lt; $1.50 casual; 300-1,000 installs</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Fishing creator seeding</td>
    <td>5-10 paid/review codes</td>
    <td>3-10 videos</td>
  </tr>
  <tr>
    <td>Steam Featured / Next Fest</td>
    <td>Free</td>
    <td>Wishlist spike</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Press release</td>
    <td>$0-$200</td>
    <td>Pickup by fishing media</td>
  </tr>
</table>

<h3>Live Service / Re-Engagement</h3>
<ul style="font-size:12px;">
  <li>Weekly news cadence mirroring current design: decimal lbs records, new lake drops.</li>
  <li>Seasonal events tied to real-world fishing calendar (carp spawning runs, night sessions).</li>
  <li>Community highlights: top PB leaderboard, angler of the week.</li>
</ul>

<h2>4. Realistic Earning Scenarios</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
  <tr style="background:#f2f7fb;">
    <th>Scenario</th>
    <th>Steam / Mobile mix</th>
    <th>Est. Net 12-month</th>
  </tr>
  <tr>
    <td>Conservative</td>
    <td>2k Steam + 5k DAU mobile avg</td>
    <td>£8k-$25k</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Moderate</td>
    <td>8k Steam + 25k DAU mobile avg</td>
    <td>£30k-$120k</td>
  </tr>
  <tr>
    <td>Strong</td>
    <td>25k Steam + 100k DAU mobile avg</td>
    <td>£120k-$500k+</td>
  </tr>
  <tr style="background:#fafafa;">
    <td>Breakout</td>
    <td>Featured + creator + 300k DAU</td>
    <td>£500k-$2M+</td>
  </tr>
</table>
<p style="font-size:12px;">Breakout odds for a small niche tycoon are low; the conservative/moderate bands are realistic targets with consistent live-ops and UA reinvestment.</p>

<h2>5. Recommended First Steps</h2>
<ol style="font-size:12px;">
  <li><strong>Decide platform priority:</strong> mobile-first F2P + Steam premium is the safest split.</li>
  <li><strong>Instrument monetisation early:</strong> implement rewarded ads + IAP + events before soft launch.</li>
  <li><strong>Build the funnel assets:</strong> trailer, store assets, TikTok content pipeline.</li>
  <li><strong>Soft launch:</strong> 2-4 weeks in a test market (Canada / Australia / UK) to measure CPI, D1/D7 retention, ARPDAU.</li>
  <li><strong>Re-invest:</strong> target 25-35% of gross revenue back into UA to grow DAU.</li>
</ol>

<div style="background:#f2f7fb;padding:14px 18px;border-left:4px solid #0b1e28;margin-top:18px;font-size:11px;color:#445;">
  <strong>Note:</strong> Figures are indicative benchmarks for similar tycoon/casual titles; actual revenue depends heavily on marketing execution, platform features, and live-ops quality.
</div>
</div>
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()
pdf.set_margins(0, 0, 0)
pdf.add_font("Arial", "", "C:/Windows/Fonts/arial.ttf", uni=True)
pdf.add_font("Arial", "B", "C:/Windows/Fonts/arialbd.ttf", uni=True)
pdf.add_font("Arial", "I", "C:/Windows/Fonts/ariali.ttf", uni=True)
pdf.add_font("Arial", "BI", "C:/Windows/Fonts/arialbi.ttf", uni=True)
pdf.set_font("Arial", size=11)

pdf.write_html(html_path)

footer_text = "Carp Fishing Tycoon - Monetisation & Launch Marketing Strategy - Page "
for page_no in range(1, pdf.page_no() + 1):
    pdf.page = page_no
    pdf.set_y(-15)
    pdf.set_font("Arial", "", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 10, footer_text + str(page_no), align="C")

pdf.output(pdf_path)

try:
    os.remove(html_path)
except Exception:
    pass

print("PDF written to:", pdf_path)
