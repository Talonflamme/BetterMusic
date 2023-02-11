import React from 'react';
import { useFiles } from '../../Files';

const FilePage: React.FC<FilePageProps> = ({ }) => {
    const files = useFiles();
    console.log(files);

    return (
        <div>FilePage</div>
    )
};

interface FilePageProps {

}

export default FilePage;
