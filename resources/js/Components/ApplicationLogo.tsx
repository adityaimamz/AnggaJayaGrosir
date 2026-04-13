import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo%20AJ.png"
            alt="Angga Jaya Logo"
        />
    );
}
