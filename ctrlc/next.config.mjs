/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
};

export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     webpack: (config, { isServer }) => {
//       if (isServer) {
//         config.externals.push('zeromq'); // Exclude zeromq from Webpack bundle
//       }
//       return config;
//     },
//   };
  
//   export default nextConfig;