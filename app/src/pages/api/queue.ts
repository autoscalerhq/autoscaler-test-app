import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await fetch("http://localhost:8080/insertToQueue", {
        method: "POST",
        body: req.body,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(() => {
            res.status(200).json({message: "Request sent"});
        })
        .catch((error) => {
            res.status(500).json({message: error});
        });
}