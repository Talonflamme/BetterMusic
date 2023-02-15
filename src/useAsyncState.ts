import React, { useEffect, useState } from 'react';


export default function useAsyncState<T>(func: () => Promise<T>, dependencies: React.DependencyList, defaultValue: T = null): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        func().then(setValue).catch(console.error);
    }, dependencies);

    return [value, setValue];
}
