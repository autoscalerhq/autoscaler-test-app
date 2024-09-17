import React, {FormEvent, useEffect, useState} from "react";


export function QueueTab() {
    const [pending, setPending] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
    const [avgResponseTime, setAvgResponseTime] = useState<number | null>(null);
    const [latency, setLatency] = useState(1000);
    const [lastStartTime, setLastStartTime] = useState<number | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:8080/queueCompletedEvents');

        eventSource.onopen = () => {
            console.log("Connection to server opened.");
            setConnected(true);
        }

        eventSource.onmessage = (event: MessageEvent) => {
            console.log(event.data)
            const currentTime = Date.now();
            const responseTime = currentTime - (lastStartTime ?? 0);

            if (event.data === "job_completed") {
                setPending((prev) => prev - 1);
                setCompleted((prev) => prev + 1);
                setLastResponseTime(responseTime);
                setAvgResponseTime((prevAvg: number | null) => {
                    if (prevAvg === null) return responseTime;
                    return (prevAvg + responseTime!) / 2;
                });
            }
        };
        eventSource.onerror = (error) => {
            console.error("EventSource encountered an error:", error);
        };
        return () => {
            console.log("Closing connection to server.");
            setConnected(false);
            eventSource.close();
        }}, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);


        const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setPending((prev) => prev + 1);
            setLastStartTime(Date.now());
            await fetch('/api/queue',
                {
                    method: "POST",
                    body: JSON.stringify({
                        "latency": latency
                    }),
                });
        };

        return (
            <div>
                <p>
                    Use the form below to insert items in the queue with a configurable processing time.
                    Depending on your server capacity, you should start to see a slow-down due to the amount of items in
                    the queue.
                </p>

                <div className="border-t pt-12">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-10">
                            <table className="divide-gray-300">
                                <tbody>
                                <tr>
                                    <td className="whitespace-nowrap py-1 font-semibold">Pending items in queue:</td>
                                    <td className="whitespace-nowrap pl-4 py-1 ">{pending}</td>
                                </tr>
                                <tr>
                                    <td className="whitespace-nowrap py-1 font-semibold">Processed items in queue:
                                    </td>
                                    <td className="whitespace-nowrap pl-4 py-1">{completed}</td>
                                </tr>
                                <tr>
                                    <td className="whitespace-nowrap py-1 font-semibold">Last job pick up time:
                                    </td>
                                    <td className="whitespace-nowrap pl-4 py-1">{lastResponseTime !== null ? `${lastResponseTime} ms` : "N/A"}</td>
                                </tr>
                                <tr>
                                    <td className="whitespace-nowrap py-1 font-semibold">Avg job pick up time:</td>
                                    <td className="whitespace-nowrap pl-4 py-1">{avgResponseTime !== null ? `${avgResponseTime.toFixed(2)} ms` : "N/A"}</td>
                                </tr>
                                </tbody>
                            </table>

                            <div>
                                <label style={{fontSize: '20px'}} className="block text-sm font-medium">
                                    How long should it take each job to process in the queue?
                                </label>
                                <div style={{display: 'flex', justifyContent: 'space-around'}} className="mt-2">
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="latency"
                                                value={1000}
                                                checked={latency === 1000}
                                                onChange={(e) => setLatency(parseInt(e.target.value))
                                                }
                                            />
                                            1 sec
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="latency"
                                                value={5000}
                                                checked={latency === 5000}
                                                onChange={(e) => setLatency(parseInt(e.target.value))}
                                            />
                                            5 sec
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="latency"
                                                value={10000}
                                                checked={latency === 10000}
                                                onChange={(e) => setLatency(parseInt(e.target.value))}
                                            />
                                            10 sec
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="latency"
                                                value={25000}
                                                checked={latency === 25000}
                                                onChange={(e) => setLatency(parseInt(e.target.value))}
                                            />
                                            25 sec
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button  disabled={!connected} type="submit" className={ connected ? "px-4 py-2 bg-blue-500 text-white rounded" : "px-4 py-2 bg-gray-300 text-gray-700 rounded"}>
                                    Send request
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );

    }