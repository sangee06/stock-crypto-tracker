// Handles CoinGecko, CryptoPanic, and other crypto API calls

import axios from 'axios';

// CoinGecko API base URL (free tier)
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Fear & Greed Index API
const FEAR_GREED_API = 'https://api.alternative.me/fng/';

/**
 * Get current price and basic info for a cryptocurrency in EUR
 */
export async function getCryptoPrice(symbol) {
  try {
    const coinId = await getCoinGeckoId(symbol);
    if (!coinId) {
      return `❌ Cryptocurrency "${symbol}" not found. Please check the symbol.`;
    }

    const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'eur,usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true,
      }
    });

    const data = response.data[coinId];
    const change24h = data.eur_24h_change || 0;
    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeColor = change24h >= 0 ? '+' : '';

    return `
🪙 **${symbol.toUpperCase()} Price Update**

💰 **Current Price:** €${data.eur.toLocaleString()} 
💵 **USD Price:** $${data.usd.toLocaleString()}
${changeEmoji} **24h Change:** ${changeColor}${change24h.toFixed(2)}%
📊 **Market Cap:** €${(data.eur_market_cap / 1e9).toFixed(2)}B
📈 **24h Volume:** €${(data.eur_24h_vol / 1e6).toFixed(2)}M

*Data from CoinGecko*
`;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return `❌ Error fetching price for ${symbol}: ${error.message}`;
  }
}

/**
 * Get top cryptocurrencies by market cap with EUR pricing
 */
export async function getTopCryptos(limit = 20) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency: 'eur',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d',
      }
    });

    const cryptos = response.data;
    let result = `📊 **Top ${limit} Cryptocurrencies (EUR)**\n\n`;

    cryptos.forEach((crypto, index) => {
      const change24h = crypto.price_change_percentage_24h || 0;
      const change7d = crypto.price_change_percentage_7d_in_currency || 0;
      const emoji24h = change24h >= 0 ? '📈' : '📉';
      const emoji7d = change7d >= 0 ? '📈' : '📉';

      result += `**${index + 1}. ${crypto.name} (${crypto.symbol.toUpperCase()})**\n`;
      result += `💰 €${crypto.current_price.toLocaleString()}\n`;
      result += `${emoji24h} 24h: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%\n`;
      result += `${emoji7d} 7d: ${change7d >= 0 ? '+' : ''}${change7d.toFixed(2)}%\n`;
      result += `📊 MCap: €${(crypto.market_cap / 1e9).toFixed(2)}B\n\n`;
    });

    return result;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    return `❌ Error fetching top cryptocurrencies: ${error.message}`;
  }
}

/**
 * Get Fear & Greed Index for market sentiment
 */
export async function getFearGreedIndex() {
  try {
    const response = await axios.get(FEAR_GREED_API);
    const data = response.data.data[0];
    
    const value = parseInt(data.value);
    const classification = data.value_classification.toLowerCase();
    
    // Determine emoji and advice based on Fear & Greed level
    let emoji, advice;
    if (value <= 25) {
      emoji = '😱';
      advice = 'Extreme fear often presents buying opportunities for long-term investors.';
    } else if (value <= 45) {
      emoji = '😰';
      advice = 'Market fear may indicate good entry points for quality projects.';
    } else if (value <= 55) {
      emoji = '😐';
      advice = 'Neutral sentiment - focus on fundamentals and technical analysis.';
    } else if (value <= 75) {
      emoji = '😄';
      advice = 'Market greed building - consider taking some profits on strong performers.';
    } else {
      emoji = '🤑';
      advice = 'Extreme greed - be cautious, markets may be overheated.';
    }

    return `
🎯 **Crypto Fear & Greed Index**

${emoji} **Current Level:** ${value}/100 (${classification.toUpperCase()})
📅 **Date:** ${data.timestamp}

💡 **Market Insight:** ${advice}

**Scale:**
• 0-24: Extreme Fear 😱
• 25-49: Fear 😰  
• 50-54: Neutral 😐
• 55-74: Greed 😄
• 75-100: Extreme Greed 🤑

*Data from Alternative.me*
`;
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return `❌ Error fetching market sentiment: ${error.message}`;
  }
}

/**
 * Helper function to get CoinGecko coin ID from symbol
 */
async function getCoinGeckoId(symbol) {
  try {
    // Common mappings for faster lookup
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

    if (commonMappings[symbol.toUpperCase()]) {
      return commonMappings[symbol.toUpperCase()];
    }

    // Search for the coin if not in common mappings
    const response = await axios.get(`${COINGECKO_BASE}/search`, {
      params: { query: symbol }
    });

    const coins = response.data.coins;
    const exactMatch = coins.find(coin => 
      coin.symbol.toLowerCase() === symbol.toLowerCase()
    );

    return exactMatch ? exactMatch.id : null;
  } catch (error) {
    console.error('Error getting CoinGecko ID:', error);
    return null;
  }
}

/**
 * Get historical price data for technical analysis
 */
export async function getHistoricalData(symbol, days = 30) {
  try {
    const coinId = await getCoinGeckoId(symbol);
    if (!coinId) return null;

    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'eur',
        days: days,
        interval: days <= 1 ? 'hourly' : 'daily'
      }
    });

    return {
      prices: response.data.prices,
      market_caps: response.data.market_caps,
      total_volumes: response.data.total_volumes,
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
}