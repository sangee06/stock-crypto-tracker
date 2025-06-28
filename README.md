# Crypto MCP Strategy

## Project Overview
A cross-platform crypto investment analysis MCP (Model Context Protocol) server with screenshot-powered portfolio tracking and comprehensive investment recommendations.

---

## 🚀 Quick Start

### 1. Install & Test
```bash
cd stock-crypto-tracker
npm install
node src/index.js  # Should show "server running on stdio"
```

### 2. Configure Claude Desktop
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "crypto-investment": {
      "command": "node",
      "args": ["/YOUR/FULL/PATH/stock-crypto-tracker/src/index.js"],
      "env": {}
    }
  }
}
```

### 3. Restart Claude Desktop
Look for "crypto-investment" with "7" tools in the integration menu.

---

## ⚡ Quick Commands

### Basic Price Checks
```
What's Bitcoin's current price in EUR?
Show me the top 10 cryptocurrencies
What's the crypto market sentiment?
```

### Technical Analysis
```
Analyze Ethereum's technical indicators
Should I buy Solana right now?
Give me detailed analysis of Cardano
```

### Portfolio Management
```
Update my portfolio manually: BTC:0.5:30000,ETH:2:2500
Show me my complete portfolio analysis
What are my portfolio recommendations?
```

---

## 📊 Understanding the Output

### Price Data
- 💰 **Current Price** in EUR (primary) and USD
- 📈📉 **24h Change** with emoji indicators
- 📊 **Market Cap** in billions
- 📈 **Volume** in millions

### Technical Analysis
- **RSI**: >70 overbought, <30 oversold, 30-70 neutral
- **Moving Averages**: Above = bullish, Below = bearish
- **Volume**: Increasing = strong, Decreasing = weak
- **Trend**: Bullish/Bearish/Neutral for short/medium term

### Investment Advice
- 🟢 **BUY** - Multiple bullish signals
- 🟡 **WEAK BUY** - Some positive signals
- ⚪ **HOLD/WAIT** - Mixed signals
- 🔴 **SELL/AVOID** - Multiple bearish signals

### Risk Levels
- **LOW-MEDIUM**: Favorable conditions
- **MEDIUM**: Standard market risk
- **HIGH**: Elevated risk factors

---

## 🛠 Common Use Cases

### Daily Crypto Check
```
Give me a morning crypto update: Bitcoin price, market sentiment, and top 5 cryptos
```

### Investment Research
```
I'm considering investing in Ethereum. Analyze its technical indicators and give me a recommendation.
```

### Portfolio Review
```
Update my portfolio: BTC:0.5:28000,ETH:2:3200,ADA:1000:1.50 and give me the full analysis
```

### Market Analysis
```
What's the current crypto market sentiment and which coins are performing best today?
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP not showing | Check config file path, restart Claude Desktop |
| Server won't start | Run `npm install`, check Node.js version (18+) |
| API errors | Check internet connection, try different symbols |
| Portfolio not importing | Use format: `SYMBOL:AMOUNT:PRICE` |

---

## 📱 Mobile Usage

On mobile devices (iPhone, Android, iPad):
1. **Upload screenshot** of your CoinStats portfolio
2. **Ask Claude** to analyze it: "Update my portfolio from this screenshot"
3. **Get same analysis** as desktop MCP version

---

## 🎯 Pro Tips

### Portfolio Format
- **Correct**: `BTC:0.5:30000,ETH:2:2500`
- **Wrong**: `Bitcoin 0.5 at 30000` or `BTC = 0.5`

### Best Practices
- ✅ Check market sentiment before making decisions
- ✅ Use technical analysis for entry/exit timing
- ✅ Monitor portfolio diversification warnings
- ✅ Set stop-losses based on recommendations

### Advanced Queries
```
Compare Bitcoin and Ethereum technical analysis and tell me which is a better buy right now

My portfolio is BTC:0.5:28000,ETH:2:3200 - analyze performance and give rebalancing advice

What's the correlation between Fear & Greed Index and current top crypto performance?
```

---

## Features
- **Portfolio Management:** Import holdings via screenshot (no manual data entry)
- **Price Data:** Real-time EUR pricing using CoinGecko API
- **Technical Analysis:** RSI, moving averages, volume trends, with concise and detailed rationales
- **Market Intelligence:** Latest crypto news, sentiment, and Fear & Greed Index
- **Investment Advice:** Buy/sell/hold recommendations with risk assessment

## Tech Stack
- **Node.js (JavaScript):** Main server and backend logic
- **@modelcontextprotocol/sdk:** Official SDK for building MCP servers
- **axios:** HTTP client for API requests (CoinGecko, CryptoPanic, etc.)
- **dotenv:** Loads environment variables from `.env`
- **CoinGecko API, CryptoPanic API, Alternative.me API:** Real-time crypto data, news, and sentiment
- **VS Code:** Development environment

## Key Modules
- `src/index.js`: Main MCP server entry point
- `src/crypto-api.js`: Handles API calls to CoinGecko, CryptoPanic, etc.
- `src/portfolio.js`: Manages portfolio data, screenshot import, and summary logic
- `src/analysis.js`: Technical analysis (RSI, moving averages, etc.)

## Example Portfolio Logic
- Portfolio can be updated via screenshot (preferred) or manual input (for testing)
- Real-time prices fetched for each holding
- Performance metrics, diversification, and recommendations are generated

## Cross-Platform Strategy
- **Desktop (Mac/Windows):**
  - Full MCP server runs locally (Node.js process)
  - Claude Desktop App connects directly to the local MCP server
  - All features available
- **Mobile/Tablet (iOS/Android/iPadOS):**
  - Upload screenshots directly to Claude for analysis (no local MCP server needed)
  - Same analysis quality, just no automated MCP functions
- **Cloud-Hosted MCP (Advanced):**
  - Optional for full automation on all platforms
  - Requires VPS setup and security configuration

### Recommended Approach
- Start with the desktop MCP for full features
- Mobile users upload screenshots to Claude for identical analysis

## Benefits
- No manual data entry (screenshot-powered)
- No paid API subscriptions
- Platform agnostic (works with any portfolio tracker)
- EUR pricing
- Cross-device compatibility (Mac, Windows, iPad, iPhone, Android)
- Comprehensive analysis in Claude conversations

## Upgrade Path
- Add RevolutX API for full automation
- Add more technical indicators
- Add portfolio optimization suggestions

---

_This project is designed for rapid setup (30 minutes to working MCP) and maximum cross-platform compatibility._

See `doc/requirements-and-tests.md` for requirements and implementation notes.
