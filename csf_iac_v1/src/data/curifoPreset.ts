import type { PlacedResource, ResourceConnection } from '../tsx_components/IsometricGrid';

export interface CustomIaCPayload {
  version: string;
  architectureType: string;
  projectName: string;
  targetRegion: string;
  timestamp: string;
  resources: Array<PlacedResource & {
    config?: Record<string, any>;
  }>;
  connections: ResourceConnection[];
}

export const curifoLivePreset: CustomIaCPayload = {
  version: '1.0',
  architectureType: 'serverless-spa',
  projectName: 'Curifo-Production',
  targetRegion: 'ap-northeast-1',
  timestamp: new Date().toISOString(),
  resources: [
    // --- エッジ配信層 (Row 0) ---
    {
      id: 'cf-user',
      tileIndex: 1,
      type: 'cloudfront',
      name: 'CF-UserFront',
      config: {
        domainName: 'd1gzel5au9y5uy.cloudfront.net',
        targetOrigin: 'curifouserfrontv001',
        description: 'ユーザー向けアンケート回答SPA配信',
      },
    },
    {
      id: 'cf-biz',
      tileIndex: 3,
      type: 'cloudfront',
      name: 'CF-BizFront',
      config: {
        domainName: 'd1g6pzvzyxefjs.cloudfront.net',
        targetOrigin: 'curifobizfront001',
        description: '事業者・管理向けSPA配信',
      },
    },
    // --- 静的S3ストレージ層 (Row 1) ---
    {
      id: 's3-user',
      tileIndex: 7,
      type: 's3',
      name: 'S3-UserFront',
      config: {
        bucketName: 'curifouserfrontv001',
        websiteIndex: 'index.html',
      },
    },
    {
      id: 's3-biz',
      tileIndex: 9,
      type: 's3',
      name: 'S3-BizFront',
      config: {
        bucketName: 'curifobizfront001',
        websiteIndex: 'index.html',
      },
    },
    // --- API & 認証ゲート層 (Row 2) ---
    {
      id: 'api-search',
      tileIndex: 13,
      type: 'apigateway',
      name: 'API-DBSearcher',
      config: {
        apiId: 'gbb9870xpd',
        endpoint: 'https://gbb9870xpd.execute-api.ap-northeast-1.amazonaws.com',
        protocolType: 'HTTP',
      },
    },
    {
      id: 'api-agent',
      tileIndex: 14,
      type: 'apigateway',
      name: 'API-AgentEngine',
      config: {
        apiId: 'gfy662bt73',
        endpoint: 'https://gfy662bt73.execute-api.ap-northeast-1.amazonaws.com',
        protocolType: 'HTTP',
      },
    },
    {
      id: 'cognito-auth',
      tileIndex: 16,
      type: 'cognito',
      name: 'Cognito-CuriousPool',
      config: {
        userPoolId: 'ap-northeast-1_KkOuweXyZ',
        name: 'CuriousForm-Kaikei-MMAA-UserPool',
      },
    },
    // --- サーバーレス関数・AIエンジン層 (Row 3 & 4) ---
    {
      id: 'fn-search',
      tileIndex: 19,
      type: 'lambda',
      name: 'FN-DBSearcher',
      config: {
        functionName: 'curifo_DB_searcher',
        runtime: 'nodejs24.x',
        memory: 128,
      },
    },
    {
      id: 'fn-agent',
      tileIndex: 20,
      type: 'lambda',
      name: 'FN-AgentEngineV1',
      config: {
        functionName: 'CurifoAgentEngineV001',
        runtime: 'nodejs24.x',
        memory: 256,
        description: 'AIエージェント分析エンジン',
      },
    },
    {
      id: 'fn-mapping',
      tileIndex: 22,
      type: 'lambda',
      name: 'FN-MappingService',
      config: {
        functionName: 'CurifoMappingService',
        runtime: 'nodejs20.x',
        memory: 128,
      },
    },
    {
      id: 'fn-save',
      tileIndex: 25,
      type: 'lambda',
      name: 'FN-SaveResponse',
      config: {
        functionName: 'curifoSaveResponse',
        runtime: 'nodejs24.x',
        memory: 128,
      },
    },
    // --- データベース層 (Row 5) ---
    {
      id: 'ddb-main',
      tileIndex: 31,
      type: 'dynamodb',
      name: 'DDB-MainTable',
      config: {
        tableName: 'Curifo_main_table',
        partitionKey: 'userID (S)',
        sortKey: 'surveyID (S)',
        billingMode: 'PAY_PER_REQUEST',
        itemCount: 96,
      },
    },
    {
      id: 'ddb-mapping',
      tileIndex: 34,
      type: 'dynamodb',
      name: 'DDB-Mapping',
      config: {
        tableName: 'CurifoMapping',
        partitionKey: 'ping_number (S)',
        billingMode: 'PAY_PER_REQUEST',
        itemCount: 17,
      },
    },
  ],
  connections: [
    { id: 'c1', from: 'cf-user', to: 's3-user', type: 'origin', label: 'SPAホスティング' },
    { id: 'c2', from: 'cf-biz', to: 's3-biz', type: 'origin', label: '管理SPAホスティング' },
    { id: 'c3', from: 'cf-user', to: 'api-search', type: 'api', label: 'HTTP APIコール' },
    { id: 'c4', from: 'cognito-auth', to: 'api-search', type: 'auth', label: 'JWT認証ガード' },
    { id: 'c5', from: 'api-search', to: 'fn-search', type: 'integration', label: 'Lambda統合' },
    { id: 'c6', from: 'api-agent', to: 'fn-agent', type: 'integration', label: 'AIエンジン統合' },
    { id: 'c7', from: 'fn-search', to: 'ddb-main', type: 'data', label: 'アンケート読取/検索' },
    { id: 'c8', from: 'fn-agent', to: 'ddb-main', type: 'data', label: 'AI分析データ同期' },
    { id: 'c9', from: 'fn-save', to: 'ddb-main', type: 'data', label: '回答データ書込' },
    { id: 'c10', from: 'fn-mapping', to: 'ddb-mapping', type: 'data', label: '短縮URL解決' },
  ],
};
