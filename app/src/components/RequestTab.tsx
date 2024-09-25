import React, {FormEvent, useState} from "react";

export function RequestTab() {
    const [pending, setPending] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
    const [avgResponseTime, setAvgResponseTime] = useState<number | null>(null);
    const [latency, setLatency] = useState(1000); // default 1 sec latency


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPending((prev) => prev + 1);
        const startTime = Date.now();
        await fetch("http://localhost:8080/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        setTimeout(() => {
            const responseTime = Date.now() - startTime;
            setPending((prev) => prev - 1);
            setCompleted((prev) => prev + 1);
            setLastResponseTime(responseTime);

            setAvgResponseTime((prevAvg: number | null) => {
                if (prevAvg === null) return responseTime;
                return (prevAvg + responseTime) / 2;
            });
        }, latency);
    };

    return (
        <div>
            <p>
                Use the form below to trigger requests with a configurable processing time.
                Depending on your server capacity, you should start to see a slow-down due to
                request queueing.
            </p>
            <p>
                <br/>
                If you’ve configured autoscaling, this should trigger an upscale.
            </p>
            <div className="border-t pt-12">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-10">
                        <table className="divide-gray-300">
                            <tbody>
                            <tr>
                                <td className="whitespace-nowrap py-1 font-semibold">Pending requests:</td>
                                <td className="whitespace-nowrap pl-4 py-1 ">{pending}</td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap py-1 font-semibold">Completed requests:
                                </td>
                                <td className="whitespace-nowrap pl-4 py-1">{completed}</td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap py-1 font-semibold">Last response time:
                                </td>
                                <td className="whitespace-nowrap pl-4 py-1">{lastResponseTime !== null ? `${lastResponseTime} ms` : "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap py-1 font-semibold">Avg response time:</td>
                                <td className="whitespace-nowrap pl-4 py-1">{avgResponseTime !== null ? `${avgResponseTime.toFixed(2)} ms` : "N/A"}</td>
                            </tr>
                            </tbody>
                        </table>

                        <div>
                            <label style={{fontSize: '20px'}} className="block text-sm font-medium">
                                How long do you want each request to take?
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
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                                Send request
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}