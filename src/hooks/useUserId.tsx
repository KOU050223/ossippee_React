import { useState, useEffect } from 'react';

export const useUserId = () => {
    const [userId, setUserId] = useState(() => {
        return localStorage.getItem('userId') || ' ';
    });

    useEffect(() => {
        if (userId) {
            localStorage.setItem('userId', userId);
        } else {
            localStorage.removeItem('userId');
        }
    }, [userId]);

    return {
        userId,
        setUserId,
    };
};