import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // REACH no longer lists ambassadors (Shayna, 12 Oct 2026). EFF Campus Ambassadors live in their own portal.
      { source: "/ambassadors", destination: "https://represent.estherfundsfoundation.org/ambassador", permanent: false },
      { source: "/ambassadors/:slug*", destination: "https://represent.estherfundsfoundation.org/ambassador", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // The Scholarship Walk: a static page kept in MyEFF (public/scholarshipwalk), served here.
      { source: "/scholarshipwalk", destination: "https://my.estherfundsfoundation.org/scholarshipwalk/index.html" },
    ];
  },
};

export default nextConfig;
