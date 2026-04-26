"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorLogger() {
    const pathname = usePathname();
    const lastLoggedPath = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate logging for the same page in quick succession or strict mode double mounting
        if (lastLoggedPath.current === pathname) return;
        
        lastLoggedPath.current = pathname;

        const logVisit = async () => {
            try {
                await fetch("/api/log-visit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ page: pathname }),
                });
            } catch (e) {
                console.error("Failed to log visit", e);
            }
        };

        logVisit();
    }, [pathname]);

    return null; // This component does not render anything
}
