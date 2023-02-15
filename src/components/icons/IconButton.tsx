import React from 'react';

const IconButton: React.FC<IconButtonProps> = ({ className, ...props }) => {

    const cls = (className ?? "") + " icon-button btn";
    return (
        <button className={cls} {...props} />
    )
};

interface IconButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
}

export default IconButton;
