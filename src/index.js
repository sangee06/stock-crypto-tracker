#!/usr/bin/env node
// Main MCP server entry point

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { getCryptoPrice, getTopCryptos, getFearGreedIndex } from './crypto-api.js';
import { updatePortfolioFromScreenshot, getPortfolioSummary } from './portfolio.js';
import { analyzeCrypto, generateInvestmentAdvice } from './analysis.js';

class CryptoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'crypto-investment-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_crypto_price',
            description: 'Get current price and basic info for a cryptocurrency in EUR',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Cryptocurrency symbol (e.g., BTC, ETH, ADA)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_top_cryptos',
            description: 'Get top cryptocurrencies by market cap with EUR pricing',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Number of top cryptos to fetch (default: 20)',
                  default: 20,
                },
              },
            },
          },
          {
            name: 'analyze_crypto',
            description: 'Perform comprehensive technical analysis on a cryptocurrency',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Cryptocurrency symbol (e.g., BTC, ETH)',
                },
                timeframe: {
                  type: 'string',
                  description: 'Analysis timeframe: 1d, 7d, 30d (default: 7d)',
                  default: '7d',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'update_portfolio',
            description: 'Update portfolio from CoinStats screenshot or manual input',
            inputSchema: {
              type: 'object',
              properties: {
                method: {
                  type: 'string',
                  description: 'Update method: screenshot or manual',
                  enum: ['screenshot', 'manual'],
                },
                data: {
                  type: 'string',
                  description: 'Screenshot analysis or manual portfolio data',
                },
              },
              required: ['method', 'data'],
            },
          },
          {
            name: 'get_portfolio_summary',
            description: 'Get comprehensive portfolio analysis and recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                include_recommendations: {
                  type: 'boolean',
                  description: 'Include investment recommendations (default: true)',
                  default: true,
                },
              },
            },
          },
          {
            name: 'get_market_sentiment',
            description: 'Get overall crypto market sentiment and Fear & Greed Index',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'investment_advice',
            description: 'Generate investment advice for a specific cryptocurrency',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Cryptocurrency symbol',
                },
                analysis_type: {
                  type: 'string',
                  description: 'Type of analysis: quick, detailed (default: detailed)',
                  default: 'detailed',
                },
              },
              required: ['symbol'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_crypto_price':
            return {
              content: [
                {
                  type: 'text',
                  text: await getCryptoPrice(args.symbol),
                },
              ],
            };

          case 'get_top_cryptos':
            return {
              content: [
                {
                  type: 'text',
                  text: await getTopCryptos(args.limit || 20),
                },
              ],
            };

          case 'analyze_crypto':
            return {
              content: [
                {
                  type: 'text',
                  text: await analyzeCrypto(args.symbol, args.timeframe || '7d'),
                },
              ],
            };

          case 'update_portfolio':
            return {
              content: [
                {
                  type: 'text',
                  text: await updatePortfolioFromScreenshot(args.method, args.data),
                },
              ],
            };

          case 'get_portfolio_summary':
            return {
              content: [
                {
                  type: 'text',
                  text: await getPortfolioSummary(args.include_recommendations !== false),
                },
              ],
            };

          case 'get_market_sentiment':
            return {
              content: [
                {
                  type: 'text',
                  text: await getFearGreedIndex(),
                },
              ],
            };

          case 'investment_advice':
            return {
              content: [
                {
                  type: 'text',
                  text: await generateInvestmentAdvice(args.symbol, args.analysis_type || 'detailed'),
                },
              ],
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Crypto Investment MCP server running on stdio');
  }
}

const server = new CryptoMCPServer();
server.run().catch(console.error);