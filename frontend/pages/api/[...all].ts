import { NextApiRequest, NextApiResponse } from "next"
import httpProxyMiddleware from "next-http-proxy-middleware"

export const config = {
  api: {
    bodyParser: false,
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  const proxy = httpProxyMiddleware(req, res, {
    target: process.env.API_HOST,
    changeOrigin: true,
  })
  return proxy
}
