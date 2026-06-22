"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const publicPaths = ['/login', '/register'];
        const token = localStorage.getItem('breezy_jwt');

        if (!token && !publicPaths.includes(pathname)) {
            router.push('/login');
        } else if (token && publicPaths.includes(pathname)) {
            router.push('/');
        }
    }, [pathname, router]);

    if (!mounted) {
        return null; // Évite le "hydration mismatch"
    }

    const publicPaths = ['/login', '/register'];
    const token = localStorage.getItem('breezy_jwt');
    
    if (!token && !publicPaths.includes(pathname)) {
        return null; // Redirection en cours
    }

    if (token && publicPaths.includes(pathname)) {
        return null; // Redirection en cours
    }

    return children;
}
