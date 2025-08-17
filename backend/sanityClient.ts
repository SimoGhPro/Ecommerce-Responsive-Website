import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: '8yq0hl58', 
    dataset: 'jolof_data',
    apiVersion: '2025-08-04', 
    useCdn: false,               
    token: process.env.SANITY_API_TOKEN, 
});
