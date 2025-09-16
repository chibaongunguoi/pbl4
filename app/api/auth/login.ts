import type { NextApiRequest, NextApiResponse } from 'next'
// import { signIn } from '@/auth'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { email, password } = req.body;
    console.log(email, password);
    res.status(200).json({ success: true })
}