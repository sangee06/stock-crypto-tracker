// Technical analysis engine (RSI, moving averages, etc.)

import { getCryptoPrice, getHistoricalData } from './crypto-api.js';

/**
 * Perform comprehensive technical analysis on a cryptocurrency
 */
export async function analyzeCrypto(symbol, timeframe = '7d') {
  try {
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    
    // Get current price and historical data
    const [currentData, historicalData] = await Promise.all([
      getCryptoPrice(symbol),
      getHistoricalData(symbol, days)
    ]);

    if (!historicalData) {
      return `❌ Unable to fetch historical data for ${symbol.toUpperCase()}`;
    }

    const prices = historicalData.prices.map(p => p[1]);
    const volumes = historicalData.total_volumes.map(v => v[1]);
    
    // Calculate technical indicators
    const rsi = calculateRSI(prices);
    const ma20 = calculateMovingAverage(prices, 20);
    const ma50 = calculateMovingAverage(prices, 50);
    const currentPrice = prices[prices.length - 1];
    const volumeAnalysis = analyzeVolume(volumes);
    const trendAnalysis = analyzeTrend(prices);
    const supportResistance = findSupportResistance(prices);

    // Generate bullet point analysis
    const bulletAnalysis = generateBulletAnalysis(rsi, ma20, ma50, currentPrice, volumeAnalysis, trendAnalysis);
    
    // Generate detailed rationale
    const detailedRationale = generateDetailedRationale(symbol, rsi, ma20, ma50, currentPrice, volumeAnalysis, trendAnalysis, supportResistance, timeframe);

    return `
🔍 **Technical Analysis: ${symbol.toUpperCase()}** (${timeframe} timeframe)

${currentData}

📊 **TECHNICAL INDICATORS:**

${bulletAnalysis}

📈 **DETAILED TECHNICAL RATIONALE:**

${detailedRationale}
`;

  } catch (error) {
    console.error('Error in technical analysis:', error);
    return `❌ Error analyzing ${symbol}: ${error.message}`;
  }
}

/**
 * Generate investment advice for a specific cryptocurrency
 */
export async function generateInvestmentAdvice(symbol, analysisType = 'detailed') {
  try {
    const analysis = await analyzeCrypto(symbol, '7d');
    const sentiment = await getFearGreedIndex();
    
    // Extract key metrics for recommendation logic
    const historicalData = await getHistoricalData(symbol, 30);
    if (!historicalData) {
      return `❌ Unable to generate advice for ${symbol.toUpperCase()}`;
    }

    const prices = historicalData.prices.map(p => p[1]);
    const rsi = calculateRSI(prices);
    const currentPrice = prices[prices.length - 1];
    const ma20 = calculateMovingAverage(prices, 20);
    const trend = analyzeTrend(prices);

    // Generate recommendation
    const recommendation = generateRecommendation(rsi, currentPrice, ma20, trend);
    const riskAssessment = generateRiskAssessment(symbol, rsi, trend);
    const entryExitStrategy = generateEntryExitStrategy(rsi, currentPrice, ma20);

    if (analysisType === 'quick') {
      return `
🎯 **Quick Investment Advice: ${symbol.toUpperCase()}**

**Recommendation:** ${recommendation.action} ${recommendation.confidence}
**Risk Level:** ${riskAssessment.level}
**Key Reason:** ${recommendation.reason}

${entryExitStrategy.summary}
`;
    }

    return `
🎯 **Investment Advice: ${symbol.toUpperCase()}**

**RECOMMENDATION:** ${recommendation.action} ${recommendation.confidence}

**📊 ANALYSIS SUMMARY:**
${analysis}

**⚠️ RISK ASSESSMENT:**
• **Risk Level:** ${riskAssessment.level}
• **Risk Factors:** ${riskAssessment.factors.join(', ')}
• **Mitigation:** ${riskAssessment.mitigation}

**📈 ENTRY/EXIT STRATEGY:**
${entryExitStrategy.detailed}

**🎯 MARKET CONTEXT:**
${sentiment}

**⚡ ACTION ITEMS:**
${recommendation.actionItems.map(item => `• ${item}`).join('\n')}

*This is not financial advice. Always do your own research and consider your risk tolerance.*
`;

  } catch (error) {
    console.error('Error generating investment advice:', error);
    return `❌ Error generating advice for ${symbol}: ${error.message}`;
  }
}

// Technical Analysis Helper Functions

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50; // Default neutral RSI
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 100) / 100;
}

function calculateMovingAverage(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];
  
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function analyzeVolume(volumes) {
  const recentVolume = volumes.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const olderVolume = volumes.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  
  const change = ((recentVolume - olderVolume) / olderVolume) * 100;
  
  return {
    trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
    change: Math.round(change),
    current: recentVolume
  };
}

function analyzeTrend(prices) {
  const short = prices.slice(-7);
  const medium = prices.slice(-14);
  
  const shortTrend = (short[short.length - 1] - short[0]) / short[0] * 100;
  const mediumTrend = (medium[medium.length - 1] - medium[0]) / medium[0] * 100;
  
  return {
    short: shortTrend > 2 ? 'bullish' : shortTrend < -2 ? 'bearish' : 'neutral',
    medium: mediumTrend > 5 ? 'bullish' : mediumTrend < -5 ? 'bearish' : 'neutral',
    shortChange: Math.round(shortTrend * 100) / 100,
    mediumChange: Math.round(mediumTrend * 100) / 100
  };
}

function findSupportResistance(prices) {
  const sorted = [...prices].sort((a, b) => a - b);
  const length = sorted.length;
  
  return {
    support: sorted[Math.floor(length * 0.2)],
    resistance: sorted[Math.floor(length * 0.8)],
    current: prices[prices.length - 1]
  };
}

function generateBulletAnalysis(rsi, ma20, ma50, currentPrice, volume, trend) {
  const rsiStatus = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
  const rsiReason = rsi > 70 ? 'Consider taking profits' : rsi < 30 ? 'Potential buying opportunity' : 'No extreme levels';
  
  const maStatus = currentPrice > ma20 ? 'Above 20-day MA' : 'Below 20-day MA';
  const maReason = currentPrice > ma20 ? 'Short-term bullish momentum' : 'Short-term bearish pressure';
  
  const volumeReason = volume.trend === 'increasing' ? 'Strong market participation' : 
                      volume.trend === 'decreasing' ? 'Weakening interest' : 'Steady trading activity';

  return `
• **RSI (14):** ${rsi} - ${rsiStatus} → *${rsiReason}*
• **Moving Average:** ${maStatus} → *${maReason}*
• **Volume Trend:** ${volume.trend} (${volume.change >= 0 ? '+' : ''}${volume.change}%) → *${volumeReason}*
• **Price Trend:** ${trend.short} short-term, ${trend.medium} medium-term → *${getTrendReason(trend)}*
`;
}

function generateDetailedRationale(symbol, rsi, ma20, ma50, currentPrice, volume, trend, sr, timeframe) {
  return `
The technical analysis for ${symbol.toUpperCase()} reveals several key insights across the ${timeframe} timeframe:

**Momentum Analysis:** The RSI reading of ${rsi} ${getRSIAnalysis(rsi)} This suggests ${getRSIDetailedAnalysis(rsi)}

**Trend Structure:** Price action shows a ${trend.short} short-term trend (${trend.shortChange >= 0 ? '+' : ''}${trend.shortChange}%) and ${trend.medium} medium-term trend (${trend.mediumChange >= 0 ? '+' : ''}${trend.mediumChange}%). ${getTrendDetailedAnalysis(trend)}

**Volume Confirmation:** Trading volume has been ${volume.trend} by ${Math.abs(volume.change)}% recently. ${getVolumeDetailedAnalysis(volume, trend)}

**Support/Resistance Levels:** Current price of €${currentPrice.toFixed(4)} is ${getCurrentPricePosition(currentPrice, sr)}

**Risk Considerations:** ${getRiskConsiderations(rsi, trend, volume)}
`;
}

function generateRecommendation(rsi, currentPrice, ma20, trend) {
  let action, confidence, reason, actionItems = [];
  
  const bullishSignals = [
    rsi < 40,
    currentPrice > ma20,
    trend.short === 'bullish',
    trend.medium === 'bullish'
  ].filter(Boolean).length;
  
  const bearishSignals = [
    rsi > 60,
    currentPrice < ma20,
    trend.short === 'bearish',
    trend.medium === 'bearish'
  ].filter(Boolean).length;
  
  if (bullishSignals >= 3) {
    action = '🟢 BUY';
    confidence = '(High Confidence)';
    reason = 'Multiple bullish technical indicators align';
    actionItems = [
      'Consider dollar-cost averaging for entry',
      'Set stop-loss below recent support levels',
      'Monitor volume for confirmation'
    ];
  } else if (bearishSignals >= 3) {
    action = '🔴 SELL/AVOID';
    confidence = '(High Confidence)';
    reason = 'Multiple bearish signals present';
    actionItems = [
      'Consider taking profits if holding',
      'Wait for better entry opportunity',
      'Monitor for trend reversal signals'
    ];
  } else if (bullishSignals > bearishSignals) {
    action = '🟡 WEAK BUY';
    confidence = '(Medium Confidence)';
    reason = 'Some positive signals, but mixed indicators';
    actionItems = [
      'Small position sizing recommended',
      'Wait for stronger confirmation',
      'Set tight risk management'
    ];
  } else {
    action = '⚪ HOLD/WAIT';
    confidence = '(Low Confidence)';
    reason = 'Mixed or neutral technical signals';
    actionItems = [
      'Wait for clearer technical setup',
      'Monitor for breakout or breakdown',
      'Focus on risk management'
    ];
  }
  
  return { action, confidence, reason, actionItems };
}

function generateRiskAssessment(symbol, rsi, trend) {
  const riskFactors = [];
  let level = 'MEDIUM';
  
  if (rsi > 70) riskFactors.push('Overbought conditions');
  if (rsi < 30) riskFactors.push('Oversold volatility');
  if (trend.short === 'bearish' && trend.medium === 'bearish') {
    riskFactors.push('Negative trend momentum');
    level = 'HIGH';
  }
  if (trend.short === 'bullish' && trend.medium === 'bullish') {
    level = 'LOW-MEDIUM';
  }
  
  if (riskFactors.length === 0) riskFactors.push('Standard market volatility');
  
  const mitigation = level === 'HIGH' ? 
    'Use smaller position sizes and tight stop-losses' :
    'Apply standard risk management (2-3% of portfolio)';
  
  return { level, factors: riskFactors, mitigation };
}

function generateEntryExitStrategy(rsi, currentPrice, ma20) {
  const summary = rsi < 35 ? 
    'Good entry opportunity - RSI oversold' :
    rsi > 65 ?
    'Consider profit-taking - RSI overbought' :
    'Neutral zone - wait for clear signals';
    
  const detailed = `
**Entry Strategy:**
• Primary: ${currentPrice > ma20 ? 'Buy on pullbacks to 20-day MA' : 'Wait for break above 20-day MA'}
• Secondary: Dollar-cost average on ${rsi < 40 ? 'current oversold levels' : 'any dips below €' + (currentPrice * 0.95).toFixed(4)}

**Exit Strategy:**
• Take profits: ${rsi > 60 ? 'RSI suggests taking some profits now' : 'When RSI reaches 70+'}
• Stop-loss: Set 8-10% below entry point
• Full exit: If RSI drops below 25 or breaks major support

**Position Sizing:**
• Risk per trade: 2-3% of portfolio maximum
• Scale in/out: Use 3 equal portions for entry/exit
`;

  return { summary, detailed };
}

// Additional helper functions for detailed analysis
function getRSIAnalysis(rsi) {
  if (rsi > 70) return 'indicates overbought conditions.';
  if (rsi < 30) return 'suggests oversold territory.';
  return 'shows neutral momentum conditions.';
}

function getRSIDetailedAnalysis(rsi) {
  if (rsi > 70) return 'the asset may be due for a pullback or consolidation. Consider taking some profits.';
  if (rsi < 30) return 'the asset may be oversold and could bounce. This might present a buying opportunity.';
  return 'momentum is balanced, suggesting the market is in a wait-and-see mode.';
}

function getTrendReason(trend) {
  if (trend.short === 'bullish' && trend.medium === 'bullish') return 'Strong upward momentum across timeframes';
  if (trend.short === 'bearish' && trend.medium === 'bearish') return 'Downward pressure building';
  if (trend.short === 'bullish' && trend.medium === 'bearish') return 'Short-term bounce in longer downtrend';
  if (trend.short === 'bearish' && trend.medium === 'bullish') return 'Temporary pullback in uptrend';
  return 'Sideways consolidation pattern';
}

function getTrendDetailedAnalysis(trend) {
  const shortTerm = trend.short === 'bullish' ? 'supporting higher prices' : 
                   trend.short === 'bearish' ? 'creating selling pressure' : 'showing indecision';
  const mediumTerm = trend.medium === 'bullish' ? 'maintaining the broader uptrend' :
                    trend.medium === 'bearish' ? 'confirming the downward trajectory' : 'lacking clear direction';
  
  return `The short-term momentum is ${shortTerm}, while the medium-term trend is ${mediumTerm}.`;
}

function getVolumeDetailedAnalysis(volume, trend) {
  if (volume.trend === 'increasing' && trend.short === 'bullish') {
    return 'This volume increase confirms the bullish price movement, adding credibility to the upward trend.';
  } else if (volume.trend === 'increasing' && trend.short === 'bearish') {
    return 'Rising volume during price decline suggests strong selling pressure and potential continuation.';
  } else if (volume.trend === 'decreasing') {
    return 'Declining volume suggests waning interest and potential for trend reversal or consolidation.';
  }
  return 'Stable volume indicates steady market participation without extreme sentiment.';
}

function getCurrentPricePosition(currentPrice, sr) {
  const supportDist = ((currentPrice - sr.support) / sr.support * 100).toFixed(1);
  const resistanceDist = ((sr.resistance - currentPrice) / currentPrice * 100).toFixed(1);
  
  return `${supportDist}% above support (€${sr.support.toFixed(4)}) and ${resistanceDist}% below resistance (€${sr.resistance.toFixed(4)}).`;
}

function getRiskConsiderations(rsi, trend, volume) {
  const risks = [];
  
  if (rsi > 70) risks.push('overbought conditions increase pullback risk');
  if (trend.short === 'bearish' && trend.medium === 'bearish') risks.push('negative momentum could accelerate');
  if (volume.trend === 'decreasing' && trend.short === 'bullish') risks.push('bullish move lacks volume confirmation');
  
  if (risks.length === 0) return 'Technical setup shows balanced risk-reward profile.';
  return `Key risks include: ${risks.join(', ')}.`;
}