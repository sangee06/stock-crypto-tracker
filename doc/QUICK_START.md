# Crypto Investment MCP - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

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
"Give me a morning crypto update: Bitcoin price, market sentiment, and top 5 cryptos"
```

### Investment Research
```
"I'm considering investing in Ethereum. Analyze its technical indicators and give me a recommendation."
```

### Portfolio Review
```
"Update my portfolio: BTC:0.5:28000,ETH:2:3200,ADA:1000:1.50 and give me the full analysis"
```

### Market Analysis
```
"What's the current crypto market sentiment and which coins are performing best today?"
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
"Compare Bitcoin and Ethereum technical analysis and tell me which is a better buy right now"

"My portfolio is BTC:0.5:28000,ETH:2:3200 - analyze performance and give rebalancing advice"

"What's the correlation between Fear & Greed Index and current top crypto performance?"
```

---

*For complete documentation, see DOCUMENTATION.md*