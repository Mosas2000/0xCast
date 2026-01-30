import React from 'react';

interface SEOMetaProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
}

/**
 * SEO metadata component for dynamic head tag updates, ensuring high discoverability in SERPs and social streams.
 * Note: In a production app, use 'react-helmet-async' or Next.js 'Head'.
 */
export const SEOMeta: React.FC<SEOMetaProps> = ({ title, description, image, url }) => {
    const siteTitle = `${title} | 0xCast Prediction Engine`;
    const siteUrl = url || 'https://0xcast.com';
    const siteImage = image || 'https://0xcast.com/default-og.png';

    // This would typically update the document head
    React.useEffect(() => {
        document.title = siteTitle;

        // Manage meta tags dynamically
        const updateMeta = (name: string, content: string, property: boolean = false) => {
            let el = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                if (property) el.setAttribute('property', name);
                else el.setAttribute('name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        updateMeta('description', description);
        updateMeta('og:title', siteTitle, true);
        updateMeta('og:description', description, true);
        updateMeta('og:image', siteImage, true);
        updateMeta('og:url', siteUrl, true);
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', siteTitle);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', siteImage);
    }, [siteTitle, description, siteImage, siteUrl]);

    return null; // Side effect component
};
