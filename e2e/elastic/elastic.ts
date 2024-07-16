import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const mappingFilePath = path.resolve(__dirname, './clothinghome_mappings.json');
const dataFilePath = path.resolve(__dirname, './clothinghome_products.jsonl');
const elasticUrl = process.env.ELASTIC_URL || 'http://localhost:9200';
const indexName = 'search-indexer-1';
const indexAlias = 'search-indexer';

export const setupElastic = async () => {
  await setupIndex();
  await setupAlias();
  await setupData();
};

export const setupIndex = async () => {
  const elasticIndexGetResponse = await getIndex(elasticUrl, indexName);
  if (elasticIndexGetResponse.status === 404) {
    try {
      const elasticIndexPutResponse = await createIndex(elasticUrl, indexName);
      if (elasticIndexPutResponse.status !== 200) {
        console.error('Error creating index', elasticIndexPutResponse);
      } else {
        console.log(`Index ${indexName} created`);
      }
    } catch (error) {
      console.error('Error creating index', error);
    }
  } else {
    console.log(`Index ${indexName} already exists`);
  }
};

export const setupAlias = async () => {
  const elasticIndexAliasGetResponse = await getIndexAlias(
    elasticUrl,
    indexAlias
  );
  if (elasticIndexAliasGetResponse.status === 404) {
    const elasticIndexAliasPutResponse = await createIndexAlias(
      elasticUrl,
      indexAlias,
      indexName
    );
    if (elasticIndexAliasPutResponse.status !== 200) {
      console.error('Error creating alias', elasticIndexAliasPutResponse);
    } else {
      console.log(`Alias ${indexAlias} created`);
    }
  } else {
    console.log(`Alias ${indexAlias} already exists`);
  }
};

export const setupData = async () => {
  const response = await searchIndex();
  const data = await response.json();

  if (data.hits.total.value === 0) {
    const uploadResponse = await uploadData();
    if (uploadResponse.status !== 200) {
      console.error('Error uploading data', uploadResponse);
    } else {
      console.log('Data uploaded');
    }
  } else {
    console.log('Data already exists');
  }
};

export const searchIndex = async (_query: string = '') => {
  return fetch(`${elasticUrl}/${indexName}/_search?typed_keys=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const uploadData = async () => {
  const data = await fs.readFile(dataFilePath, 'utf-8');

  return fetch(`${elasticUrl}/${indexName}/_bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  });
};

export const getIndex = async (elasticUrl: string, indexName: string) => {
  return fetch(`${elasticUrl}/${indexName}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const createIndex = async (elasticUrl: string, indexName: string) => {
  const mapping = await fs.readFile(mappingFilePath, 'utf-8');
  console.log(
    `Creating index ${indexName} with mapping from ${mappingFilePath}`
  );
  return fetch(`${elasticUrl}/${indexName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: mapping,
  });
};

export const getIndexAlias = async (elasticUrl: string, indexAlias: string) => {
  return fetch(`${elasticUrl}/_alias/${indexAlias}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createIndexAlias = async (
  elasticUrl: string,
  indexAlias: string,
  indexName: string
) => {
  return fetch(`${elasticUrl}/_alias/${indexAlias}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actions: [
        {
          add: {
            index: indexName,
            alias: indexAlias,
          },
        },
      ],
    }),
  });
};
