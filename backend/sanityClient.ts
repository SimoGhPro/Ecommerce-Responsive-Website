import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID, 
    dataset: process.env.SANITY_STUDIO_DATASET,
    apiVersion: '2025-08-04', 
    useCdn: false,               
    token: process.env.SANITY_API_TOKEN, 
});
