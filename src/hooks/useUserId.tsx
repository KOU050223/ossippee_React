import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useUserId = () => {
    const [userId, setUserId] = useState(() => {
        const stored = localStorage.getItem('userId');
        if (stored && stored !== 'null') {
            return stored;
        }
        // 新しいUUIDを生成
        const newId = uuidv4();
        localStorage.setItem('userId', newId);
        return newId;
    });

    useEffect(() => {
        if (userId && userId !== 'null') {
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