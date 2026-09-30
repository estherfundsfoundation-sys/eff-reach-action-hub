import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // The Scholarship Walk: a static page kept in MyEFF (public/scholarshipwalk), served here.
      { source: "/scholarshipwalk", destination: "https://my.estherfundsfoundation.org/scholarshipwalk/index.html" },
    ];
  },
};

export default nextConfig;
