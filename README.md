# Crypto MCP Strategy

## Project Overview
A cross-platform crypto investment analysis MCP (Model Context Protocol) server with screenshot-powered portfolio tracking and comprehensive investment recommendations.

## Workflow
1. Trade crypto anywhere (RevolutX, Revolut, etc.)
2. Take a CoinStats portfolio screenshot
3. Upload the screenshot to Claude with the prompt: "Update my portfolio"
4. Instantly receive a comprehensive analysis and actionable recommendations

## Features
- **Portfolio Management:** Import holdings via screenshot (no manual data entry)
- **Price Data:** Real-time EUR pricing using CoinGecko API
- **Technical Analysis:** RSI, moving averages, volume trends, with concise and detailed rationales
- **Market Intelligence:** Latest crypto news, sentiment, and Fear & Greed Index
- **Investment Advice:** Buy/sell/hold recommendations with risk assessment

## Tech Stack
- **Language:** Node.js/JavaScript
- **Framework:** MCP SDK (Anthropic)
- **APIs:** CoinGecko, CryptoPanic, Alternative.me (all free)
- **Screenshot Processing:** Claude's built-in image analysis
- **Development:** VS Code + GitHub Copilot

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
