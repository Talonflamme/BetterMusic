import React, { useState } from 'react';
import ContentTab from './ContentTab';
import DownloadPage from './DownloadPage/DownloadPage';
import FilePage from './FilePage/FilePage';
import SettingsPage from './SettingsPage/SettingsPage';
import { shell } from 'electron';

const MainContentTabLink: React.FC<MainContentTabLinkProps> = ({ className, children, id, setCurrentTab }) => {
    const onClick = () => {
        setCurrentTab(id);
    }

    return <span className={`tab-link flex-center ${className}`} data-tab={id} onClick={onClick}>
        {children}
    </span>
}

const MainContent: React.FC<MainContentProps> = ({ }) => {
    const [currentTab, setCurrentTab] = useState(0); // defines which tab should be shown e.g: 0 -> 'Files'
    const [fileReloadToggle, setFileReloadToggle] = useState<boolean>(false);

    const reloadFiles = () => {
        setFileReloadToggle(!fileReloadToggle);
    }

    const openLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        shell.openExternal(e.currentTarget.href);
    }

    return (
        <div id="content">
            <header id="main-tabs" className="flex-center">
                <MainContentTabLink id={0} setCurrentTab={setCurrentTab}>Files</MainContentTabLink>
                <MainContentTabLink id={1} setCurrentTab={setCurrentTab}>Download</MainContentTabLink>
                <span className="flex-center">
                    <a className="tab-link icon" href="https://www.github.com/Talonflamme" target="_blank" rel="noreferer" tabIndex={-1} onClick={openLink}>
                        <svg viewBox="0 0 24 24" id="github-icon" fill="currentColor">
                            <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27" />
                        </svg>
                    </a>
                    <div style={{ width: 16 }} />
                    <MainContentTabLink className="icon" id={2} setCurrentTab={setCurrentTab}>
                        <svg viewBox="0 0 24 24" id="settings-icon" fill="currentColor">
                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                    </MainContentTabLink>
                </span>
            </header>

            <div id="tab-wrapper" className="flex-center">
                <ContentTab id={0} currentTab={currentTab}>
                    <FilePage toggleState={fileReloadToggle} />
                </ContentTab>
                <ContentTab id={1} currentTab={currentTab}>
                    <DownloadPage reloadFiles={reloadFiles} />
                </ContentTab>
                <ContentTab id={2} currentTab={currentTab}>
                    <SettingsPage reloadFiles={reloadFiles} />
                </ContentTab>
            </div>
        </div>
    )
};

interface MainContentProps {

}

interface MainContentTabLinkProps {
    className?: string,
    children?: React.ReactNode,
    id: number,
    setCurrentTab: (tab: number) => void
}

MainContentTabLink.defaultProps = {
    className: ""
}

export default MainContent;
