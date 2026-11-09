/** @type {import('next').NextConfig} */
const nextConfig = {
  // The PDF was served as /resume.pdf until Nov 2026; links already sent out still use it.
  async redirects() {
    return [{ source: "/resume.pdf", destination: "/shlok_thakkar_resume.pdf", permanent: true }];
  },
};

module.exports = nextConfig;
