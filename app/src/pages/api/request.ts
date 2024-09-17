import type { NextApiRequest, NextApiResponse } from "next";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    fetch("http://localhost:8080/request", {
        method: "POST",
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


// create a second section that puts directly into the queue.
// we want request of queue to the worker
// frontend to api, api puts x number into  queue
// 2 queues - direct queue and api queue.