import React, {
    createContext,
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';

type heightType = { bodyHeight: number; documentHeight: number };
type windowDimensionsType = {
    windowDimensions: heightType;
    recalcDimensions: () => void;
};
const getWindowHeight = (): heightType => ({
    bodyHeight: window.document.body.clientHeight,
    documentHeight: window.document.documentElement.clientHeight,
});

const WindowContext = createContext<windowDimensionsType | undefined>(
    undefined,
);

export const WindowProvider: FunctionComponent = ({ children }) => {
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

    const recalcDimensions = useCallback(() => {
        setWindowDimensions(getWindowHeight());
    }, []);

    return (
        <WindowContext.Provider value={{ windowDimensions, recalcDimensions }}>
            {children}
        </WindowContext.Provider>
    );
};

export const useWindowDimensions = () => {
    const context = useContext(WindowContext);

    if (context === undefined) {
        throw new Error('useFirebase must be used within a WindowProvider');
    }

    return context;
};
