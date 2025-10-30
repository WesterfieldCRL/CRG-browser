/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        // Use 'backend' service name in Docker, 'localhost' for local dev
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
        return [
            {
                source: '/api/:path*/',
                destination: `${apiUrl}/:path*/`,
            },
            {
                source: '/api/:path*',
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
    skipTrailingSlashRedirect: true,
    output: "standalone",
};

export default nextConfig;
