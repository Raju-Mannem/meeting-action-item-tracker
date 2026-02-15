'use client';

import { ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo-client';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: ReactNode }) {
    const client = useMemo(() => apolloClient, []);

    return (
        <SessionProvider>
            <ApolloProvider client={client}>
                <Provider store={store}>
                    {children}
                </Provider>
            </ApolloProvider>
        </SessionProvider>
    );
}
