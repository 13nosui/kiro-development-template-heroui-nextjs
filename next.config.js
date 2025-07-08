const path = require("path"); // ✅ これを追加！

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  // 動的ルートの設定
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.figma.com",
              "frame-src 'self' https://*.firebase.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          // セキュリティヘッダー
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // HTTPS環境での追加セキュリティヘッダー
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'https'
          }
        ]
      }
    ];
  },
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: require.resolve("@svgr/webpack"),
          options: {
            icon: true,
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "removeViewBox",
                  active: false,
                },
              ],
            },
            titleProp: true,
            ref: true,
          },
        },
      ],
      type: "javascript/auto",
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
