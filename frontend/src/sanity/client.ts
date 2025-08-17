import { createClient } from 'next-sanity';

export const client = createClient({
    projectId: '8yq0hl58', 
    dataset: 'jolof_data',
    apiVersion: '2025-08-04', 
    useCdn: false,    
    token: 'skUnDsoH0fYKEzEGlerDLJsn4ztv3i5duHephjg9by9JdaXe7ZU0xZgxGJx8VT9WbUIL0H3Y8wSG9dtorZ0ixmXgDArndSJXZaG5JmqEp3Wwb5zpbonLII4bwTYnI3LHqL72bu7bxBqYHOZHLAMgo7cD9qsh7DUzTtixVtpF6Q5mKJNMdzSB'
});