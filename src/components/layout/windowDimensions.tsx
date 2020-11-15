import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type heightType = { bodyHeight: number; documentHeight: number };

const getWindowHeight = (): heightType => ({
    bodyHeight: window.document.body.clientHeight,
    documentHeight: window.document.documentElement.clientHeight,
});

export const useWindowDimensions = (): heightType => {
    const location = useLocation();
    const [windowDimensions, setWindowDimensions] = useState(getWindowHeight());

    useEffect((): (() => void) => {
        const handleResize = (): void => {
            setWindowDimensions(getWindowHeight());
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setWindowDimensions(getWindowHeight());
    }, [location]);

    return windowDimensions;
};

export default useWindowDimensions;
