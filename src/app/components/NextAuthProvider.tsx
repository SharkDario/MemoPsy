// app/components/NextAuthProvider.tsx
'use client'; // ¡Importante! Este componente debe ser cliente

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function NextAuthProvider({ children }: Props) {
    // SessionProvider necesita ser un Client Component
    return <SessionProvider>{children}</SessionProvider>;
}