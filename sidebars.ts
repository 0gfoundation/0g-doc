import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [    
    // SECTION 1: For beginners and non-technical users
    {
      type: 'category',
      label: 'Introduction',
      className: 'sidebar-category intro',
      items: [
        'introduction/understanding-0g',
        'introduction/vision-mission',
      ],
    },
    
    // SECTION 2: Technical concepts explained simply
    {
      type: 'category',
      label: 'Concepts',
      className: 'sidebar-category concepts',
      items: [
        'concepts/chain',
        'concepts/compute',
        'concepts/storage',
        'concepts/da',
        'concepts/ai-alignment',
        'concepts/inft',
        'concepts/depin',
      ],
    },
    
    // SECTION 3: For developers and builders
    {
      type: 'category',
      label: 'Developer Hub',
      className: 'sidebar-category developer-hub',
      link: {
        type: 'doc',
        id: 'developer-hub/getting-started',
      },
      items: [
        'developer-hub/getting-started',
        {
          type: 'doc',
          id: 'developer-hub/testnet/testnet-overview',
          label: 'Testnet',
        },
        {
          type: 'doc',
          id: 'developer-hub/mainnet/mainnet-overview',
          label: 'Mainnet',
        },
        {
          type: 'category',
          label: 'Building on 0G',
          link: {
            type: 'doc',
            id: 'developer-hub/building-on-0g/introduction',
          },
          items: [
            {
              type: 'category',
              label: '0G Chain',
              link: {
                type: 'doc',
                id: 'developer-hub/building-on-0g/contracts-on-0g/deploy-contracts',
              },
              items: [
                'developer-hub/building-on-0g/contracts-on-0g/deploy-contracts',
                'developer-hub/building-on-0g/contracts-on-0g/staking-interfaces',
                'developer-hub/building-on-0g/contracts-on-0g/validator-contract-functions',
                {
                  type: 'category',
                  label: 'Precompiles',
                  link: {
                    type: 'doc',
                    id: 'developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-overview',
                  },
                  items: [
                    'developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-overview',
                    'developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-dasigners',
                    'developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-wrappedogbase',
                  ],
                },
                {
                  type: 'category',
                  label: 'Indexing',
                  items: [
                    'developer-hub/building-on-0g/indexing/goldsky',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: '0G Compute',
              items: [
                'developer-hub/building-on-0g/compute-network/overview',
                {
                  type: 'category',
                  label: 'For Developers',
                  items: [
                    'developer-hub/building-on-0g/compute-network/account-management',
                    'developer-hub/building-on-0g/compute-network/inference',
                    'developer-hub/building-on-0g/compute-network/fine-tuning',
                  ],
                },
                {
                  type: 'category',
                  label: 'For Providers',
                  items: [
                    'developer-hub/building-on-0g/compute-network/inference-provider',
                    'developer-hub/building-on-0g/compute-network/fine-tuning-provider',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: '0G Storage',
              items: [
                'developer-hub/building-on-0g/storage/sdk',
                'developer-hub/building-on-0g/storage/storage-cli',
              ],
            },
            {
              type: 'category',
              label: '0G DA',
              items: [
                'developer-hub/building-on-0g/da-integration',
                'developer-hub/building-on-0g/da-deep-dive',
                {
                  type: 'category',
                  label: 'Rollups and Appchains',
                  items: [
                    'developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da',
                    'developer-hub/building-on-0g/rollups-and-appchains/arbitrum-nitro-on-0g-da',
                  ],
                }
              ],
            },
            {
              type: 'category',
              label: 'INFTs (Intelligent NFTs)',
              items: [
                'developer-hub/building-on-0g/inft/inft-overview',
                'developer-hub/building-on-0g/inft/integration',
                'developer-hub/building-on-0g/inft/erc7857',
              ],
            },
          ],
        },
      ],
    },
    
    // SECTION 4: For node operators
    {
      type: 'category',
      label: 'Run a Node',
      className: 'sidebar-category run-node',
      link: {
        type: 'doc',
        id: 'run-a-node/overview',
      },
      items: [
        'run-a-node/overview',
        'run-a-node/validator-node',
        'run-a-node/storage-node',
        'run-a-node/da-node',
        'run-a-node/archival-node',
        'run-a-node/community-docker-repo',
      ],
    },
    
    // SECTION 5: Resources
    {
      type: 'category',
      label: 'Resources',
      className: 'sidebar-category resources',
      link: {
        type: 'doc',
        id: 'resources/whitepaper',
      },
      items: [
        'resources/whitepaper',
        'resources/security',
        'resources/how-to-contribute',
        'resources/glossary',
        {
          type: 'link',
          label: 'Blog',
          href: 'https://0g.ai/blog',
        },
      ],
    },
    
    // SECTION 6: AI Alignment node (kept separate as it's temporary)
    {
      type: 'category',
      label: 'AI Alignment node',
      className: 'sidebar-category node-sale',
      link: {
        type: 'doc',
        id: 'node-sale/node-sale-index',
      },
      items: [
        {
          type: 'category',
          label: 'Introduction',
          items: [
            'node-sale/intro/intro',
            'node-sale/intro/node-holder-benefits',
            'node-sale/intro/sale-structure',
            'node-sale/intro/eligibility',
          ],
        },
        {
          type: 'doc',
          id: 'node-sale/ai-alignment-node-user-guide',
          label: 'AI Alignment Node - User Guide',
        },
        'node-sale/details/kyc-verification',
        {
          type: 'category',
          label: 'AI Alignment node Details',
          items: [
            'node-sale/details/purchasing-nodes',
            'node-sale/details/incentives-and-rewards',
            'node-sale/details/compliance-and-regulatory',
          ],
        },
        'node-sale/faq/faq',
        'node-sale/disclaimer',
      ],
    },
    
    // 0G Hub link - visible only on mobile
    {
      type: 'link',
      label: '🌐 0G Hub',
      href: 'https://hub.0g.ai',
      className: 'sidebar-0g-hub-link',
    },
  ],
};

export default sidebars;