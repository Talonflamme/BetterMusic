import React from 'react';

const NoFiles: React.FC<NoFilesProps> = ({ }) => {
    return (
        <div id="no-files" className="flex-center">No Files<br />
            <span>¯\_(ツ)_/¯</span>
        </div>
    )
};

interface NoFilesProps {

}

export default NoFiles;
