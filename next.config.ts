import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Campus Ambassadors live on Represent (Shayna, 20 Oct 2026: route them there, not this website).
      { source: "/ambassadors", destination: "https://represent.estherfundsfoundation.org", permanent: false },
      { source: "/ambassadors/:path*", destination: "https://represent.estherfundsfoundation.org", permanent: false },
      { source: "/apply-with-me/college.", destination: "/apply-with-me/college", permanent: false },
      { source: "/apply-with-me.", destination: "/apply-with-me", permanent: false },
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
