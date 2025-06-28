// Manages portfolio data extracted from screenshots

import { getCryptoPrice, getHistoricalData } from './crypto-api.js';
import { generateInvestmentAdvice } from './analysis.js';

// In-memory portfolio storage (could be replaced with file/database storage)
let portfolio = {
  holdings: [],
  lastUpdated: null,
  totalInvested: 0,
  notes: []
};

/**
 * Update portfolio from screenshot analysis or manual input
 */
export async function updatePortfolioFromScreenshot(method, data) {
  try {
    if (method === 'screenshot') {
      return await processScreenshotData(data);
    } else if (method === 'manual') {
      return await processManualData(data);
    } else {
      return '❌ Invalid update method. Use "screenshot" or "manual".';
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return `❌ Error updating portfolio: ${error.message}`;
  }
}

/**
 * Process screenshot data (Claude will analyze the image)
 */
async function processScreenshotData(analysisData) {
  // This function expects Claude to have analyzed the screenshot and provided
  // structured data about the holdings
  try {
    // Parse the analysis data - this would come from Claude's image analysis
    const holdings = parseScreenshotAnalysis(analysisData);
    
    if (holdings.length === 0) {
      return `❌ No holdings detected in the screenshot analysis. Please try with a clearer image or use manual input.`;
    }

    // Update portfolio with new holdings
    portfolio.holdings = holdings;
    portfolio.lastUpdated = new Date().toISOString();
    
    // Calculate total current value
    const summary = await calculatePortfolioSummary();
    
    return `
✅ **Portfolio Updated from Screenshot**

📊 **Detected Holdings:**
${holdings.map(h => `• ${h.symbol.toUpperCase()}: ${h.amount} (€${h.currentValue?.toFixed(2) || 'calculating...'})`).join('\n')}

📈 **Portfolio Summary:**
${summary}

💡 **Next Steps:**
• Use "get_portfolio_summary" for detailed analysis
• Use "investment_advice" for specific coin recommendations
`;

  } catch (error) {
    return `❌ Error processing screenshot: ${error.message}`;
  }
}

/**
 * Process manual portfolio input
 */
async function processManualData(data) {
  try {
    // Expected format: "BTC:0.5:28000,ETH:2.3:3200,ADA:5000:1.20"
    // Format: SYMBOL:AMOUNT:PURCHASE_PRICE
    const entries = data.split(',').map(entry => entry.trim());
    const holdings = [];
    
    for (const entry of entries) {
      const [symbol, amount, purchasePrice] = entry.split(':');
      
      if (!symbol || !amount || !purchasePrice) {
        continue; // Skip invalid entries
      }
      
      // Get current price
      const currentPriceInfo = await getCryptoPrice(symbol);
      const currentPrice = await getCurrentPriceValue(symbol);
      
      const holding = {
        symbol: symbol.toUpperCase(),
        amount: parseFloat(amount),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: currentPrice,
        currentValue: parseFloat(amount) * currentPrice,
        invested: parseFloat(amount) * parseFloat(purchasePrice),
        pnl: (parseFloat(amount) * currentPrice) - (parseFloat(amount) * parseFloat(purchasePrice)),
        pnlPercentage: ((currentPrice - parseFloat(purchasePrice)) / parseFloat(purchasePrice)) * 100,
        addedAt: new Date().toISOString()
      };
      
      holdings.push(holding);
    }
    
    if (holdings.length === 0) {
      return `❌ No valid holdings found. Please use format: BTC:0.5:28000,ETH:2.3:3200`;
    }
    
    // Update portfolio
    portfolio.holdings = holdings;
    portfolio.lastUpdated = new Date().toISOString();
    portfolio.totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
    
    const summary = await calculatePortfolioSummary();
    
    return `
✅ **Portfolio Updated Manually**

📊 **Added Holdings:**
${holdings.map(h => `• ${h.symbol}: ${h.amount} @ €${h.purchasePrice.toFixed(2)} (Current: €${h.currentPrice.toFixed(4)})`).join('\n')}

📈 **Portfolio Summary:**
${summary}

💡 **Use "get_portfolio_summary" for detailed analysis and recommendations**
`;

  } catch (error) {
    return `❌ Error processing manual data: ${error.message}`;
  }
}

/**
 * Get comprehensive portfolio summary and analysis
 */
export async function getPortfolioSummary(includeRecommendations = true) {
  try {
    if (portfolio.holdings.length === 0) {
      return `
📊 **Portfolio Summary**

❌ **No holdings found.** 

To add holdings:
• **Screenshot method:** Upload your CoinStats screenshot and use "update_portfolio" with method="screenshot"
• **Manual method:** Use format like "BTC:0.5:28000,ETH:2.3:3200,ADA:5000:1.20"

Example: \`update_portfolio\` with method="manual" and data="BTC:0.5:28000,ETH:2.3:3200"
`;
    }

    // Update current prices for all holdings
    await updateCurrentPrices();
    
    const summary = await calculatePortfolioSummary();
    const diversification = calculateDiversification();
    const performance = calculatePerformanceMetrics();
    
    let result = `
📊 **Comprehensive Portfolio Analysis**

${summary}

🎯 **DIVERSIFICATION ANALYSIS:**
${diversification}

📈 **PERFORMANCE METRICS:**
${performance}

📋 **DETAILED HOLDINGS:**
${formatDetailedHoldings()}
`;

    if (includeRecommendations) {
      const recommendations = await generatePortfolioRecommendations();
      result += `\n🎯 **INVESTMENT RECOMMENDATIONS:**\n${recommendations}`;
    }

    result += `\n\n*Last updated: ${new Date(portfolio.lastUpdated).toLocaleString()}*`;
    
    return result;

  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    return `❌ Error generating portfolio summary: ${error.message}`;
  }
}

// Helper Functions

async function updateCurrentPrices() {
  for (const holding of portfolio.holdings) {
    try {
      const currentPrice = await getCurrentPriceValue(holding.symbol);
      holding.currentPrice = currentPrice;
      holding.currentValue = holding.amount * currentPrice;
      holding.pnl = holding.currentValue - holding.invested;
      holding.pnlPercentage = (holding.pnl / holding.invested) * 100;
    } catch (error) {
      console.error(`Error updating price for ${holding.symbol}:`, error);
    }
  }
}

async function getCurrentPriceValue(symbol) {
  try {
    // This is a simplified way to get just the price value
    // In a real implementation, you might want to cache this or optimize API calls
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${await getCoinGeckoId(symbol)}&vs_currencies=eur`);
    const data = await response.json();
    const coinId = await getCoinGeckoId(symbol);
    return data[coinId]?.eur || 0;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
}

async function getCoinGeckoId(symbol) {
  const commonMappings = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'ADA': 'cardano',
    'SOL': 'solana',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'ATOM': 'cosmos',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
  };
  
  return commonMappings[symbol.toUpperCase()] || symbol.toLowerCase();
}

async function calculatePortfolioSummary() {
  const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercentage = (totalPnL / totalInvested) * 100;
  
  const pnlEmoji = totalPnL >= 0 ? '📈' : '📉';
  const pnlColor = totalPnL >= 0 ? '+' : '';
  
  return `
💰 **Total Portfolio Value:** €${totalValue.toLocaleString()}
💵 **Total Invested:** €${totalInvested.toLocaleString()}
${pnlEmoji} **Profit/Loss:** ${pnlColor}€${totalPnL.toLocaleString()} (${pnlColor}${totalPnLPercentage.toFixed(2)}%)
📊 **Number of Holdings:** ${portfolio.holdings.length}
`;
}

function calculateDiversification() {
  const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  
  const allocations = portfolio.holdings
    .map(holding => ({
      symbol: holding.symbol,
      percentage: (holding.currentValue / totalValue) * 100,
      value: holding.currentValue
    }))
    .sort((a, b) => b.percentage - a.percentage);
  
  const topHolding = allocations[0];
  const diversificationScore = allocations.length >= 5 ? 'Well Diversified' :
                              allocations.length >= 3 ? 'Moderately Diversified' :
                              'Concentrated';
  
  let result = `
📊 **Diversification Score:** ${diversificationScore}
🥇 **Top Holding:** ${topHolding.symbol} (${topHolding.percentage.toFixed(1)}%)

**Allocation Breakdown:**
${allocations.map(a => `• ${a.symbol}: ${a.percentage.toFixed(1)}% (€${a.value.toLocaleString()})`).join('\n')}
`;

  if (topHolding.percentage > 50) {
    result += `\n⚠️ **Warning:** Over-concentrated in ${topHolding.symbol}. Consider diversifying.`;
  }
  
  return result;
}

function calculatePerformanceMetrics() {
  const winners = portfolio.holdings.filter(h => h.pnl > 0);
  const losers = portfolio.holdings.filter(h => h.pnl < 0);
  
  const bestPerformer = portfolio.holdings.reduce((best, current) => 
    current.pnlPercentage > best.pnlPercentage ? current : best
  );
  
  const worstPerformer = portfolio.holdings.reduce((worst, current) => 
    current.pnlPercentage < worst.pnlPercentage ? current : worst
  );
  
  return `
🏆 **Best Performer:** ${bestPerformer.symbol} (+${bestPerformer.pnlPercentage.toFixed(2)}%)
📉 **Worst Performer:** ${worstPerformer.symbol} (${worstPerformer.pnlPercentage.toFixed(2)}%)
✅ **Winners:** ${winners.length}/${portfolio.holdings.length}
❌ **Losers:** ${losers.length}/${portfolio.holdings.length}
`;
}

function formatDetailedHoldings() {
  return portfolio.holdings
    .sort((a, b) => b.currentValue - a.currentValue)
    .map(h => {
      const pnlEmoji = h.pnl >= 0 ? '📈' : '📉';
      const pnlSign = h.pnl >= 0 ? '+' : '';
      return `
**${h.symbol}**
• Amount: ${h.amount.toLocaleString()}
• Purchase Price: €${h.purchasePrice.toFixed(4)}
• Current Price: €${h.currentPrice.toFixed(4)}
• Current Value: €${h.currentValue.toLocaleString()}
• ${pnlEmoji} P&L: ${pnlSign}€${h.pnl.toLocaleString()} (${pnlSign}${h.pnlPercentage.toFixed(2)}%)`;
    })
    .join('\n');
}

async function generatePortfolioRecommendations() {
  let recommendations = [];
  
  // Analyze each holding for individual recommendations
  for (const holding of portfolio.holdings) {
    try {
      const advice = await generateInvestmentAdvice(holding.symbol, 'quick');
      recommendations.push(`**${holding.symbol}:** ${advice.split('**Key Reason:**')[1]?.split('\n')[0] || 'Analysis pending'}`);
    } catch (error) {
      recommendations.push(`**${holding.symbol}:** Unable to generate advice`);
    }
  }
  
  // Portfolio-level recommendations
  const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const topHolding = portfolio.holdings.reduce((top, current) => 
    current.currentValue > top.currentValue ? current : top
  );
  
  const portfolioAdvice = [];
  
  // Concentration risk
  const topHoldingPercentage = (topHolding.currentValue / totalValue) * 100;
  if (topHoldingPercentage > 40) {
    portfolioAdvice.push(`🚨 **Reduce Concentration:** ${topHolding.symbol} represents ${topHoldingPercentage.toFixed(1)}% of portfolio`);
  }
  
  // Performance-based advice
  const totalPnL = portfolio.holdings.reduce((sum, h) => sum + h.pnl, 0);
  if (totalPnL > 0) {
    portfolioAdvice.push(`💰 **Profit Taking:** Consider taking some profits on winners`);
  } else if (totalPnL < -0.1 * portfolio.totalInvested) {
    portfolioAdvice.push(`⚠️ **Risk Management:** Portfolio down >10%, review position sizes`);
  }
  
  // Diversification advice
  if (portfolio.holdings.length < 3) {
    portfolioAdvice.push(`📊 **Diversification:** Consider adding more positions to reduce risk`);
  }
  
  let result = '\n**Individual Holdings:**\n' + recommendations.join('\n');
  
  if (portfolioAdvice.length > 0) {
    result += '\n\n**Portfolio-Level Advice:**\n' + portfolioAdvice.join('\n');
  }
  
  return result;
}

function parseScreenshotAnalysis(analysisData) {
  // This function would parse Claude's analysis of a CoinStats screenshot
  // For now, it expects structured data in a specific format
  // In practice, Claude would analyze the image and provide this data
  
  try {
    // Expected format from Claude's image analysis:
    // "BTC: 0.5, ETH: 2.3, ADA: 5000, current_values: BTC=€31250, ETH=€8945, ADA=€7637"
    
    const holdings = [];
    
    // Simple parsing logic - in reality, this would be more sophisticated
    // and would work with Claude's actual image analysis output
    const lines = analysisData.split('\n');
    
    for (const line of lines) {
      if (line.includes(':') && (line.includes('BTC') || line.includes('ETH') || line.includes('ADA') || 
          line.includes('SOL') || line.includes('DOT') || line.includes('MATIC'))) {
        
        const parts = line.split(':');
        if (parts.length >= 2) {
          const symbol = parts[0].trim().replace(/[^A-Z]/g, '');
          const amountMatch = parts[1].match(/[\d,]+\.?\d*/);
          
          if (symbol && amountMatch) {
            holdings.push({
              symbol: symbol,
              amount: parseFloat(amountMatch[0].replace(/,/g, '')),
              purchasePrice: 0, // Would need to be determined from screenshot or manual input
              currentPrice: 0,  // Will be fetched
              currentValue: 0,  // Will be calculated
              invested: 0,      // Would need historical data or manual input
              pnl: 0,
              pnlPercentage: 0,
              addedAt: new Date().toISOString(),
              source: 'screenshot'
            });
          }
        }
      }
    }
    
    return holdings;
  } catch (error) {
    console.error('Error parsing screenshot analysis:', error);
    return [];
  }
}

// Export portfolio data for other modules
export function getPortfolioData() {
  return portfolio;
}

// Clear portfolio (for testing or reset)
export function clearPortfolio() {
  portfolio = {
    holdings: [],
    lastUpdated: null,
    totalInvested: 0,
    notes: []
  };
  return '✅ Portfolio cleared successfully';
}